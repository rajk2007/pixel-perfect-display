import { useEffect, useState } from "react";
import { Plus, User, X, Check, Pencil } from "lucide-react";
import type { TmdbItem } from "@/lib/tmdb";
import Row from "@/components/Row";

const GENRES = ["Sci-Fi", "Action", "Anime", "Drama", "Cyberpunk", "Thriller"];

const AVATAR_COLORS: { id: string; label: string; className: string }[] = [
  { id: "cyan-purple", label: "Cyan / Purple", className: "from-cyan to-purple" },
  { id: "pink-magenta", label: "Pink / Magenta", className: "from-pink-500 to-magenta" },
  { id: "blue-purple", label: "Blue / Purple", className: "from-blue-500 to-purple" },
  { id: "green-cyan", label: "Green / Cyan", className: "from-green to-cyan" },
  { id: "orange-red", label: "Orange / Red", className: "from-orange-500 to-red" },
  { id: "purple-magenta", label: "Purple / Magenta", className: "from-purple to-magenta" },
];

const colorClass = (id: string) =>
  AVATAR_COLORS.find((c) => c.id === id)?.className ?? "from-cyan to-purple";

type SubProfile = { id: string; name: string; color: string; kids: boolean };
type Account = {
  id: string;
  username: string;
  email: string;
  avatarColor: string;
  bio: string;
  profiles: SubProfile[];
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const defaultProfiles = (username: string): SubProfile[] => [
  { id: crypto.randomUUID(), name: username, color: "cyan-purple", kids: false },
  { id: crypto.randomUUID(), name: "Kids", color: "pink-magenta", kids: true },
];

export default function Profile({
  data,
  onOpen,
}: {
  data: { trending: TmdbItem[]; topRated: TmdbItem[]; week: TmdbItem[] };
  onOpen: (i: TmdbItem) => void;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [whosWatching, setWhosWatching] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);

  const active = accounts.find((a) => a.id === activeId) || null;
  const activeProfile =
    active?.profiles.find((p) => p.id === activeProfileId) || active?.profiles[0] || null;

  const handleAuth = (acc: Account) => {
    setAccounts((prev) => {
      if (prev.some((a) => a.email === acc.email)) return prev;
      return [...prev, acc];
    });
    setActiveId(acc.id);
    setActiveProfileId(null);
    setAuthMode(null);
    setWhosWatching(true);
  };

  const updateActive = (patch: Partial<Account>) => {
    if (!active) return;
    setAccounts((prev) => prev.map((a) => (a.id === active.id ? { ...a, ...patch } : a)));
  };

  if (whosWatching && active) {
    return (
      <WhosWatching
        account={active}
        onPick={(p) => {
          setActiveProfileId(p.id);
          setWhosWatching(false);
        }}
        onUpdate={(profiles) => updateActive({ profiles })}
        onClose={() => setWhosWatching(false)}
      />
    );
  }

  return (
    <div className="px-4 pb-24 pt-4">
      {active && activeProfile ? (
        <LoggedInHeader
          account={active}
          profile={activeProfile}
          onSwitch={() => setWhosWatching(true)}
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
          <button
            onClick={() => active && setEditProfileOpen(true)}
            disabled={!active}
            className="block w-full px-4 py-3 text-left text-sm text-text hover:bg-surface-2 disabled:opacity-50"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setBackupOpen(true)}
            className="block w-full px-4 py-3 text-left text-sm text-text hover:bg-surface-2"
          >
            Backup Settings
          </button>
          <button
            onClick={() => setSyncOpen(true)}
            className="block w-full px-4 py-3 text-left text-sm text-text hover:bg-surface-2"
          >
            Sync Preferences
          </button>
          {active && (
            <button
              onClick={() => {
                setActiveId(null);
                setActiveProfileId(null);
              }}
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

      {editProfileOpen && active && (
        <EditProfileModal
          account={active}
          onClose={() => setEditProfileOpen(false)}
          onSave={(patch) => {
            updateActive(patch);
            setEditProfileOpen(false);
          }}
        />
      )}

      {backupOpen && <BackupModal onClose={() => setBackupOpen(false)} />}
      {syncOpen && <SyncModal onClose={() => setSyncOpen(false)} />}
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
  profile,
  onSwitch,
  onAdd,
}: {
  account: Account;
  profile: SubProfile;
  onSwitch: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/60 p-5 box-glow-purple">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${colorClass(
            profile.color,
          )} text-lg font-bold text-bg ring-2 ring-cyan box-glow-cyan`}
        >
          {profile.kids ? "KiDS" : initials(profile.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-lg font-bold text-text">{profile.name}</h1>
          <p className="truncate text-[11px] text-muted">{account.email}</p>
          {account.bio && <p className="mt-0.5 truncate text-[11px] text-muted">{account.bio}</p>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <Stat v="248h" k="HOURS" />
        <Stat v="84" k="MOVIES" />
        <Stat v={profile.kids ? "—" : "12"} k="SERIES" />
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
  const [touched, setTouched] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 6;
  const usernameValid = mode === "login" || username.trim().length >= 3;
  const emailErr = touched && !emailValid ? "Enter a valid email (name@example.com)" : "";
  const passwordErr = touched && !passwordValid ? "Password must be at least 6 characters" : "";
  const usernameErr =
    touched && mode === "signup" && !usernameValid ? "Username must be at least 3 characters" : "";

  const submit = () => {
    setTouched(true);
    if (!emailValid || !passwordValid || !usernameValid) return;
    const name = mode === "signup" ? username.trim() : email.split("@")[0];
    onSubmit({
      id: crypto.randomUUID(),
      email: email.trim(),
      username: name,
      avatarColor: "cyan-purple",
      bio: "",
      profiles: defaultProfiles(name),
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

        <div className="space-y-3">
          {mode === "signup" && (
            <Field error={usernameErr}>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
              />
            </Field>
          )}
          <Field error={emailErr}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
            />
          </Field>
          <Field error={passwordErr}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (6+ chars)"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
            />
          </Field>
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
            onClick={submit}
            className="flex-1 rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg box-glow-cyan"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div>
      {children}
      {error && <p className="mt-1 text-[11px] text-red">{error}</p>}
    </div>
  );
}

function EditProfileModal({
  account,
  onClose,
  onSave,
}: {
  account: Account;
  onClose: () => void;
  onSave: (patch: Partial<Account>) => void;
}) {
  const [username, setUsername] = useState(account.username);
  const [color, setColor] = useState(account.avatarColor);
  const [bio, setBio] = useState(account.bio);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text">Edit Profile</h3>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
        <label className="text-[10px] uppercase tracking-widest text-muted">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text focus:border-cyan focus:outline-none"
        />
        <label className="mt-3 block text-[10px] uppercase tracking-widest text-muted">Avatar Color</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${c.className} transition ${
                color === c.id ? "ring-2 ring-cyan box-glow-cyan" : "ring-1 ring-border"
              }`}
            />
          ))}
        </div>
        <label className="mt-3 block text-[10px] uppercase tracking-widest text-muted">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell us about yourself"
          className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text">
            Cancel
          </button>
          <button
            onClick={() => onSave({ username: username.trim() || account.username, avatarColor: color, bio })}
            className="flex-1 rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg box-glow-cyan"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function BackupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-green bg-green/10">
            <Check className="h-7 w-7 text-green" />
          </div>
          <h3 className="font-display mt-3 text-base font-bold text-text">Settings backed up successfully</h3>
          <p className="mt-1 text-xs text-muted">Your data is safely stored</p>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-text">
          {["Watchlist", "Preferences", "Watch History"].map((i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-surface-2/70 px-3 py-2">
              <Check className="h-4 w-4 text-green" /> {i}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg box-glow-cyan"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function SyncModal({ onClose }: { onClose: () => void }) {
  const [done, setDone] = useState(false);
  if (!done) setTimeout(() => setDone(true), 2000);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center py-4 text-center">
          {!done ? (
            <>
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan/20 border-t-cyan" />
              <h3 className="font-display mt-4 text-base font-bold text-text">Syncing preferences...</h3>
              <p className="mt-1 text-xs text-muted">Please wait</p>
            </>
          ) : (
            <>
              <div className="grid h-14 w-14 place-items-center rounded-full border border-cyan bg-cyan/10 box-glow-cyan">
                <Check className="h-7 w-7 text-cyan" />
              </div>
              <h3 className="font-display mt-4 text-base font-bold text-text">Sync Complete ✓</h3>
              <p className="mt-1 text-xs text-muted">All devices up to date</p>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          disabled={!done}
          className="mt-2 w-full rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg box-glow-cyan disabled:opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function WhosWatching({
  account,
  onPick,
  onUpdate,
  onClose,
}: {
  account: Account;
  onPick: (p: SubProfile) => void;
  onUpdate: (profiles: SubProfile[]) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-bg px-6 pb-16 pt-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-10 flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-muted hover:text-text">
            ← Back
          </button>
          <h1 className="font-display text-2xl font-bold text-text">Who's watching?</h1>
          <button
            onClick={() => setEditing((e) => !e)}
            className="rounded-lg border border-cyan/60 px-3 py-1.5 text-xs font-bold text-cyan hover:bg-cyan/10"
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {account.profiles.map((p) => (
            <div key={p.id} className="flex flex-col items-center">
              <button
                onClick={() => (editing ? null : onPick(p))}
                className={`group relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${colorClass(
                  p.color,
                )} text-bg shadow-[0_0_20px_rgba(0,245,255,0.25)] transition hover:scale-105 hover:shadow-[0_0_28px_rgba(0,245,255,0.6)]`}
              >
                <span className="font-display text-lg font-bold">
                  {p.kids ? "KiDS" : (p.name[0] || "U").toUpperCase()}
                </span>
                {editing && account.profiles.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(account.profiles.filter((x) => x.id !== p.id));
                    }}
                    className="absolute -right-1 -top-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full border border-red bg-bg text-red"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
              <span className="font-body mt-2 text-sm text-text">{p.kids ? "Kids" : p.name}</span>
            </div>
          ))}

          <div className="flex flex-col items-center">
            <button
              onClick={() => setAddOpen(true)}
              className="grid h-20 w-20 place-items-center rounded-full border border-border bg-surface-2 text-muted transition hover:border-cyan/60 hover:text-cyan"
            >
              <Plus className="h-7 w-7" />
            </button>
            <span className="font-body mt-2 text-sm text-muted">Add Profile</span>
          </div>
        </div>
      </div>

      {addOpen && (
        <CreateProfileModal
          onClose={() => setAddOpen(false)}
          onCreate={(p) => {
            onUpdate([...account.profiles, p]);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateProfileModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: SubProfile) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0].id);
  const [kids, setKids] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text">Create Profile</h3>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
        <label className="text-[10px] uppercase tracking-widest text-muted">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Profile name"
          className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-cyan focus:outline-none"
        />
        <label className="mt-3 block text-[10px] uppercase tracking-widest text-muted">Avatar Color</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`h-10 w-10 rounded-full bg-gradient-to-br ${c.className} transition ${
                color === c.id ? "ring-2 ring-cyan box-glow-cyan" : "ring-1 ring-border"
              }`}
            />
          ))}
        </div>
        <label className="mt-4 flex items-center justify-between text-sm text-text">
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5 text-cyan" /> Kids mode
          </span>
          <button
            onClick={() => setKids((k) => !k)}
            className={`relative h-6 w-11 rounded-full transition ${kids ? "bg-cyan box-glow-cyan" : "bg-surface-2"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg transition ${
                kids ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text">
            Cancel
          </button>
          <button
            disabled={name.trim().length < 2}
            onClick={() =>
              onCreate({
                id: crypto.randomUUID(),
                name: name.trim(),
                color,
                kids,
              })
            }
            className="flex-1 rounded-lg bg-cyan px-4 py-2.5 text-sm font-bold text-bg box-glow-cyan disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
