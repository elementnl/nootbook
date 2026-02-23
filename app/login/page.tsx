"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function NootbookLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="text-accent"
    >
      <rect x="3" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 2V22" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="7" r="4" fill="currentColor" opacity="0.2" />
      <circle cx="18" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 7h4M18 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const email = `${username.toLowerCase().trim()}@nootbook.local`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex items-center justify-center px-4">
      {/* Mobile splash screen */}
      <div
        className={`md:hidden absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
          showSplash
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <NootbookLogo size={64} />
        <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight mt-4">
          nootbook
        </h1>
        <p className="text-sm text-text-muted mt-1">Nutrition Tracker</p>
      </div>

      {/* Sign-in form */}
      <div
        className={`w-full max-w-sm transition-all duration-500 ${
          showSplash
            ? "md:animate-fade-in-up opacity-0 md:opacity-100"
            : "animate-fade-in-up"
        }`}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <NootbookLogo size={48} />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            nootbook
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full border border-border rounded-xl px-4 py-3 bg-bg-input text-text-primary text-sm"
              placeholder="username"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-border rounded-xl px-4 py-3 bg-bg-input text-text-primary text-sm"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-text py-3 rounded-xl font-medium disabled:opacity-50 transition-colors hover:bg-accent-hover press-scale"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
