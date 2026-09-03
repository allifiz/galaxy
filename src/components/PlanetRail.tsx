import { BODIES } from "../data/planets";

interface PlanetRailProps {
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
}

export default function PlanetRail({ selectedId, hoveredId, onSelect }: PlanetRailProps) {
  return (
    <nav
      className="animate-rise absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-start gap-0.5 md:flex lg:left-6"
      style={{ animationDelay: "0.3s" }}
      aria-label="Celestial bodies"
    >
      <span className="mb-2 ml-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-mist/50 [writing-mode:vertical-lr] [transform:rotate(180deg)]">
        Bodies
      </span>
      {BODIES.map((b) => {
        const active = selectedId === b.id;
        const hot = hoveredId === b.id || active;
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className="group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-[7px] text-left transition hover:bg-white/[0.04]"
            aria-pressed={active}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${b.colors.light}, ${b.colors.base} 60%, ${b.colors.dark})`,
                boxShadow: hot ? `0 0 10px ${b.colors.glow}` : "none",
                transform: hot ? "scale(1.35)" : "scale(1)",
              }}
            />
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ${
                active ? "text-frost opacity-100" : hot ? "text-mist opacity-100" : "text-mist opacity-0 group-hover:opacity-100"
              }`}
            >
              {b.name}
            </span>
            <span
              className={`ml-auto h-px transition-all duration-300 ${active ? "w-5 bg-ember" : "w-0 bg-transparent"}`}
            />
          </button>
        );
      })}
    </nav>
  );
}
