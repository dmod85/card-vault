"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Box } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError("");
    setMsg("");
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your email for the confirmation link!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/checklist");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-maize text-blue p-3 rounded-xl shadow-lg transform -rotate-3">
             <Box size={40} className="fill-current" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-blue tracking-tight">
          CardVault Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Securely sync your collection to the cloud.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue sm:text-sm font-semibold text-slate-900 bg-slate-50"
                  placeholder="collector@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue sm:text-sm font-semibold text-slate-900 bg-slate-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            {msg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold p-3 rounded-lg text-center">
                {msg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAuth(false)}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-black tracking-widest uppercase text-white bg-blue hover:bg-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue transition-all disabled:opacity-50"
              >
                Sign In
              </button>
              <button
                onClick={() => handleAuth(true)}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-black tracking-widest uppercase text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue transition-all disabled:opacity-50"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
