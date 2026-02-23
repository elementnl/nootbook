/**
 * Get today's date string (YYYY-MM-DD) in US Eastern time.
 * Using toISOString().split("T")[0] returns UTC, which is wrong
 * after 7 PM Eastern (it would show tomorrow's date).
 */
export function getTodayEastern(): string {
  const now = new Date();
  const eastern = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const year = eastern.getFullYear();
  const month = String(eastern.getMonth() + 1).padStart(2, "0");
  const day = String(eastern.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
