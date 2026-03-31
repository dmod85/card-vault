"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, List, CheckSquare } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/scan", label: "Scan", icon: Camera },
    { href: "/collection", label: "Collection", icon: List },
    { href: "/checklist", label: "Checklists", icon: CheckSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 pb-safe z-50 flex justify-between items-center shadow-lg">
      <div className="max-w-lg mx-auto w-full flex justify-between">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? "text-blue bg-blue-light/10" : "text-slate-400 hover:text-blue hover:bg-slate-50"
              }`}
            >
              <Icon size={24} className={isActive ? "fill-blue/20 stroke-2" : "stroke-[1.5]"} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-blue" : "text-slate-500"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
