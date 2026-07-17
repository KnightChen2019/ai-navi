import { getWeeklyTrending } from "@/lib/trending";
import ToolCard from "./ToolCard";

export default async function TrendingRail() {
  const tools = await getWeeklyTrending(8);
  if (tools.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline gap-2.5 px-1">
        <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          🔥 本周热门
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tools.map((c) => (
          <ToolCard key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
}
