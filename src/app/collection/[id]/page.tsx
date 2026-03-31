"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Edit3, Trash2 } from "lucide-react";

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for card
  const card = {
    id: id,
    player_name: "Tom Brady",
    year: 2000,
    brand: "Bowman",
    set_name: "Base",
    card_number: "236",
    sport: "Football",
    condition: "Raw",
    image_url: "https://placehold.co/400x550/00274C/FFCB05?text=Tom+Brady",
    estimated_value: 350.0,
    last_checked: new Date().toLocaleDateString()
  };

  const handleRefreshPrice = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col pb-6">
      <div className="bg-blue text-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <Link href="/collection" className="p-1 hover:bg-blue-light rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-blue-light rounded-full transition-colors text-slate-300 hover:text-white">
            <Edit3 size={18} />
          </button>
          <button className="p-2 hover:bg-red-500/80 rounded-full transition-colors text-slate-300 hover:text-white">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center">
        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-xl border-4 border-white mb-6">
          <img src={card.image_url} alt={card.player_name} className="w-full h-auto" />
        </div>

        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-blue leading-tight">{card.player_name}</h1>
              <p className="text-slate-500 mt-1">{card.year} {card.brand} {card.set_name}</p>
            </div>
            <div className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {card.sport}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 mt-4 text-sm">
            <div>
              <p className="text-slate-400">Card No.</p>
              <p className="font-semibold text-slate-800">#{card.card_number}</p>
            </div>
            <div>
              <p className="text-slate-400">Condition</p>
              <p className="font-semibold text-slate-800">{card.condition}</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Market Value</h2>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-green-600">${card.estimated_value.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">Last checked: {card.last_checked}</p>
            </div>
            <button 
              onClick={handleRefreshPrice}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isRefreshing ? "bg-slate-100 text-slate-400" : "bg-maize text-blue hover:brightness-105 active:scale-95"}`}
            >
              <TrendingUp size={16} className={isRefreshing ? "animate-pulse" : ""} />
              {isRefreshing ? "Updating..." : "Refresh"}
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <a 
              href={`https://130point.com/sales/`} 
              target="_blank" 
              rel="noreferrer"
              className="text-blue text-sm font-semibold hover:underline flex items-center gap-1 justify-center w-full"
            >
              Verify comps on 130point &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
