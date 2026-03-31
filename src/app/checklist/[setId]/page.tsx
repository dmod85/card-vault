"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Search, CheckCircle2, Plus, Minus, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { useChecklist } from "@/hooks/useChecklist";

interface Card {
  id: string;
  playerName: string;
  cardNumber: string;
  team?: string;
}

interface Parallel {
  id: string;
  name: string;
  odds: string;
}

interface Subset {
  id: string;
  name: string;
  brand: string;
  year: string;
  cards: Card[];
  baseParallels?: Parallel[];
}

interface SubsetInfo {
  id: string;
  name: string;
}

export default function SetChecklistPage() {
  const params = useParams();
  const masterSetId = params.setId as string;
  
  const { checklist, isLoaded, updateQuantity, getSetProgress } = useChecklist();
  
  const [availableSubsets, setAvailableSubsets] = useState<SubsetInfo[]>([]);
  const [activeSubsetId, setActiveSubsetId] = useState<string>(masterSetId);
  const [setData, setSetData] = useState<Subset | null>(null);
  
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "missing" | "owned">("all");
  const [activeParallel, setActiveParallel] = useState<string>("base");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch ALL subsets that belong to this Master Product
  useEffect(() => {
    fetch("/api/data/sets")
      .then(res => res.json())
      .then(data => {
        // Find all checklists associated with this Product prefix
        const subsets = data.filter((s: SubsetInfo) => s.id.startsWith(masterSetId));
        setAvailableSubsets(subsets);
      })
      .catch(err => {
        console.error("Could not load subsets index", err);
      });
  }, [masterSetId]);

  // 2. Fetch the actual card data whenever activeSubsetId changes
  useEffect(() => {
    if (!activeSubsetId) return;
    setLoading(true);
    
    fetch(`/api/data/sets/${activeSubsetId}`)
      .then(res => {
        if (!res.ok) throw new Error("Set not found");
        return res.json();
      })
      .then(data => {
        setSetData(data);
        setActiveParallel("base"); // Reset parallel viewing mode when entering a new subset
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error(err);
        setError("Could not load set data.");
        setLoading(false);
      });
  }, [activeSubsetId]);

  if (error) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Oops!</h2>
        <p className="text-slate-500">{error}</p>
        <Link href="/checklist" className="mt-4 px-4 py-2 bg-blue text-white rounded-lg">Go Back</Link>
      </div>
    );
  }

  if (loading || !setData || !isLoaded) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-maize border-t-blue rounded-full animate-spin"></div>
          <p className="mt-4 text-blue font-semibold">Loading specific checklist...</p>
        </div>
      </div>
    );
  }

  // Calculate Progress and get Parallel Data for the ACTIVE SUBSET
  const progress = getSetProgress(activeSubsetId, setData.cards.length, activeParallel);
  const parallels = setData.baseParallels || [{ id: "base", name: "Base", odds: "1:1" }];
  const activeParallelName = parallels.find((p: Parallel) => p.id === activeParallel)?.name || "Base";

  const masterProductTitle = availableSubsets.find(s => s.id === masterSetId)?.name || "Master Collection View";

  // Filter Cards based on search/mode FOR THE ACTIVE SUBSET & ACTIVE PARALLEL
  const filteredCards = setData.cards.filter((card: Card) => {
    if (search && !card.playerName.toLowerCase().includes(search.toLowerCase()) && !card.cardNumber.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    const qty = checklist[activeSubsetId]?.[card.id]?.[activeParallel] || 0;
    
    if (filterMode === "owned" && qty === 0) return false;
    if (filterMode === "missing" && qty > 0) return false;
    
    return true;
  });

  const toggleExpand = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-20">
      <div className="bg-blue text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/checklist" className="p-1 hover:bg-blue-light rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex-1 truncate">
            <h1 className="text-sm text-blue-200 uppercase font-black tracking-widest leading-none">
              {setData.brand} {setData.year}
            </h1>
            <p className="text-lg font-bold truncate leading-tight tracking-tight mt-0.5">{masterProductTitle}</p>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-3xl font-black text-maize leading-none">{Math.round(progress.percentComplete)}%</span>
            <span className="text-xs text-blue-200 uppercase font-bold tracking-widest text-right">
              {progress.uniqueCollected} / {setData.cards.length}
              <br />
              {activeParallelName}
            </span>
          </div>
          <div className="h-2 w-full bg-blue-light/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-maize transition-all duration-500 rounded-full"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Dynamic Dual-Filter Dropdowns */}
        <div className="space-y-3">
          
          {/* Subsets & Inserts Dropdown */}
          {availableSubsets.length > 1 && (
            <div className="w-full bg-blue-light/30 border-2 border-slate-400/30 rounded-xl overflow-hidden px-3 relative h-14 flex items-center">
              <span className="text-[10px] text-slate-300 absolute top-1.5 left-3 uppercase font-black tracking-widest">
                Insert & Subset Filter
              </span>
              <Layers size={14} className="absolute left-3 top-[26px] text-maize opacity-80" />
              <select
                value={activeSubsetId}
                onChange={(e) => setActiveSubsetId(e.target.value)}
                className="w-full h-full bg-transparent text-white pt-4 pl-6 text-sm font-bold focus:outline-none appearance-none"
              >
                {availableSubsets.map(sub => (
                  <option key={sub.id} value={sub.id} className="text-slate-800 font-medium">
                    {sub.id === masterSetId ? "★ Master Base Set" : sub.name.replace(masterProductTitle + " - ", "")}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center mt-3 text-slate-300">
                <ChevronDown size={16} />
              </div>
            </div>
          )}

          {/* Parallel / Track Mode Filter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-blue-light/50 border border-blue-light rounded-xl overflow-hidden px-3 relative h-12 flex items-center shadow-inner">
              <span className="text-[9px] text-blue-200 absolute top-1 left-3 uppercase font-black tracking-widest">
                Parallel Display Mode
              </span>
              <select
                value={activeParallel}
                onChange={(e) => setActiveParallel(e.target.value)}
                className="w-full bg-transparent text-white pt-3 pr-4 text-[13px] font-bold focus:outline-none appearance-none truncate"
              >
                {parallels.map((p: Parallel) => (
                  <option key={p.id} value={p.id} className="text-slate-800 font-medium">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pt-2">
                <ChevronDown size={14} className="text-slate-200" />
              </div>
            </div>
          </div>

          <div className="flex bg-blue-light/30 rounded-xl p-1 shadow-inner">
             <button 
              onClick={() => setFilterMode("all")}
              className={`flex-1 py-1.5 text-[11px] font-black tracking-widest uppercase rounded-lg transition-all ${filterMode === "all" ? "bg-white text-blue shadow bg-opacity-100" : "text-slate-300 hover:text-white"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterMode("missing")}
              className={`flex-1 py-1.5 text-[11px] font-black tracking-widest uppercase rounded-lg transition-all ${filterMode === "missing" ? "bg-white text-blue shadow bg-opacity-100" : "text-slate-300 hover:text-white"}`}
            >
              Missing
            </button>
            <button 
              onClick={() => setFilterMode("owned")}
              className={`flex-1 py-1.5 text-[11px] font-black tracking-widest uppercase rounded-lg transition-all ${filterMode === "owned" ? "bg-white text-blue shadow bg-opacity-100" : "text-slate-300 hover:text-white"}`}
            >
              Owned
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Search by player or card #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-blue-light/50 border border-blue-light text-white placeholder:text-blue-100/50 rounded-xl py-2 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-maize shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500 font-bold uppercase tracking-widest">
          <span>{filteredCards.length} Cards</span>
          <div className="flex items-center gap-1.5 bg-slate-200/50 px-2.5 py-1 rounded-full text-slate-600 border border-slate-200">
            Total {activeParallelName}: <strong className="text-blue">{progress.totalCollected}</strong>
          </div>
        </div>

        <div className="space-y-3">
          {filteredCards.map((card: Card) => {
            const cardParallelsState = checklist[activeSubsetId]?.[card.id] || {};
            const activeQty = cardParallelsState[activeParallel] || 0;
            const isActiveOwned = activeQty > 0;
            const isExpanded = expandedCardId === card.id;
            
            // Total parallels owned for this specific card
            const totalParallelsForCard = Object.values(cardParallelsState).reduce((a, b) => a + b, 0);
            
            return (
              <div 
                key={card.id} 
                className={`bg-white rounded-xl border flex flex-col transition-all overflow-hidden ${
                  isActiveOwned ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.25)]" : "border-slate-200 shadow-sm"
                }`}
              >
                {/* Main Card Header Area (Reflects Active Parallel) */}
                <div className="p-3 flex gap-3">
                  {/* Card Checkmark (For Active Parallel) */}
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(activeSubsetId, card.id, activeParallel, isActiveOwned ? -activeQty : 1)}
                      className={`w-12 h-16 rounded border flex items-center justify-center transition-all ${
                        isActiveOwned 
                        ? "bg-green-500 border-green-600 text-white shadow-md transform scale-105" 
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300 hover:scale-[1.02]"
                      }`}
                    >
                      {isActiveOwned ? <CheckCircle2 size={24} className="text-white drop-shadow-sm" /> : <span className="text-xs font-black">#{card.cardNumber}</span>}
                    </button>
                    {isActiveOwned && <span className="text-[9px] font-black text-green-700 uppercase tracking-widest bg-green-100 px-1.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-green-200">Set</span>}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between">
                      <h3 className="font-extrabold text-blue text-sm leading-tight pr-2 text-balance">
                        {card.playerName}
                      </h3>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shadow-sm flex-shrink-0 border border-slate-200">
                        #{card.cardNumber}
                      </span>
                    </div>
                    {card.team && <p className="text-xs text-slate-500 truncate mt-0.5 font-semibold">{card.team}</p>}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                        activeParallel === 'base' ? 'text-slate-600 bg-slate-50 border-slate-200' : 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200 shadow-[0_0_5px_rgba(192,38,211,0.2)]'
                      }`}>
                        {activeParallelName}
                      </span>
                      
                      {/* Active Parallel Stepper */}
                      <div className="ml-auto flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(activeSubsetId, card.id, activeParallel, -1)}
                          disabled={activeQty === 0}
                          className="w-6 h-6 rounded bg-white text-slate-600 shadow-sm flex items-center justify-center disabled:opacity-50 disabled:shadow-none hover:bg-slate-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="w-6 text-center text-xs font-black text-blue">
                          {activeQty}
                        </div>
                        <button 
                          onClick={() => updateQuantity(activeSubsetId, card.id, activeParallel, 1)}
                          className="w-6 h-6 rounded bg-white text-blue shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors hover:text-blue-light"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand Parallels Button */}
                <button 
                  onClick={() => toggleExpand(card.id)}
                  className={`w-full py-2 px-3 text-[10px] font-black tracking-widest uppercase flex items-center justify-between transition-all border-t ${
                    isExpanded ? "bg-slate-100 text-blue border-slate-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Manage all parallels & variations</span>
                    {totalParallelsForCard > 0 && (
                      <span className="bg-blue text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        {totalParallelsForCard} owned
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-blue" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>

                {/* Expanded Parallels List */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 divide-y divide-slate-200/60 shadow-inner">
                    {parallels.map((p: Parallel) => {
                      const pQty = cardParallelsState[p.id] || 0;
                      return (
                        <div key={p.id} className={`flex items-center justify-between p-3 transition-colors ${pQty > 0 ? "bg-blue/5" : "hover:bg-slate-100/50"}`}>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold tracking-tight ${pQty > 0 ? "text-blue" : "text-slate-600"}`}>
                              {p.name}
                            </span>
                            {p.odds && p.odds !== "1:1" && (
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider">ODDS: {p.odds}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {pQty > 0 && <span className="text-[9px] font-black text-green-700 tracking-widest uppercase bg-green-100 px-1.5 py-0.5 rounded border border-green-200 shadow-sm">Set</span>}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                              <button 
                                onClick={() => updateQuantity(activeSubsetId, card.id, p.id, -1)}
                                disabled={pQty === 0}
                                className="w-7 h-7 rounded-md text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-6 text-center text-xs font-black text-blue">
                                {pQty}
                              </div>
                              <button 
                                onClick={() => updateQuantity(activeSubsetId, card.id, p.id, 1)}
                                className="w-7 h-7 rounded-md text-blue flex items-center justify-center hover:bg-slate-50 transition-all"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
          
          {filteredCards.length === 0 && (
            <div className="text-center py-12 px-4 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-600 tracking-tight">No cards found</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Try adjusting your filters or search term.</p>
              {(search || filterMode !== "all") && (
                <button 
                  onClick={() => { setSearch(""); setFilterMode("all"); }}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 font-bold tracking-wide rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
