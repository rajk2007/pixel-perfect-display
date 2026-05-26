import { ArrowLeft, Plus, RefreshCw, X } from "lucide-react";
import { useState } from "react";

type Plugin = { name: string; type: "Movies" | "Series" | "Anime" | "Mixed"; lang: string; version: string; installed?: boolean };
type Repo = {
  name: string;
  url: string;
  active: boolean;
  latency: number;
  providers: number;
  updated: string;
  plugins: Plugin[];
};

const INITIAL: Repo[] = [
  {
    name: "CloudStream",
    url: "https://github.com/recloudstream/extensions",
    active: true,
    latency: 124,
    providers: 42,
    updated: "2 hours ago",
    plugins: [
      { name: "HDMovieArea", type: "Movies", lang: "EN", version: "v2.1", installed: true },
      { name: "SuperStream", type: "Mixed", lang: "EN", version: "v1.8", installed: true },
      { name: "FlixHQ", type: "Mixed", lang: "EN", version: "v3.0" },
      { name: "LookMovie", type: "Movies", lang: "EN", version: "v1.2" },
      { name: "SoraStream", type: "Mixed", lang: "EN", version: "v2.4" },
      { name: "VidSrc", type: "Mixed", lang: "EN", version: "v3.1", installed: true },
    ],
  },
  {
    name: "Phisher",
    url: "https://phisher6.github.io/repos/index.json",
    active: true,
    latency: 188,
    providers: 28,
    updated: "5 hours ago",
    plugins: [
      { name: "AnimePahe", type: "Anime", lang: "EN", version: "v1.6", installed: true },
      { name: "AnimeWorld", type: "Anime", lang: "IT", version: "v1.1" },
      { name: "Rive", type: "Mixed", lang: "EN", version: "v2.2" },
      { name: "HDMovie2", type: "Movies", lang: "EN", version: "v1.4" },
      { name: "ToonStream", type: "Anime", lang: "EN", version: "v1.0" },
    ],
  },
  {
    name: "MegaRepo",
    url: "https://megaprovider.github.io/index.json",
    active: true,
    latency: 211,
    providers: 67,
    updated: "1 day ago",
    plugins: [
      { name: "CineZone", type: "Movies", lang: "EN", version: "v1.3" },
      { name: "DramaCool", type: "Series", lang: "EN", version: "v2.0", installed: true },
      { name: "KissAsian", type: "Series", lang: "EN", version: "v1.1" },
      { name: "StreamTape", type: "Mixed", lang: "EN", version: "v1.5" },
      { name: "VidSrc Pro", type: "Mixed", lang: "EN", version: "v3.2" },
    ],
  },
  {
    name: "doGior's Had Enough",
    url: "https://dogiopr.github.io/repos/index.json",
    active: false,
    latency: 302,
    providers: 19,
    updated: "3 days ago",
    plugins: [
      { name: "AltaDefinizione", type: "Movies", lang: "IT", version: "v1.2" },
      { name: "StreamingCommunity", type: "Mixed", lang: "IT", version: "v2.1" },
      { name: "GuardaHD", type: "Movies", lang: "IT", version: "v1.0" },
      { name: "CB01", type: "Movies", lang: "IT", version: "v1.3" },
    ],
  },
  {
    name: "KEKIK",
    url: "https://kekikakademi.org/cloudstream/index.json",
    active: true,
    latency: 156,
    providers: 34,
    updated: "12 hours ago",
    plugins: [
      { name: "TurkceAltyazi", type: "Mixed", lang: "TR", version: "v1.4" },
      { name: "DiziLla", type: "Series", lang: "TR", version: "v2.0" },
      { name: "FullHDFilm", type: "Movies", lang: "TR", version: "v1.1" },
      { name: "Anizm", type: "Anime", lang: "TR", version: "v1.0" },
    ],
  },
];

export default function Sources() {
  const [repos, setRepos] = useState<Repo[]>(INITIAL);
  const [browsing, setBrowsing] = useState<Repo | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  if (browsing) {
    return (
      <PluginList
        repo={browsing}
        onBack={() => setBrowsing(null)}
        onToggle={(plugin) =>
          setRepos((rs) =>
            rs.map((r) =>
              r.name !== browsing.name
                ? r
                : {
                    ...r,
                    plugins: r.plugins.map((p) =>
                      p.name === plugin.name ? { ...p, installed: !p.installed } : p,
                    ),
                  },
            ),
          )
        }
      />
    );
  }

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="font-display text-xl font-bold text-text">Streaming Sources</h1>
      <p className="text-xs text-muted">Manage your streaming repositories</p>

      <div className="mt-5 space-y-3">
        {repos.map((r) => (
          <article key={r.name} className="glass rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold text-text">{r.name}</h3>
                <p className="truncate text-[11px] text-muted">{r.url}</p>
              </div>
              <Switch
                on={r.active}
                onChange={() =>
                  setRepos((rs) => rs.map((x) => (x.name === r.name ? { ...x, active: !x.active } : x)))
                }
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <Stat label="Status" value={r.active ? "Active" : "Inactive"} color={r.active ? "text-green" : "text-red"} />
              <Stat label="Latency" value={`${r.latency}ms`} color="text-cyan" />
              <Stat label="Providers" value={String(r.providers)} color="text-text" />
            </div>
            <div className="mt-2 text-[10px] text-muted">Updated {r.updated}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setBrowsing(r)}
                className="rounded-lg border border-cyan/60 px-3 py-1.5 text-xs font-semibold text-cyan hover:bg-cyan/10"
              >
                Browse Plugins
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
              <button
                onClick={() => setRepos((rs) => rs.filter((x) => x.name !== r.name))}
                className="rounded-lg border border-red/60 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/10"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-cyan text-bg shadow-[0_0_24px_#00f5ff]"
      >
        <Plus className="h-6 w-6" />
      </button>

      {addOpen && (
        <AddRepoModal
          onClose={() => setAddOpen(false)}
          onAdd={(repo) => {
            setRepos((rs) => [...rs, repo]);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-cyan box-glow-cyan" : "bg-surface-2"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg transition ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-surface-2/70 p-2">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`text-xs font-bold ${color}`}>{value}</div>
    </div>
  );
}

function AddRepoModal({ onClose, onAdd }: { onClose: () => void; onAdd: (r: Repo) => void }) {
  const [input, setInput] = useState("");
  const isUrl = input.startsWith("http");
  const valid = isUrl ? /^https?:\/\/.+/.test(input) : input.length >= 3;
  const found = !isUrl && input.length >= 3;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text">Add Repository</h3>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste URL or enter shortcode"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
        />
        <div className="mt-2 text-[11px]">
          {isUrl ? (
            <span className={valid ? "text-green" : "text-red"}>
              {valid ? "✓ URL looks valid" : "Invalid URL"}
            </span>
          ) : found ? (
            <span className="text-green">Repository found ✓</span>
          ) : input.length > 0 ? (
            <span className="text-muted">Searching...</span>
          ) : (
            <span className="text-muted">Tip: paste URL or type a shortcode</span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() =>
              onAdd({
                name: isUrl ? new URL(input).hostname : input,
                url: input,
                active: true,
                latency: 100 + Math.floor(Math.random() * 200),
                providers: Math.floor(Math.random() * 50) + 10,
                updated: "just now",
                plugins: [],
              })
            }
            className="flex-1 rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg disabled:opacity-50"
          >
            Add Repository
          </button>
        </div>
      </div>
    </div>
  );
}

function PluginList({ repo, onBack, onToggle }: { repo: Repo; onBack: () => void; onToggle: (p: Plugin) => void }) {
  const [busy, setBusy] = useState<Record<string, "installing" | "removing" | undefined>>({});

  const handle = (p: Plugin) => {
    if (busy[p.name]) return;
    if (!p.installed) {
      setBusy((s) => ({ ...s, [p.name]: "installing" }));
      setTimeout(() => {
        onToggle(p);
        setBusy((s) => ({ ...s, [p.name]: undefined }));
      }, 1500);
    } else {
      setBusy((s) => ({ ...s, [p.name]: "removing" }));
      setTimeout(() => {
        onToggle(p);
        setBusy((s) => ({ ...s, [p.name]: undefined }));
      }, 1000);
    }
  };

  return (
    <div className="px-4 pb-24 pt-4">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-cyan">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h2 className="font-display text-lg font-bold text-text">{repo.name}</h2>
      <p className="text-xs text-muted">{repo.plugins.length} plugins available</p>
      <ul className="mt-4 space-y-2">
        {repo.plugins.map((p) => {
          const busy = installing[p.name];
          return (
            <li
              key={p.name}
              className={`glass flex items-center justify-between rounded-xl border p-3 transition ${
                p.installed ? "border-cyan/70 box-glow-cyan" : "border-border"
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text">{p.name}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                  <span className="rounded bg-cyan/15 px-1.5 py-0.5 font-bold tracking-widest text-cyan">{p.type.toUpperCase()}</span>
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-muted">{p.lang}</span>
                  <span className="text-muted">{p.version}</span>
                </div>
              </div>
              <button
                onClick={() => handle(p)}
                disabled={busy}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  busy
                    ? "border border-cyan/40 text-cyan/70"
                    : p.installed
                      ? "border border-red/60 text-red"
                      : "border border-cyan/60 text-cyan hover:bg-cyan/10"
                }`}
              >
                {busy ? "Installing..." : p.installed ? "Uninstall" : "Install"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
