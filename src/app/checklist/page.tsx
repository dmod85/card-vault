"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Folder, Search, Box, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChecklistHomePage() {
  const [sets, setSets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    fetch("/api/data/sets")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load datasets");
        return res.json();
      })
      .then((data) => {
        setSets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setError(true);
      });
  }, []);

  // For the dashboard, only show root Master Sets (e.g. they don't have -insert-name appended)
  // Currently, we know 2026-topps-series-1 is the only master set.
  const rootSets = sets.filter((s) => s.id === "2026-topps-series-1");
  
  const filteredSets = rootSets.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-20">
      <div className="bg-blue text-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="p-1 hover:bg-blue-light rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold flex-1">Set Checklists</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
            title="Sign Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search master collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-blue-light/50 border border-blue-light text-white placeholder:text-slate-300 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-maize shadow-inner"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-maize border-t-blue rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm">
            Failed to load checklist sets. Is the data folder populated?
          </div>
        )}

        {!loading && !error && filteredSets.length > 0 && (
          <section>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Box size={16} /> Master Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map(set => (
                <Link 
                  key={set.id} 
                  href={`/checklist/${set.id}`}
                  className="group block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:border-blue/50 transition-all active:scale-[0.98]"
                >
                  <div className="h-40 w-full bg-gradient-to-tr from-slate-200 to-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-200/60">
                    <Folder size={84} className="text-blue/10 group-hover:scale-[1.15] group-hover:-rotate-3 group-hover:text-blue/20 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 text-white flex flex-col items-start gap-1">
                       <div className="bg-maize text-blue text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase">{set.brand}</div>
                       <div className="text-xl font-black text-slate-50 tracking-tight leading-none">{set.year} Series 1</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-blue text-lg leading-tight mb-3 tracking-tight">{set.name}</h2>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {set.sport}
                      </span>
                      <span className="bg-slate-100/80 text-blue border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                        View Catalog
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && filteredSets.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-500">No Master Sets Found</h3>
            <p className="text-sm text-slate-400 mt-1">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
