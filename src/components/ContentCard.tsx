import { Star } from "lucide-react";
import { img, kindOf, titleOf, yearOf, type TmdbItem } from "@/lib/tmdb";

export default function ContentCard({
  item,
  onOpen,
  progress,
}: {
  item: TmdbItem;
  onOpen: (i: TmdbItem) => void;
  progress?: number;
}) {
  const kind = kindOf(item);
  const badgeColor =
    kind === "MOVIE" ? "bg-cyan text-bg" : kind === "SERIES" ? "bg-purple text-text" : "bg-magenta text-text";

  return (
    <button
      onClick={() => onOpen(item)}
      className="group flex w-[120px] shrink-0 flex-col text-left"
    >
      <div className="relative h-[170px] w-[120px] overflow-hidden rounded-xl border border-border bg-surface-2">
        {item.poster_path ? (
          <img
            loading="lazy"
            src={img(item.poster_path, "w300")}
            alt={titleOf(item)}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <span
          className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${badgeColor}`}
        >
          {kind}
        </span>
        {progress !== undefined && (
          <div className="absolute inset-x-1.5 bottom-1.5 h-1 overflow-hidden rounded-full bg-black/60">
            <div className="h-full bg-cyan shadow-[0_0_6px_#00f5ff]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="mt-1.5 line-clamp-1 text-[12px] font-medium text-text">{titleOf(item)}</div>
      <div className="flex items-center gap-1 text-[11px] text-cyan">
        <span>{yearOf(item)}</span>
        <Star className="h-2.5 w-2.5 fill-cyan" />
        <span>{item.vote_average?.toFixed(1) ?? "—"}</span>
      </div>
    </button>
  );
}
