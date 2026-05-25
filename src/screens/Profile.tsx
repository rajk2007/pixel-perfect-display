import type { TmdbItem } from "@/lib/tmdb";
import Row from "@/components/Row";

const GENRES = ["Sci-Fi", "Action", "Anime", "Drama", "Cyberpunk", "Thriller"];

export default function Profile({
  data,
  onOpen,
}: {
  data: { trending: TmdbItem[]; topRated: TmdbItem[]; week: TmdbItem[] };
  onOpen: (i: TmdbItem) => void;
}) {
  return (
    <div className="px-4 pb-24 pt-4">
      <div className="relative overflow-hidden rounded-2xl border border-purple/60 p-5 box-glow-purple">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple text-lg font-bold text-bg ring-2 ring-cyan box-glow-cyan">
            SU
          </div>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-text">StreamUser</h1>
            <p className="text-xs text-muted">Watching since 2024</p>
          </div>
          <button className="rounded-lg border border-cyan/60 px-3 py-1.5 text-[11px] font-semibold text-cyan">
            Edit Profile
          </button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Stat v="248h" k="HOURS" />
          <Stat v="84" k="MOVIES" />
          <Stat v="12" k="SERIES" />
          <Stat v="7d" k="STREAK" />
        </div>
      </div>

      <Row title="Continue Watching" items={data.trending.slice(0, 8)} onOpen={onOpen} withProgress />
      <Row title="My Favorites" items={data.topRated} onOpen={onOpen} />
      <Row title="Recently Watched" items={data.week} onOpen={onOpen} />

      <section className="mt-6">
        <h2 className="font-display mb-2 text-[11px] font-bold tracking-widest text-cyan">PREFERENCES</h2>
        <div className="glass rounded-2xl border border-border p-4">
          <div className="scroll-x flex gap-2 pb-2">
            {GENRES.map((g) => (
              <span
                key={g}
                className="shrink-0 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs text-cyan"
              >
                {g}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-text">Subtitle Language</span>
            <select className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs">
              <option>English</option>
              <option>Italian</option>
              <option>Spanish</option>
            </select>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-text">Preferred Repository</span>
            <select className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs">
              <option>CloudStream</option>
              <option>Phisher</option>
              <option>MegaRepo</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display mb-2 text-[11px] font-bold tracking-widest text-cyan">DEVICES</h2>
        <ul className="glass space-y-2 rounded-2xl border border-border p-4">
          <li className="flex items-center justify-between text-sm">
            <span className="text-text">Pixel 9 Pro</span>
            <span className="inline-flex items-center gap-1 text-xs text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_6px_#00ff88]" /> Active now
            </span>
          </li>
          <li className="flex items-center justify-between text-sm">
            <span className="text-text">Galaxy Tab S10</span>
            <span className="text-xs text-muted">2h ago</span>
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display mb-2 text-[11px] font-bold tracking-widest text-cyan">ACCOUNT</h2>
        <div className="glass divide-y divide-border rounded-2xl border border-border">
          {["Edit Profile", "Backup Settings", "Sync Preferences"].map((a) => (
            <button key={a} className="block w-full px-4 py-3 text-left text-sm text-text hover:bg-surface-2">
              {a}
            </button>
          ))}
          <button className="block w-full px-4 py-3 text-left text-sm font-semibold text-red hover:bg-red/10">
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ v, k }: { v: string; k: string }) {
  return (
    <div className="rounded-xl bg-surface-2/70 p-2 text-center">
      <div className="font-display text-base font-bold text-cyan glow-cyan">{v}</div>
      <div className="text-[9px] tracking-widest text-muted">{k}</div>
    </div>
  );
}
