const KEY = "8265bd1679663a7ea12ac168da84d2e8";
const BASE = "https://api.themoviedb.org/3";

export const img = (p: string | null | undefined, size: "w300" | "w500" | "w780" | "original" = "w500") =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : "";

export type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv" | "person";
  genre_ids?: number[];
};

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

type List = { results: TmdbItem[] };

export const tmdb = {
  trendingDay: () => get<List>("/trending/all/day"),
  trendingWeek: () => get<List>("/trending/all/week"),
  popularMovies: () => get<List>("/movie/popular"),
  popularTv: () => get<List>("/tv/popular"),
  anime: () => get<List>("/discover/tv", { with_genres: 16, sort_by: "popularity.desc" }),
  topRatedMovies: () => get<List>("/movie/top_rated"),
  searchMulti: (q: string) => get<List>("/search/multi", { query: q, include_adult: "false" }),
  details: (mediaType: "movie" | "tv", id: number) =>
    get<TmdbItem & { runtime?: number; number_of_seasons?: number }>(`/${mediaType}/${id}`),
  similar: (mediaType: "movie" | "tv", id: number) => get<List>(`/${mediaType}/${id}/similar`),
};

export const titleOf = (i: TmdbItem) => i.title || i.name || "Untitled";
export const yearOf = (i: TmdbItem) => {
  const d = i.release_date || i.first_air_date;
  return d ? d.slice(0, 4) : "—";
};
export const kindOf = (i: TmdbItem): "MOVIE" | "SERIES" | "ANIME" => {
  if (i.genre_ids?.includes(16)) return "ANIME";
  if (i.media_type === "tv" || i.first_air_date) return "SERIES";
  return "MOVIE";
};
