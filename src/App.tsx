import { useCallback, useEffect, useState } from "react";
import SolarCanvas from "./components/SolarCanvas";
import InfoPanel from "./components/InfoPanel";
import ControlDock from "./components/ControlDock";
import PlanetRail from "./components/PlanetRail";
import { PLANETS, bodyById } from "./data/planets";
import { simClock } from "./sim/clock";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

interface Toggles {
  orbits: boolean;
  labels: boolean;
  trails: boolean;
  trueRatios: boolean;
}

export default function App() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [toggles, setToggles] = useState<Toggles>({ orbits: true, labels: true, trails: true, trueRatios: false });

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setTouched(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inControl = tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA";
      if (e.code === "Space") {
        if (inControl) return; // let focused buttons behave normally
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (/^[1-8]$/.test(e.key)) {
        const b = PLANETS[Number(e.key) - 1];
        setSelectedId(b.id);
        setTouched(true);
      } else if (e.key === "0") {
        setSelectedId("sun");
        setTouched(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selected = bodyById(selectedId);

  return (
    <div className="font-body relative h-full w-full overflow-hidden bg-void text-frost">
      {/* ambient deep-space layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 12% -8%, rgba(21,58,84,0.55), transparent 62%)," +
            "radial-gradient(900px 620px at 88% 14%, rgba(28,44,96,0.42), transparent 60%)," +
            "radial-gradient(760px 760px at 50% 46%, rgba(64,36,16,0.28), transparent 58%)," +
            "radial-gradient(1000px 800px at 30% 110%, rgba(16,42,66,0.5), transparent 60%)," +
            "linear-gradient(180deg, #060a17 0%, #05070f 55%, #070a16 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />

      {/* the orrery */}
      <SolarCanvas
        playing={playing}
        speed={speed}
        selectedId={selectedId}
        showOrbits={toggles.orbits}
        showLabels={toggles.labels}
        showTrails={toggles.trails}
        trueRatios={toggles.trueRatios}
        onSelect={handleSelect}
        onHover={setHoverId}
      />

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(3,5,12,0.6) 100%)" }}
      />

      {/* header */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between p-4 sm:p-5">
        <div className="animate-rise flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
            <circle cx="17" cy="17" r="5.4" fill="#FFB547" />
            <circle cx="17" cy="17" r="5.4" fill="none" stroke="rgba(255,181,71,0.4)" strokeWidth="3" opacity="0.35" />
            <ellipse cx="17" cy="17" rx="14.5" ry="6" stroke="#7FD8E8" strokeWidth="1.4" transform="rotate(-18 17 17)" opacity="0.85" />
            <circle cx="29" cy="11.5" r="2" fill="#7FD8E8" />
          </svg>
          <div>
            <h1 className="font-display text-[15px] font-bold leading-none tracking-[0.3em] text-frost">ORRERY</h1>
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.34em] text-mist/80">Solar System Atlas</p>
          </div>
        </div>

        <div className="animate-rise hidden items-center gap-4 text-[10px] text-mist lg:flex" style={{ animationDelay: "0.25s" }}>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-semibold text-frost/80">SPACE</kbd>
            play / pause
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-semibold text-frost/80">1–8</kbd>
            jump to planet
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-semibold text-frost/80">ESC</kbd>
            close
          </span>
        </div>
      </header>

      {/* first-run hint */}
      {!touched && (
        <div className="animate-hint-pulse pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 sm:top-20">
          <div className="flex items-center gap-2.5 rounded-full border border-ice/25 bg-abyss/70 px-4 py-2 backdrop-blur-sm">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#7FD8E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 1.8v8.4l2.1-2 1.5 3.4 1.7-.8-1.5-3.3h2.9L6.5 1.8z" />
            </svg>
            <span className="text-[11px] font-medium tracking-wide text-ice">Click any planet to open its dossier</span>
          </div>
        </div>
      )}

      <PlanetRail selectedId={selectedId} hoveredId={hoverId} onSelect={(id) => handleSelect(id)} />

      <InfoPanel body={selected} onClose={() => setSelectedId(null)} />

      <ControlDock
        playing={playing}
        speed={speed}
        toggles={toggles}
        panelOpen={!!selectedId}
        onTogglePlay={() => setPlaying((p) => !p)}
        onSpeed={setSpeed}
        onToggle={(k) => setToggles((t) => ({ ...t, [k]: !t[k] }))}
        onReset={() => {
          simClock.days = 0;
        }}
      />
    </div>
  );
}
