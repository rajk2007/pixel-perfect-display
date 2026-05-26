import { useState } from "react";
import { Plus, User, X, Check, UserCircle2 } from "lucide-react";
import type { TmdbItem } from "@/lib/tmdb";
import Row from "@/components/Row";

const GENRES = ["Sci-Fi", "Action", "Anime", "Drama", "Cyberpunk", "Thriller"];

type Account = { id: string; username: string; email: string };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

export default function Profile({
  data,
  onOpen,
}: {
  data: { trending: TmdbItem[]; topRated: TmdbItem[]; week: TmdbItem[] };
  onOpen: (i: TmdbItem) => void;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const active = accounts.find((a) => a.id === activeId) || null;

  const handleAuth = (acc: Account) => {
    setAccounts((prev) => {
      if (prev.some((a) => a.email === acc.email)) return prev;
      return [...prev, acc];
    });
    setActiveId(acc.id);
    setAuthMode(null);
    setSwitcherOpen(false);
  };

  return (
    <div className="px-4 pb-24 pt-4">
      {active ? (
        <LoggedInHeader
          account={active}
          onSwitch={() => setSwitcherOpen(true)}
          onAdd={() => setAuthMode("login")}
        />
      ) : (
        <LoggedOutHeader onLogin={() => setAuthMode("login")} onSignup={() => setAuthMode("signup")} />
      )}

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
        <h2 className="font-display mb-2 text-[11px] font-bold tracking-widest text-cyan">SETTINGS</h2>
        <div className="glass divide-y divide-border rounded-2xl border border-border">
          {["Edit Profile", "Backup Settings", "Sync Preferences"].map((a) => (
            <button key={a} className="block w-full px-4 py-3 text-left text-sm text-text hover:bg-surface-2">
              {a}
            </button>
          ))}
          {active && (
            <button
              onClick={() => setActiveId(null)}
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-red hover:bg-red/10"
            >
              Sign Out
            </button>
          )}
        </div>
      </section>

      {authMode && (
        <AuthModal
          mode={authMode}
          onToggle={() => setAuthMode(authMode === "login" ? "signup" : "login")}
          onClose={() => setAuthMode(null)}
          onSubmit={handleAuth}
        />
      )}

      {switcherOpen && (
        <SwitcherModal
          accounts={accounts}
          activeId={activeId}
          onPick={(id) => {
            setActiveId(id);
            setSwitcherOpen(false);
          }}
          onAdd={() => {
            setSwitcherOpen(false);
            setAuthMode("login");
          }}
          onClose={() => setSwitcherOpen(false)}
        />
      )}
    </div>
  );
}

function LoggedOutHeader({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border p-5">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-border bg-surface-2 text-muted">
          <User className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-base font-bold text-text">Welcome</h1>
          <p className="text-xs text-muted">Sign in to sync your watchlist</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onLogin}
          className="flex-1 rounded-lg border border-cyan/60 px-3 py-2 text-xs font-bold text-cyan hover:bg-cyan/10"
        >
          Log In
        </button>
        <button
          onClick={onSignup}
          className="flex-1 rounded-lg bg-cyan px-3 py-2 text-xs font-bold text-bg box-glow-cyan"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

function LoggedInHeader({
  account,
  onSwitch,
  onAdd,
}: {
  account: Account;
  onSwitch: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/60 p-5 box-glow-purple">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple text-lg font-bold text-bg ring-2 ring-cyan box-glow-cyan">
          {initials(account.username)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-lg font-bold text-text">{account.username}</h1>
          <p className="truncate text-[11px] text-muted">{account.email}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <Stat v="248h" k="HOURS" />
        <Stat v="84" k="MOVIES" />
        <Stat v="12" k="SERIES" />
        <Stat v="7d" k="STREAK" />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onSwitch}
          className="flex-1 rounded-lg border border-cyan/60 px-3 py-2 text-xs font-bold text-cyan hover:bg-cyan/10"
        >
          Switch Account
        </button>
        <button
          onClick={onAdd}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text"
        >
          <Plus className="h-3.5 w-3.5" /> Add Account
        </button>
      </div>
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

function AuthModal({
  mode,
  onToggle,
  onClose,
  onSubmit,
}: {
  mode: "login" | "signup";
  onToggle: () => void;
  onClose: () => void;
  onSubmit: (a: Account) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const valid =
    email.includes("@") &&
    password.length >= 4 &&
    (mode === "login" || username.trim().length >= 2);

  const submit = () => {
    if (!valid) return;
    onSubmit({
      id: crypto.randomUUID(),
      email: email.trim(),
      username: mode === "signup" ? username.trim() : email.split("@")[0],
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text">
            {mode === "login" ? "Log In" : "Sign Up"}
          </h3>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        <div className="space-y-2">
          {mode === "signup" && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
          />
        </div>

        <button onClick={onToggle} className="mt-3 text-[11px] text-cyan hover:underline">
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={submit}
            className="flex-1 rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg box-glow-cyan disabled:opacity-50 disabled:shadow-none"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function SwitcherModal({
  accounts,
  activeId,
  onPick,
  onAdd,
  onClose,
}: {
  accounts: Account[];
  activeId: string | null;
  onPick: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text">Choose Account</h3>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        <ul className="space-y-2">
          {accounts.map((a) => {
            const isActive = a.id === activeId;
            return (
              <li key={a.id}>
                <button
                  onClick={() => onPick(a.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isActive ? "border-cyan box-glow-cyan bg-cyan/5" : "border-border hover:border-cyan/40"
                  }`}
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple text-sm font-bold text-bg">
                    {initials(a.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-text">{a.username}</div>
                    <div className="truncate text-[11px] text-muted">{a.email}</div>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-cyan" />}
                </button>
              </li>
            );
          })}

          <li>
            <button
              onClick={onAdd}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-cyan/50 p-3 text-left text-cyan hover:bg-cyan/5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cyan/50 bg-surface-2">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold">Add Another Account</div>
            </button>
          </li>

          {accounts.length === 0 && (
            <li className="flex items-center gap-2 px-1 py-2 text-xs text-muted">
              <UserCircle2 className="h-4 w-4" /> No saved accounts yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
