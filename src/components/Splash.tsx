import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

const REPOS = [
  { name: "CloudStream Providers", desc: "Official provider bundle" },
  { name: "Phisher Repo", desc: "Anime and mixed-content providers" },
  { name: "MegaRepo", desc: "Large multi-provider catalog" },
  { name: "doGior's Had Enough", desc: "Community-maintained collection" },
  { name: "KEKIK Repo", desc: "Turkish and international providers" },
];

export default function Splash({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, REPOS.length)), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(p + 2.5, 100);
      setProgress(p);
      if (p >= 100) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  const done = progress >= 100;

  return (
    <div className="radial-purple fixed inset-0 z-50 flex flex-col items-center justify-center px-6">
      <div className="animate-pulse-glow flex items-center gap-3">
        <Zap className="h-10 w-10 text-cyan" fill="currentColor" />
        <h1 className="font-display glow-cyan text-cyan text-4xl font-black tracking-widest">ZCAST</h1>
      </div>

      <p className="mt-8 text-sm text-text/80">Preparing streaming sources...</p>
      <p className="text-xs text-muted">Optimizing providers and content indexes</p>

      <div className="mt-10 w-full max-w-md space-y-2">
        {REPOS.map((r, i) => {
          const state = i < step ? "ready" : i === step ? "loading" : "pending";
          return (
            <div
              key={r.name}
              className={`fade-in glass flex items-center justify-between rounded-xl px-4 py-3 ${
                state === "pending" ? "opacity-40" : ""
              }`}
            >
              <div>
                <div className="font-display text-sm text-text">{r.name}</div>
                <div className="text-[11px] text-muted">{r.desc}</div>
              </div>
              <div className="flex items-center gap-2">
                {state === "loading" && (
                  <>
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-2">
                      <div className="bar-stripe h-full w-full bg-cyan" />
                    </div>
                    <span className="text-[10px] text-cyan">LOADING</span>
                  </>
                )}
                {state === "ready" && (
                  <>
                    <span className="text-green">✓</span>
                    <span className="text-[10px] font-bold text-green">READY</span>
                  </>
                )}
                {state === "pending" && <span className="text-[10px] text-muted">QUEUED</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 w-full max-w-md">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-cyan to-purple transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          <span>{done ? "✓ Initialization Complete" : "Bootstrapping engine"}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
