"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DiaryIcon, GoalsIcon, MealsIcon } from "./NavIcons";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/", label: "Diary", icon: DiaryIcon },
  { href: "/goals", label: "Goals", icon: GoalsIcon },
  { href: "/meals", label: "Meals", icon: MealsIcon },
];

export default function BottomNav() {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-nav-bg backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 font-display text-[10px] tracking-wide transition-colors press-scale ${
                isActive
                  ? "text-accent font-semibold"
                  : "text-text-muted hover:text-text-secondary font-medium"
              }`}
            >
              <tab.icon active={isActive} />
              {tab.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 font-display text-[10px] tracking-wide text-text-muted hover:text-text-secondary font-medium transition-colors press-scale"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </nav>
  );
}
