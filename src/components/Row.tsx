import type { TmdbItem } from "@/lib/tmdb";
import ContentCard from "./ContentCard";

export default function Row({
  title,
  items,
  onOpen,
  withProgress,
}: {
  title: string;
  items: TmdbItem[];
  onOpen: (i: TmdbItem) => void;
  withProgress?: boolean;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="font-display text-sm font-bold tracking-widest text-text">{title.toUpperCase()}</h2>
        <button className="text-xs font-semibold text-cyan">See All</button>
      </div>
      <div className="scroll-x flex gap-3 px-4 pb-2">
        {items.map((i, idx) => (
          <ContentCard
            key={i.id}
            item={i}
            onOpen={onOpen}
            progress={withProgress ? 20 + ((idx * 17) % 70) : undefined}
          />
        ))}
        {items.length === 0 &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[170px] w-[120px] shrink-0 animate-pulse rounded-xl bg-surface-2" />
          ))}
      </div>
    </section>
  );
}
