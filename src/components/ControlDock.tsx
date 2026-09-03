import { useEffect, useReducer } from "react";
import { simClock } from "../sim/clock";

const SPEEDS = [0.5, 1, 2, 4, 8, 16];

interface ToggleState {
  orbits: boolean;
  labels: boolean;
  trails: boolean;
  trueRatios: boolean;
}

interface ControlDockProps {
  playing: boolean;
  speed: number;
  toggles: ToggleState;
  panelOpen: boolean;
  onTogglePlay: () => void;
  onSpeed: (s: number) => void;
  onToggle: (key: keyof ToggleState) => void;
  onReset: () => void;
}

function ElapsedReadout() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const id = window.setInterval(force, 200);
    return () => window.clearInterval(id);
  }, []);
  const years = Math.floor(simClock.days / 365.25);
  const days = Math.floor(simClock.days % 365.25);
  return (
    <div className="min-w-[118px] text-center">
      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-mist">Sim elapsed</p>
      <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-frost">
        T+{years}y <span className="text-ember">{String(days).padStart(3, "0")}</span>d
      </p>
    </div>
  );
}

const Divider = () => <span className="hidden h-8 w-px bg-white/[0.08] sm:block" />;

export default function ControlDock({
  playing,
  speed,
  toggles,
  panelOpen,
  onTogglePlay,
  onSpeed,
  onToggle,
  onReset,
}: ControlDockProps) {
  const toggleDefs: { key: keyof ToggleState; label: string }[] = [
    { key: "orbits", label: "Orbits" },
    { key: "labels", label: "Labels" },
    { key: "trails", label: "Trails" },
    { key: "trueRatios", label: "True ratios" },
  ];

  return (
    <div
      className={`pointer-events-auto absolute bottom-3 left-1/2 z-40 w-max max-w-[96vw] -translate-x-1/2 transition-transform duration-500 sm:bottom-5 ${
        panelOpen ? "sm:-translate-x-[calc(50%+95px)]" : ""
      }`}
    >
      <div className="animate-rise flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 rounded-xl border border-white/10 bg-abyss/[0.88] px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-md sm:px-5" style={{ animationDelay: "0.15s" }}>
        {/* play / pause + reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            aria-label={playing ? "Pause simulation" : "Play simulation"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-ember text-[#2b1602] shadow-[0_0_24px_rgba(255,181,71,0.45)] transition hover:bg-[#ffc76b] hover:shadow-[0_0_34px_rgba(255,181,71,0.6)] active:scale-90"
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1.5" width="3.6" height="11" rx="1" />
                <rect x="8.4" y="1.5" width="3.6" height="11" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3.4 1.6a1 1 0 0 1 1.52-.86l8 5.4a1 1 0 0 1 0 1.7l-8 5.4a1 1 0 0 1-1.52-.85V1.6z" transform="translate(-0.6 0)" />
              </svg>
            )}
          </button>
          <button
            onClick={onReset}
            aria-label="Reset simulation time"
            title="Reset time"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-mist transition hover:border-white/30 hover:text-frost active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
              <path d="M4 1.5v3h3" />
            </svg>
          </button>
        </div>

        <Divider />

        {/* speed */}
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-mist">Speed</span>
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeed(s)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums transition active:scale-90 ${
                  speed === s
                    ? "bg-ember text-[#2b1602] shadow-[0_0_14px_rgba(255,181,71,0.4)]"
                    : "text-mist hover:bg-white/[0.06] hover:text-frost"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <ElapsedReadout />

        <Divider />

        {/* layer toggles */}
        <div className="flex items-center gap-3">
          {toggleDefs.map((t) => {
            const on = toggles[t.key];
            return (
              <button
                key={t.key}
                onClick={() => onToggle(t.key)}
                aria-pressed={on}
                className={`group flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
                  on ? "text-frost" : "text-mist/60 hover:text-mist"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    on ? "bg-ice shadow-[0_0_8px_rgba(127,216,232,0.8)]" : "bg-white/20 group-hover:bg-white/35"
                  }`}
                />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
