import { redirect } from "next/navigation";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  if (date) {
    redirect(`/?date=${date}`);
  }
  redirect("/");
}
