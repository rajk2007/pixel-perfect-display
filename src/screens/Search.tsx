import { Clock, Mic, Search as SearchIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { tmdb, type TmdbItem, kindOf, titleOf, yearOf, img } from "@/lib/tmdb";

const FILTERS = ["All", "Movies", "Series", "Anime", "Trending", "Latest", "Top Rated"] as const;
type Filter = (typeof FILTERS)[number];

export default function Search({ onOpen }: { onOpen: (i: TmdbItem) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TmdbItem[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [recent, setRecent] = useState<string[]>(["matrix", "blade runner", "spirited away"]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const r = await tmdb.searchMulti(q.trim());
        setResults(r.results.filter((x) => x.poster_path));
        setRecent((prev) => [q.trim(), ...prev.filter((p) => p !== q.trim())].slice(0, 6));
      } catch (e) {
        console.error(e);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [q]);

  const filtered = useMemo(() => {
    if (filter === "All" || filter === "Latest" || filter === "Trending") return results;
    if (filter === "Top Rated") return [...results].sort((a, b) => b.vote_average - a.vote_average);
    if (filter === "Movies") return results.filter((r) => kindOf(r) === "MOVIE");
    if (filter === "Series") return results.filter((r) => kindOf(r) === "SERIES");
    if (filter === "Anime") return results.filter((r) => kindOf(r) === "ANIME");
    return results;
  }, [results, filter]);

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="font-display text-xl font-bold text-text">Search</h1>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 focus-within:border-cyan focus-within:box-glow-cyan">
        <SearchIcon className="h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies, shows, anime..."
          className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-muted">
            <X className="h-4 w-4" />
          </button>
        )}
        <Mic className="h-4 w-4 text-muted" />
      </div>

      <div className="scroll-x mt-4 flex gap-2">
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-cyan bg-cyan/10 text-cyan box-glow-cyan"
                  : "border-border bg-surface text-text/80"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {!q && (
        <div className="mt-6">
          <div className="font-display mb-2 text-xs font-bold tracking-widest text-muted">RECENT</div>
          <ul className="space-y-1">
            {recent.map((r) => (
              <li key={r}>
                <button
                  onClick={() => setQ(r)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-text/90 hover:bg-surface-2"
                >
                  <Clock className="h-4 w-4 text-muted" />
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {q && filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center text-muted">
          <SearchIcon className="h-10 w-10" />
          <p className="mt-3 text-sm">No results found</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpen(r)}
              className="overflow-hidden rounded-xl border border-border bg-surface-2 text-left"
            >
              <div className="aspect-[2/3] w-full overflow-hidden">
                <img loading="lazy" src={img(r.poster_path, "w500")} alt={titleOf(r)} className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <div className="line-clamp-1 text-xs font-semibold text-text">{titleOf(r)}</div>
                <div className="text-[10px] text-cyan">
                  {yearOf(r)} · ★ {r.vote_average?.toFixed(1)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
