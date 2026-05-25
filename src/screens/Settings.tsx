import { useState } from "react";

export default function Settings() {
  const [s, setS] = useState({
    quality: "Auto",
    autoplay: true,
    hwAccel: true,
    extPlayer: false,
    subSize: 18,
    subColor: "white",
    subLang: "English",
    preferredSource: "CloudStream",
    timeout: 15,
    autoBest: true,
    theme: "Dark",
    motion: "Normal",
    appLock: false,
    analytics: true,
  });
  const u = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS((p) => ({ ...p, [k]: v }));

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="font-display text-xl font-bold text-text">Settings</h1>

      <Section title="Playback">
        <Select label="Default Quality" value={s.quality} onChange={(v) => u("quality", v)} options={["Auto", "1080p", "720p", "480p"]} />
        <Toggle label="Autoplay Next Episode" on={s.autoplay} onChange={(v) => u("autoplay", v)} />
        <Toggle label="Hardware Acceleration" on={s.hwAccel} onChange={(v) => u("hwAccel", v)} />
        <Toggle label="External Player Support" on={s.extPlayer} onChange={(v) => u("extPlayer", v)} />
      </Section>

      <Section title="Subtitles">
        <Slider label={`Font Size (${s.subSize}px)`} value={s.subSize} min={12} max={32} onChange={(v) => u("subSize", v)} />
        <Select label="Subtitle Color" value={s.subColor} onChange={(v) => u("subColor", v)} options={["white", "yellow", "cyan"]} />
        <Select label="Preferred Language" value={s.subLang} onChange={(v) => u("subLang", v)} options={["English", "Spanish", "French", "Italian", "Turkish", "Japanese"]} />
      </Section>

      <Section title="Streaming">
        <Select label="Preferred Source" value={s.preferredSource} onChange={(v) => u("preferredSource", v)} options={["CloudStream", "Phisher", "MegaRepo", "doGior's", "KEKIK"]} />
        <Slider label={`Source Timeout (${s.timeout}s)`} value={s.timeout} min={5} max={30} onChange={(v) => u("timeout", v)} />
        <Toggle label="Auto-select Best Source" on={s.autoBest} onChange={(v) => u("autoBest", v)} />
      </Section>

      <Section title="Appearance">
        <Select label="Theme Mode" value={s.theme} onChange={(v) => u("theme", v)} options={["Dark", "AMOLED", "Dark Cyan"]} />
        <Select label="Animation Intensity" value={s.motion} onChange={(v) => u("motion", v)} options={["Subtle", "Normal", "High"]} />
      </Section>

      <Section title="Privacy">
        <Toggle label="App Lock" on={s.appLock} onChange={(v) => u("appLock", v)} />
        <Toggle label="Analytics" on={s.analytics} onChange={(v) => u("analytics", v)} />
        <button className="mt-2 w-full rounded-lg border border-red/60 px-4 py-2.5 text-sm font-semibold text-red">
          Clear Watch History
        </button>
      </Section>

      <Section title="About">
        <Row label="App Version" value="ZCast v1.0.0" />
        <Row label="Engine" value="CloudStream" />
        <p className="mt-3 text-center text-[11px] text-muted">Powered by CloudStream</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-display mb-2 text-[11px] font-bold tracking-widest text-cyan">{title.toUpperCase()}</h2>
      <div className="glass space-y-3 rounded-2xl border border-border p-4">{children}</div>
    </section>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text">{label}</span>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full ${on ? "bg-cyan box-glow-cyan" : "bg-surface-2"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-text">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-text focus:border-cyan focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 text-sm text-text">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#00f5ff]"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
