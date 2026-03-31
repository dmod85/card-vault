import Link from "next/link";
import { Box, ScanLine, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-maize text-blue p-1.5 rounded-lg shadow-sm transform -rotate-3">
            <Box size={24} />
          </div>
          <span className="text-xl font-black text-blue tracking-tight">CardVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-blue transition-colors">
            Login
          </Link>
          <Link href="/login" className="bg-blue text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:bg-blue-light">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full gap-8">
        <div className="inline-flex border-[3px] border-maize rounded-full p-2 bg-maize/10">
          <div className="bg-maize rounded-full p-4 shadow-lg">
            <ScanLine size={48} className="text-blue" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-5xl sm:text-7xl font-black text-slate-800 tracking-tighter leading-[1.1]">
            The ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-blue-light">
              sports card
            </span>{" "}
            tracker.
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Sync your collection to the cloud. Track base sets, elusive parallels, and dynamic inserts across any device — seamlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full max-w-md gap-4">
          <Link
            href="/checklist"
            className="flex-1 bg-blue hover:bg-blue-light text-white px-8 py-4 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-blue/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            Start Tracking <ChevronRight size={20} />
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {["2026 Topps Series 1", "Insert Sets", "Parallel Tracking", "Cloud Sync"].map((tag) => (
            <span
              key={tag}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
