import { ArrowLeft, Download, Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { img, kindOf, titleOf, yearOf, type TmdbItem, tmdb } from "@/lib/tmdb";
import ContentCard from "./ContentCard";

export default function Detail({
  item,
  onClose,
  onPlay,
}: {
  item: TmdbItem;
  onClose: () => void;
  onPlay: () => void;
}) {
  const mediaType: "movie" | "tv" = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
  const [similar, setSimilar] = useState<TmdbItem[]>([]);

  useEffect(() => {
    tmdb.similar(mediaType, item.id).then((r) => setSimilar(r.results)).catch(() => undefined);
  }, [item.id, mediaType]);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg fade-in">
      <div className="relative h-[300px] w-full">
        {item.backdrop_path && (
          <img src={img(item.backdrop_path, "original")} alt={titleOf(item)} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <button
          onClick={onClose}
          className="glass absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="-mt-12 px-4 pb-12">
        <h1 className="font-display text-2xl font-bold text-text">{titleOf(item)}</h1>
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-text">{yearOf(item)}</span>
          <span className="rounded bg-cyan/20 px-1.5 py-0.5 font-bold text-cyan">{kindOf(item)}</span>
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-text">★ {item.vote_average?.toFixed(1)}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text/85">{item.overview}</p>

        <button
          onClick={onPlay}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan py-3 font-bold text-bg box-glow-cyan"
        >
          <Play className="h-4 w-4" fill="currentColor" /> Watch Now
        </button>
        <div className="mt-2 flex gap-2">
          <button className="glass flex-1 rounded-xl py-2.5 text-sm font-semibold text-text inline-flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4" /> Watchlist
          </button>
          <button className="glass flex-1 rounded-xl py-2.5 text-sm font-semibold text-text inline-flex items-center justify-center gap-1.5">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>

        <section className="mt-7">
          <h2 className="font-display mb-2 text-xs font-bold tracking-widest text-cyan">CAST</h2>
          <div className="scroll-x flex gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex shrink-0 flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-surface-2 to-purple/30 border border-border" />
                <span className="mt-1 text-[10px] text-muted">Actor {i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="font-display mb-2 text-xs font-bold tracking-widest text-cyan">MORE LIKE THIS</h2>
          <div className="scroll-x flex gap-3">
            {similar.slice(0, 12).map((s) => (
              <ContentCard key={s.id} item={s} onOpen={() => undefined} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
