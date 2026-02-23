"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DiaryIcon, GoalsIcon, MealsIcon } from "./NavIcons";
import { getTodayEastern } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/", label: "Diary", icon: DiaryIcon },
  { href: "/goals", label: "Goals", icon: GoalsIcon },
  { href: "/meals", label: "Meals", icon: MealsIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-[240px] md:flex-col md:bg-nav-bg md:backdrop-blur-xl md:border-r md:border-border md:z-50">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
            <rect x="3" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 2V22" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18" cy="7" r="4" fill="currentColor" opacity="0.2" />
            <circle cx="18" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 7h4M18 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="font-display text-lg font-bold text-text-primary tracking-tight leading-tight">
              nootbook
            </h1>
            <p className="text-[10px] text-text-muted tracking-widest uppercase">
              Nutrition Tracker
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-accent-subtle text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                }
              `}
            >
              <div
                className={`w-0.5 h-4 rounded-full transition-colors duration-200 ${
                  isActive ? "bg-accent" : "bg-transparent"
                }`}
              />
              <tab.icon active={isActive} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-border-light">
        <p className="text-[10px] text-text-muted tracking-wide">
          {new Date(getTodayEastern() + "T00:00:00").toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              month: "short",
              day: "numeric",
            }
          )}
        </p>
        <button
          onClick={handleLogout}
          className="mt-2 text-xs text-text-muted hover:text-text-primary transition-colors press-scale"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
