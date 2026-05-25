import {
  ArrowLeft,
  Cast,
  ChevronUp,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Subtitles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { img, titleOf, type TmdbItem } from "@/lib/tmdb";

const QUALITIES = ["Auto", "1080p", "720p", "480p"];
const SPEEDS = ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"];

export default function Player({ item, onClose }: { item: TmdbItem; onClose: () => void }) {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(412);
  const total = 7200;
  const [show, setShow] = useState(true);
  const [quality, setQuality] = useState("Auto");
  const [speed, setSpeed] = useState("1x");
  const [menu, setMenu] = useState<null | "quality" | "speed" | "source">(null);
  const hide = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((p) => Math.min(p + 1, total)), 1000);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!show) return;
    if (hide.current) window.clearTimeout(hide.current);
    hide.current = window.setTimeout(() => setShow(false), 3000);
    return () => {
      if (hide.current) window.clearTimeout(hide.current);
    };
  }, [show, playing, menu]);

  const fmt = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={() => setShow((s) => !s)}>
      {item.backdrop_path && (
        <img
          src={img(item.backdrop_path, "original")}
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
      )}

      {show && (
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/60 via-transparent to-black/80 p-4 fade-in">
          <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="glass grid h-10 w-10 place-items-center rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="font-display text-sm font-bold tracking-widest text-text">
              {titleOf(item).toUpperCase()}
            </div>
            <button className="glass grid h-10 w-10 place-items-center rounded-full">
              <Cast className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-10" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setT((p) => Math.max(0, p - 10))} className="glass grid h-14 w-14 place-items-center rounded-full">
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid h-20 w-20 place-items-center rounded-full bg-cyan text-bg box-glow-cyan"
            >
              {playing ? <Pause className="h-8 w-8" fill="currentColor" /> : <Play className="h-8 w-8" fill="currentColor" />}
            </button>
            <button onClick={() => setT((p) => Math.min(total, p + 10))} className="glass grid h-14 w-14 place-items-center rounded-full">
              <RotateCw className="h-5 w-5" />
            </button>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-3">
              <span className="text-[11px] text-text">{fmt(t)}</span>
              <input
                type="range"
                min={0}
                max={total}
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                className="flex-1 accent-[#00f5ff]"
              />
              <span className="text-[11px] text-muted">{fmt(total)}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button className="rounded-lg border border-cyan/60 px-3 py-1 text-[11px] font-semibold text-cyan">
                Skip Intro
              </button>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <PillBtn icon={<Subtitles className="h-3 w-3" />} label="CC" />
                <Picker label={speed} active={menu === "speed"} onClick={() => setMenu((m) => (m === "speed" ? null : "speed"))} options={SPEEDS} onSelect={(v) => { setSpeed(v); setMenu(null); }} />
                <Picker label={quality} active={menu === "quality"} onClick={() => setMenu((m) => (m === "quality" ? null : "quality"))} options={QUALITIES} onSelect={(v) => { setQuality(v); setMenu(null); }} />
                <Picker label="Source" active={menu === "source"} onClick={() => setMenu((m) => (m === "source" ? null : "source"))} options={["CloudStream", "Phisher", "MegaRepo", "KEKIK"]} onSelect={() => setMenu(null)} />
                <PillBtn icon={<Maximize className="h-3 w-3" />} label="" />
              </div>
              <button className="rounded-lg bg-cyan px-3 py-1 text-[11px] font-bold text-bg box-glow-cyan">
                Next Episode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PillBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="glass inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-text">
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}

function Picker({
  label,
  active,
  onClick,
  options,
  onSelect,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative">
      <button onClick={onClick} className="glass inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-text">
        <span>{label}</span>
        <ChevronUp className={`h-3 w-3 transition ${active ? "rotate-0" : "rotate-180"}`} />
      </button>
      {active && (
        <div className="glass absolute bottom-9 right-0 min-w-[110px] overflow-hidden rounded-lg border border-border">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onSelect(o)}
              className="block w-full px-3 py-1.5 text-left text-[11px] text-text hover:bg-cyan/15"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
