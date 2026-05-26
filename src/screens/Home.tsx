import { Bell, ChevronLeft, ChevronRight, Plus, Play, Search as SearchIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { img, kindOf, titleOf, yearOf, type TmdbItem, tmdb } from "@/lib/tmdb";
import Row from "@/components/Row";

function HeroCarousel({ items, onOpen }: { items: TmdbItem[]; onOpen: (i: TmdbItem) => void }) {
  const slides = items.slice(0, 5);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const go = (n: number) => setIdx((n + slides.length) % slides.length);

  return (
    <section className="mx-4 mt-4 overflow-hidden rounded-[20px] border border-border">
      <div className="relative h-[260px] w-full">
        {slides.map((hero, i) => (
          <div
            key={hero.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {hero.backdrop_path && (
              <img
                src={img(hero.backdrop_path, "w780")}
                alt={titleOf(hero)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 pb-7">
              <div className="font-display text-[10px] font-bold tracking-[0.25em] text-cyan glow-cyan">
                FEATURED TONIGHT
              </div>
              <h2 className="font-display mt-1 text-2xl font-bold text-text">{titleOf(hero)}</h2>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-text/80">
                <span>{yearOf(hero)}</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-cyan">{kindOf(hero)}</span>
                <span>★ {hero.vote_average?.toFixed(1)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-text/75">{hero.overview}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onOpen(hero)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan px-4 py-2 text-xs font-bold text-bg box-glow-cyan"
                >
                  <Play className="h-3.5 w-3.5" fill="currentColor" /> Watch Now
                </button>
                <button className="glass inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-text">
                  <Plus className="h-3.5 w-3.5" /> Watchlist
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          aria-label="Previous"
          onClick={() => go(idx - 1)}
          className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 text-text backdrop-blur hover:bg-bg/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={() => go(idx + 1)}
          className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 text-text backdrop-blur hover:bg-bg/80"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-cyan shadow-[0_0_8px_#00f5ff]" : "w-1.5 bg-text/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home({
  data,
  onOpen,
}: {
  data: {
    trending: TmdbItem[];
    movies: TmdbItem[];
    tv: TmdbItem[];
    anime: TmdbItem[];
  };
  onOpen: (i: TmdbItem) => void;
}) {
  return (
    <div className="pb-24">
      <header className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-cyan animate-pulse-glow" fill="currentColor" />
          <span className="font-display glow-cyan text-cyan text-lg font-black tracking-widest">ZCAST</span>
        </div>
        <div className="flex items-center gap-3">
          <SearchIcon className="h-5 w-5 text-text/80" />
          <Bell className="h-5 w-5 text-text/80" />
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-purple to-magenta text-[11px] font-bold">
            SU
          </div>
        </div>
      </header>

      <HeroCarousel items={data.trending} onOpen={onOpen} />

      <Row title="Continue Watching" items={data.trending.slice(0, 4)} onOpen={onOpen} withProgress />
      <Row title="Trending Now" items={data.trending} onOpen={onOpen} />
      <Row title="Movies" items={data.movies} onOpen={onOpen} />
      <Row title="Series" items={data.tv} onOpen={onOpen} />
      <Row title="Anime" items={data.anime} onOpen={onOpen} />
    </div>
  );
}

export function useHomeData() {
  const [data, setData] = useState({
    trending: [] as TmdbItem[],
    movies: [] as TmdbItem[],
    tv: [] as TmdbItem[],
    anime: [] as TmdbItem[],
    topRated: [] as TmdbItem[],
    week: [] as TmdbItem[],
  });
  useEffect(() => {
    (async () => {
      try {
        const [t, m, v, a, tr, w] = await Promise.all([
          tmdb.trendingDay(),
          tmdb.popularMovies(),
          tmdb.popularTv(),
          tmdb.anime(),
          tmdb.topRatedMovies(),
          tmdb.trendingWeek(),
        ]);
        setData({
          trending: t.results,
          movies: m.results,
          tv: v.results,
          anime: a.results,
          topRated: tr.results,
          week: w.results,
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  return data;
}
