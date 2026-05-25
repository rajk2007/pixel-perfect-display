import { Home, Search, Layers, Settings, User } from "lucide-react";
import type { ComponentType } from "react";

export type Tab = "home" | "search" | "sources" | "settings" | "profile";

const TABS: { id: Tab; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "search", label: "Search", Icon: Search },
  { id: "sources", label: "Sources", Icon: Layers },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "profile", label: "Profile", Icon: User },
];

export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <ul className="mx-auto flex max-w-xl items-center justify-around">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
              >
                <Icon
                  className={`h-5 w-5 transition ${active ? "text-cyan glow-cyan" : "text-muted"}`}
                />
                {active && (
                  <>
                    <span className="font-display text-[10px] font-bold tracking-widest text-cyan">
                      {label.toUpperCase()}
                    </span>
                    <span className="absolute -bottom-1 h-[2px] w-8 rounded-full bg-cyan shadow-[0_0_8px_#00f5ff]" />
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
