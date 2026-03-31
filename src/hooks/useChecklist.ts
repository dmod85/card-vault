import { createClient, User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type ChecklistState = Record<string, Record<string, Record<string, number>>>;

export function useChecklist() {
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      // 1. Check Auth 
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        if (active) router.push("/login");
        return;
      }
      
      const currentUser = session.user;
      if (active) setUser(currentUser);

      // 2. Load from Supabase DB
      const { data: dbCollections, error: dbError } = await supabase
        .from("user_collections")
        .select("*");

      if (dbError) {
        console.error("Failed to load cloud collections", dbError);
      }

      // Rebuild state tree: { "setId": { "cardId": { "parallelId": quantity } } }
      const cloudState: ChecklistState = {};
      
      if (dbCollections && dbCollections.length > 0) {
        for (const row of dbCollections) {
          if (!cloudState[row.set_id]) cloudState[row.set_id] = {};
          if (!cloudState[row.set_id][row.card_id]) cloudState[row.set_id][row.card_id] = {};
          cloudState[row.set_id][row.card_id][row.parallel_id] = row.quantity;
        }
      }

      // 3. LocalStorage Migration Check (Sync local un-synced data to Cloud once)
      const savedLocal = localStorage.getItem("cardvault_checklist");
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          const migrations = [];

          for (const sId in parsed) {
            for (const cId in parsed[sId]) {
              const val = parsed[sId][cId];
              // Handle old "base-only" flat integer formatting OR new object formatting
              if (typeof val === "number") {
                if (!cloudState[sId]?.[cId]?.["base"]) {
                  if (!cloudState[sId]) cloudState[sId] = {};
                  if (!cloudState[sId][cId]) cloudState[sId][cId] = {};
                  cloudState[sId][cId]["base"] = val;

                  migrations.push({
                    user_id: currentUser.id,
                    set_id: sId,
                    card_id: cId,
                    parallel_id: "base",
                    quantity: val
                  });
                }
              } else {
                for (const pId in val) {
                  const qty = (val as Record<string, number>)[pId];
                  if (!cloudState[sId]?.[cId]?.[pId] && qty > 0) {
                     if (!cloudState[sId]) cloudState[sId] = {};
                     if (!cloudState[sId][cId]) cloudState[sId][cId] = {};
                     cloudState[sId][cId][pId] = qty;

                     migrations.push({
                       user_id: currentUser.id,
                       set_id: sId,
                       card_id: cId,
                       parallel_id: pId,
                       quantity: qty
                     });
                  }
                }
              }
            }
          }

          if (migrations.length > 0) {
            // Bulk insert to Cloud
            await supabase.from("user_collections").upsert(migrations, {
              onConflict: 'user_id, set_id, card_id, parallel_id'
            });
            console.log(`Migrated ${migrations.length} local items to Supabase cloud!`);
          }

          // Clear local storage so we never migrate again
          localStorage.removeItem("cardvault_checklist");
        } catch (e) {
          console.error("Failed to parse local storage migration:", e);
        }
      }

      if (active) {
        setChecklist(cloudState);
        setIsLoaded(true);
      }
    };

    loadData();

    return () => { active = false; };
  }, [router]);

  // Async function to increment/decrement from UI
  const updateQuantity = async (setId: string, cardId: string, parallelId: string, delta: number) => {
    if (!user) return; // Prevent action if not authenticated

    // 1. Optimistic UI update instantly
    setChecklist((prev) => {
      const setCards = prev[setId] || {};
      const cardParallels = setCards[cardId] || {};
      const currentQty = cardParallels[parallelId] || 0;
      const newQty = Math.max(0, currentQty + delta);

      const nextCardParallels = { ...cardParallels };
      
      if (newQty === 0) {
        delete nextCardParallels[parallelId];
      } else {
        nextCardParallels[parallelId] = newQty;
      }

      const nextSetCards = { ...setCards };
      
      if (Object.keys(nextCardParallels).length === 0) {
        delete nextSetCards[cardId];
      } else {
        nextSetCards[cardId] = nextCardParallels;
      }

      return {
        ...prev,
        [setId]: nextSetCards,
      };
    });

    // 2. Perform background network sync
    const currentQty = checklist[setId]?.[cardId]?.[parallelId] || 0;
    const computedNewQty = Math.max(0, currentQty + delta);

    if (computedNewQty === 0) {
      // Delete the row entirely to save space if 0
      await supabase
        .from("user_collections")
        .delete()
        .match({
           user_id: user.id,
           set_id: setId,
           card_id: cardId,
           parallel_id: parallelId
        });
    } else {
      // Upsert new quantity
      await supabase
        .from("user_collections")
        .upsert({
           user_id: user.id,
           set_id: setId,
           card_id: cardId,
           parallel_id: parallelId,
           quantity: computedNewQty
        }, { onConflict: 'user_id, set_id, card_id, parallel_id' });
    }
  };

  /**
   * Get progress for a specific parallel filter (or "all")
   */
  const getSetProgress = (setId: string, totalCardsInSet: number, activeParallelId: string = "base") => {
    const setCards = checklist[setId] || {};
    let uniqueCollected = 0;
    let totalCollected = 0;

    for (const cardId in setCards) {
      const cardParallels = setCards[cardId];
      const qty = cardParallels[activeParallelId] || 0;
      if (qty > 0) {
        uniqueCollected += 1;
        totalCollected += qty;
      }
    }

    const percentComplete = totalCardsInSet > 0 ? (uniqueCollected / totalCardsInSet) * 100 : 0;

    return {
      uniqueCollected,
      totalCollected,
      percentComplete: Math.min(100, percentComplete),
      isComplete: uniqueCollected >= totalCardsInSet
    };
  };

  return {
    checklist,
    isLoaded,
    updateQuantity,
    getSetProgress
  };
}
