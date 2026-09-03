import { useEffect, useState } from "react";
import { EARTH_DIAMETER, MAX_DIAMETER, type Body } from "../data/planets";

interface InfoPanelProps {
  body: Body | null;
  onClose: () => void;
}

function StatRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-b-0">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-mist">{label}</span>
      <span className={`text-right text-[13px] leading-snug ${strong ? "font-semibold text-frost" : "text-frost/90"}`}>
        {value}
      </span>
    </div>
  );
}

export default function InfoPanel({ body, onClose }: InfoPanelProps) {
  // keep last body rendered during the slide-out transition
  const [rendered, setRendered] = useState<Body | null>(body);
  useEffect(() => {
    if (body) setRendered(body);
  }, [body]);

  const open = body !== null;
  const b = rendered;

  const sizePct = b ? Math.round(Math.pow(b.diameterKm / MAX_DIAMETER, 0.4) * 100) : 0;
  const earthRatio = b ? b.diameterKm / EARTH_DIAMETER : 0;
  const earthLabel =
    earthRatio >= 10
      ? `${Math.round(earthRatio).toLocaleString()}× Earth`
      : `${earthRatio.toFixed(earthRatio < 1 ? 2 : 1)}× Earth`;

  return (
    <aside
      className={`absolute bottom-24 right-3 top-3 z-30 w-[338px] max-w-[88vw] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:right-4 sm:top-4 sm:bottom-28 ${
        open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[115%] opacity-0"
      }`}
      aria-hidden={!open}
    >
      {b && (
        <div
          key={b.id}
          className="animate-panel-in flex h-full flex-col overflow-hidden rounded-xl border bg-hull/[0.92] shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-md"
          style={{ borderColor: `${b.colors.accent}44` }}
        >
          {/* header */}
          <div
            className="relative shrink-0 px-6 pb-5 pt-6"
            style={{
              background: `linear-gradient(160deg, ${b.colors.accent}24, transparent 62%)`,
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-mist transition hover:border-white/30 hover:text-frost active:scale-90"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>

            <div className="flex items-center gap-5">
              {/* sphere preview */}
              <div className="relative h-[86px] w-[86px] shrink-0">
                {b.ring === "saturn" && (
                  <>
                    <div
                      className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[5px]"
                      style={{ borderColor: `${b.colors.accent}66`, transform: "translate(-50%,-50%) rotate(-18deg) scaleY(0.34)" }}
                    />
                    <div
                      className="absolute left-1/2 top-1/2 h-[182%] w-[182%] rounded-[50%] border-2"
                      style={{ borderColor: `${b.colors.accent}33`, transform: "translate(-50%,-50%) rotate(-18deg) scaleY(0.34)" }}
                    />
                  </>
                )}
                {b.ring === "uranus" && (
                  <div
                    className="absolute left-1/2 top-1/2 h-[160%] w-[160%] rounded-[50%] border-2"
                    style={{ borderColor: `${b.colors.accent}55`, transform: "translate(-50%,-50%) rotate(72deg) scaleY(0.4)" }}
                  />
                )}
                <div
                  className="h-full w-full rounded-full shadow-[inset_-10px_-8px_22px_rgba(0,0,0,0.55)]"
                  style={{
                    background: `radial-gradient(circle at 32% 30%, ${b.colors.light}, ${b.colors.base} 52%, ${b.colors.dark} 100%)`,
                    boxShadow: `0 0 34px ${b.colors.glow}, inset -10px -8px 22px rgba(0,0,0,0.5)`,
                  }}
                />
              </div>

              <div className="min-w-0">
                <span
                  className="inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em]"
                  style={{ borderColor: `${b.colors.accent}66`, color: b.colors.accent, background: `${b.colors.accent}14` }}
                >
                  {b.kind}
                </span>
                <h2 className="font-display mt-2 text-[22px] font-semibold leading-none tracking-tight text-frost">
                  {b.name}
                </h2>
                <p className="mt-1.5 text-[11px] tracking-wide text-mist">
                  {b.au > 0 ? `Planet №${["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"].indexOf(b.id) + 1} from the Sun` : "Our home star"}
                </p>
              </div>
            </div>
          </div>

          {/* scrollable body */}
          <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <div className="mt-1">
              <StatRow label="Diameter" value={`${b.diameterKm.toLocaleString()} km`} strong />
              <StatRow label="Dist. from Sun" value={b.distLabel} strong />
              <StatRow label="Orbital period" value={b.periodLabel} strong />
              <StatRow label="Day length" value={b.dayLabel} />
              <StatRow label="Moons" value={b.moonsLabel} />
              <StatRow label="Mean temp" value={b.tempLabel} />
              {b.speedKms > 0 && <StatRow label="Orbital speed" value={`${b.speedKms.toFixed(1)} km/s`} />}
            </div>

            {/* size comparison */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-mist">Scale · vs Jupiter</span>
                <span className="text-[11px] font-semibold" style={{ color: b.colors.accent }}>
                  {earthLabel}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${Math.max(4, sizePct)}%`,
                    background: `linear-gradient(90deg, ${b.colors.dark}, ${b.colors.accent})`,
                  }}
                />
              </div>
            </div>

            {/* fact */}
            <div
              className="mt-5 rounded-r-lg border-l-2 py-3 pl-4 pr-3"
              style={{ borderColor: b.colors.accent, background: `${b.colors.accent}0f` }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-mist">Field note</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-frost/90">{b.fact}</p>
            </div>

            <p className="mt-5 text-[10px] leading-relaxed text-mist/70">
              Orbital periods run at true relative rates. Distances and sizes are compressed so all eight worlds stay in view.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
