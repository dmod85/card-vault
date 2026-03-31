"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ChevronLeft } from "lucide-react";

// Mock data until Supabase is connected
const MOCK_CARDS = [
  { id: "1", player_name: "Tom Brady", year: 2000, brand: "Bowman", sport: "Football", value: 350.0, image_url: "https://placehold.co/400x550/00274C/FFCB05?text=Tom+Brady" },
  { id: "2", player_name: "Michael Jordan", year: 1986, brand: "Fleer", sport: "Basketball", value: 1200.0, image_url: "https://placehold.co/400x550/00274C/FFCB05?text=Jordan" },
  { id: "3", player_name: "Derek Jeter", year: 1993, brand: "SP", sport: "Baseball", value: 150.0, image_url: "https://placehold.co/400x550/00274C/FFCB05?text=Jeter" },
];

const SPORTS = ["All", "Football", "Basketball", "Baseball", "Hockey", "Soccer", "Other"];

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filteredCards = MOCK_CARDS.filter(c => {
    if (activeTab !== "All" && c.sport !== activeTab) return false;
    if (search && !c.player_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-blue text-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="p-1 hover:bg-blue-light rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold flex-1">My Collection</h1>
          <button className="p-1 hover:bg-blue-light rounded-full transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-blue-light/50 border border-blue-light text-white placeholder:text-slate-300 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-maize"
          />
        </div>
      </div>

      <div className="overflow-x-auto shrink-0 border-b border-slate-200 bg-white">
        <div className="flex p-2 gap-2 w-max px-4">
          {SPORTS.map(sport => (
            <button 
              key={sport}
              onClick={() => setActiveTab(sport)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === sport 
                  ? "bg-maize text-blue shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredCards.length > 0 ? (
          filteredCards.map(card => (
            <Link key={card.id} href={`/collection/${card.id}`} className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[2.5/3.5] w-full bg-slate-200 overflow-hidden relative">
                <img src={card.image_url} alt={card.player_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-maize text-xs font-bold px-2 py-1 rounded-md">
                  ${card.value.toFixed(2)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-blue leading-tight truncate">{card.player_name}</h3>
                <p className="text-xs text-slate-500 mt-1">{card.year} {card.brand}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-slate-400">
            No cards found.
          </div>
        )}
      </div>
    </div>
  );
}
