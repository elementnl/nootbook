"use client";

import { useEffect } from "react";

function getThemeForCurrentTime(): "light" | "dark" {
  // Get current hour in US Eastern time
  const now = new Date();
  const eastern = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const hour = eastern.getHours();

  // 9am - 8pm (20:00) = light, otherwise dark
  return hour >= 9 && hour < 20 ? "light" : "dark";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    function applyTheme() {
      const theme = getThemeForCurrentTime();
      document.documentElement.setAttribute("data-theme", theme);
    }

    applyTheme();

    // Recheck every minute
    const interval = setInterval(applyTheme, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
