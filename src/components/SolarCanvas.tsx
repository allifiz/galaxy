import { useEffect, useRef } from "react";
import { PLANETS, MAX_AU, type Body } from "../data/planets";
import { BASE_DAYS_PER_SECOND, simClock } from "../sim/clock";

export interface SolarCanvasProps {
  playing: boolean;
  speed: number;
  selectedId: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  showTrails: boolean;
  trueRatios: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

interface Star {
  ux: number;
  uy: number;
  r: number;
  tw: number;
  ph: number;
  drift: number;
  tint: string;
}

interface Asteroid {
  rf: number; // fraction between mars & jupiter orbit radii
  a0: number;
  period: number;
  size: number;
  alpha: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

interface Hit {
  id: string;
  x: number;
  y: number;
  r: number;
}

const TAU = Math.PI * 2;

function orbitRadius(au: number, maxR: number): number {
  return maxR * 0.115 + maxR * 0.885 * Math.sqrt(au / MAX_AU);
}

function planetSize(b: Body, trueRatios: boolean): number {
  if (trueRatios) {
    return Math.max(1.4, (b.diameterKm / 142984) * 10.5);
  }
  return Math.min(17, Math.max(3.6, Math.pow(b.diameterKm / 12756, 0.42) * 7.6));
}

export default function SolarCanvas({
  playing,
  speed,
  selectedId,
  showOrbits,
  showLabels,
  showTrails,
  trueRatios,
  onSelect,
  onHover,
}: SolarCanvasProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const live = useRef({
    playing,
    speed,
    selectedId,
    showOrbits,
    showLabels,
    showTrails,
    trueRatios,
    onSelect,
    onHover,
  });
  live.current = {
    playing,
    speed,
    selectedId,
    showOrbits,
    showLabels,
    showTrails,
    trueRatios,
    onSelect,
    onHover,
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let belt: Asteroid[] = [];
    const meteors: Meteor[] = [];
    let meteorTimer = 4;
    const hits: Hit[] = [];
    let hoverId: string | null = null;
    let offsetX = 0;
    let raf = 0;
    let last = performance.now();
    let tAbs = 0;

    const seed = () => {
      const count = Math.min(520, Math.floor((w * h) / 2400));
      stars = Array.from({ length: count }, () => ({
        ux: Math.random(),
        uy: Math.random(),
        r: Math.random() < 0.85 ? 0.6 + Math.random() * 0.7 : 1.3 + Math.random() * 0.9,
        tw: 0.6 + Math.random() * 2.2,
        ph: Math.random() * TAU,
        drift: 1.2 + Math.random() * 3.5,
        tint: Math.random() < 0.12 ? "#ffd9a0" : Math.random() < 0.2 ? "#a8d8ff" : "#e8eefc",
      }));
      belt = Array.from({ length: 150 }, () => ({
        rf: Math.random(),
        a0: Math.random() * TAU,
        period: 1300 + Math.random() * 1600,
        size: 0.4 + Math.random() * 0.9,
        alpha: 0.12 + Math.random() * 0.3,
      }));
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      seed();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const pick = (mx: number, my: number): string | null => {
      let best: Hit | null = null;
      let bestD = Infinity;
      for (const ht of hits) {
        const d = Math.hypot(mx - ht.x, my - ht.y);
        if (d < ht.r + 10 && d < bestD) {
          best = ht;
          bestD = d;
        }
      }
      return best ? best.id : null;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const id = pick(e.clientX - rect.left, e.clientY - rect.top);
      if (id !== hoverId) {
        hoverId = id;
        canvas.style.cursor = id ? "pointer" : "default";
        live.current.onHover(id);
      }
    };

    const onLeave = () => {
      if (hoverId !== null) {
        hoverId = null;
        live.current.onHover(null);
        canvas.style.cursor = "default";
      }
    };

    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const id = pick(e.clientX - rect.left, e.clientY - rect.top);
      live.current.onSelect(id); // null → deselects empty-space clicks
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onClick);

    /* ---------- drawing helpers ---------- */

    const drawSun = (cx: number, cy: number, r: number) => {
      const pulse = 1 + Math.sin(tAbs * 1.4) * 0.05 + Math.sin(tAbs * 2.3) * 0.03;
      const glowR = r * 4.6 * pulse;
      let g = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, glowR);
      g.addColorStop(0, "rgba(255,190,90,0.34)");
      g.addColorStop(0.35, "rgba(255,150,60,0.13)");
      g.addColorStop(1, "rgba(255,140,50,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, TAU);
      ctx.fill();

      g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
      g.addColorStop(0, "#fff8e2");
      g.addColorStop(0.45, "#ffd067");
      g.addColorStop(1, "#ff8a3d");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();

      // corona wisps
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tAbs * 0.08);
      ctx.strokeStyle = "rgba(255,200,120,0.20)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r * (1.5 + i * 0.55), i * 2.1, i * 2.1 + 1.1 + i * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawSphere = (x: number, y: number, r: number, b: Body, cx: number, cy: number) => {
      const toSun = Math.atan2(cy - y, cx - x);
      const gx = x + Math.cos(toSun) * r * 0.5;
      const gy = y + Math.sin(toSun) * r * 0.5;
      const g = ctx.createRadialGradient(gx, gy, r * 0.12, x, y, r * 1.02);
      g.addColorStop(0, b.colors.light);
      g.addColorStop(0.55, b.colors.base);
      g.addColorStop(1, b.colors.dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();

      if (b.bands && r > 5) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.clip();
        ctx.fillStyle = "rgba(60,32,14,0.16)";
        const bands = 4;
        for (let i = 0; i < bands; i++) {
          const by = y - r + ((i + 0.5) / bands) * 2 * r;
          ctx.fillRect(x - r, by, r * 2, r * 0.16);
        }
        ctx.restore();
      }
    };

    const drawRings = (x: number, y: number, r: number, kind: "saturn" | "uranus", front: boolean) => {
      if (kind === "uranus") {
        if (!front) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(1.35);
        ctx.strokeStyle = "rgba(154,223,223,0.32)";
        ctx.lineWidth = Math.max(1, r * 0.09);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.65, r * 0.55, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
        return;
      }
      // Saturn
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.32);
      ctx.scale(1, 0.36);
      const stroke = (radius: number, width: number, alpha: number) => {
        ctx.strokeStyle = `rgba(222,196,140,${alpha})`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.arc(0, 0, radius, front ? 0 : Math.PI, front ? Math.PI : TAU);
        ctx.stroke();
      };
      const base = front ? 0.85 : 0.4;
      stroke(r * 1.75, r * 0.42, 0.6 * base);
      stroke(r * 2.15, r * 0.16, 0.4 * base);
      ctx.restore();
    };

    const label = (text: string, x: number, y: number, alpha: number, color: string, size = 10) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `500 ${size}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(4,8,20,0.9)";
      ctx.shadowBlur = 6;
      ctx.fillStyle = color;
      ctx.fillText(text.toUpperCase(), x, y);
      ctx.restore();
    };

    /* ---------- main loop ---------- */

    const frame = (now: number) => {
      const p = live.current;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      tAbs += dt;
      if (p.playing) simClock.days += dt * BASE_DAYS_PER_SECOND * p.speed;
      const days = simClock.days;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      try {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = "1.5px";
      } catch {
        /* older engines */
      }

      const panelOpen = !!p.selectedId && w > 1024;
      const targetOff = panelOpen ? -Math.min(190, w * 0.13) : 0;
      offsetX += (targetOff - offsetX) * Math.min(1, dt * 5);

      const cx = w / 2 + offsetX;
      const cy = h / 2;
      const maxR = Math.min(w, h) / 2 - Math.min(w, h) * 0.06;
      const sunR = Math.max(16, Math.min(30, maxR * 0.085));

      /* stars */
      for (const s of stars) {
        const sx = ((s.ux * w + tAbs * s.drift) % w + w) % w;
        const sy = s.uy * h;
        const twk = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tAbs * s.tw + s.ph));
        ctx.globalAlpha = twk * 0.8;
        ctx.fillStyle = s.tint;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* meteors */
      meteorTimer -= dt;
      if (meteorTimer <= 0 && meteors.length < 2) {
        meteorTimer = 5 + Math.random() * 6;
        const fromLeft = Math.random() < 0.5;
        meteors.push({
          x: fromLeft ? -40 : w * (0.4 + Math.random() * 0.6),
          y: Math.random() * h * 0.4,
          vx: (fromLeft ? 1 : -0.6) * (260 + Math.random() * 180),
          vy: 140 + Math.random() * 120,
          life: 0,
          max: 0.9 + Math.random() * 0.5,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life > m.max) {
          meteors.splice(i, 1);
          continue;
        }
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const tail = 0.16;
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
        g.addColorStop(0, `rgba(232,240,255,${0.75 * fade})`);
        g.addColorStop(1, "rgba(232,240,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
        ctx.stroke();
      }

      /* orbits */
      const sel = p.selectedId;
      if (p.showOrbits) {
        for (const b of PLANETS) {
          const r = orbitRadius(b.au, maxR);
          const active = sel === b.id || hoverId === b.id;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, TAU);
          if (active) {
            ctx.strokeStyle = b.colors.glow;
            ctx.lineWidth = 1.4;
            ctx.shadowColor = b.colors.glow;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = sel === b.id ? 0.9 : 0.55;
          } else {
            ctx.strokeStyle = "rgba(148,170,220,0.16)";
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      /* asteroid belt */
      const marsR = orbitRadius(1.52, maxR);
      const jupR = orbitRadius(5.2, maxR);
      for (const a of belt) {
        const r = marsR * 1.22 + (jupR * 0.82 - marsR * 1.22) * a.rf;
        const ang = a.a0 + (TAU * days) / a.period;
        const ax = cx + Math.cos(ang) * r;
        const ay = cy + Math.sin(ang) * r;
        ctx.globalAlpha = a.alpha;
        ctx.fillStyle = "#9aa7bf";
        ctx.beginPath();
        ctx.arc(ax, ay, a.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      hits.length = 0;

      /* sun */
      drawSun(cx, cy, sunR);
      hits.push({ id: "sun", x: cx, y: cy, r: sunR + 4 });
      if (sel === "sun" || hoverId === "sun") {
        ctx.save();
        ctx.strokeStyle = "rgba(255,181,71,0.85)";
        ctx.setLineDash([4, 5]);
        ctx.lineDashOffset = -tAbs * 22;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, sunR + 8, 0, TAU);
        ctx.stroke();
        ctx.restore();
        label("Sun", cx, cy - sunR - 14, 0.95, "#ffd9a0", 11);
      }

      /* planets */
      for (const b of PLANETS) {
        const r = orbitRadius(b.au, maxR);
        const theta = b.theta0 + (TAU * days) / b.periodDays;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        const pr = planetSize(b, p.trueRatios);
        const active = sel === b.id || hoverId === b.id;

        /* trail */
        if (p.showTrails) {
          const span = Math.min(1.35, (TAU * 45) / b.periodDays + 0.12);
          const segs = 22;
          for (let i = 0; i < segs; i++) {
            const a0 = theta - span + (span * i) / segs;
            const a1 = theta - span + (span * (i + 1)) / segs + 0.008;
            ctx.beginPath();
            ctx.arc(cx, cy, r, a0, a1);
            ctx.strokeStyle = b.colors.glow;
            ctx.globalAlpha = Math.pow(i / segs, 2) * 0.5;
            ctx.lineWidth = Math.max(1.2, pr * 0.36);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        if (b.ring) drawRings(x, y, pr, b.ring, false);
        drawSphere(x, y, pr, b, cx, cy);
        if (b.ring) drawRings(x, y, pr, b.ring, true);

        /* Earth's moon */
        if (b.hasMoon) {
          const mr = pr + 7;
          const ma = (TAU * days) / 27.3;
          const mx = x + Math.cos(ma) * mr;
          const my = y + Math.sin(ma) * mr * 0.7;
          ctx.fillStyle = "#c9d2e4";
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(1.2, pr * 0.22), 0, TAU);
          ctx.fill();
        }

        if (active) {
          ctx.save();
          ctx.strokeStyle = b.colors.accent;
          ctx.setLineDash([4, 5]);
          ctx.lineDashOffset = -tAbs * 22;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(x, y, pr + 6.5, 0, TAU);
          ctx.stroke();
          ctx.restore();
          ctx.shadowColor = b.colors.glow;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(x, y, pr + 0.4, 0, TAU);
          ctx.strokeStyle = b.colors.glow;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        hits.push({ id: b.id, x, y, r: pr });

        if (p.showLabels || active) {
          const strong = active;
          label(b.name, x, y - pr - (b.ring === "saturn" ? pr * 0.9 : 0) - 9, strong ? 0.95 : 0.5, strong ? b.colors.light : "#aebbdd", strong ? 11 : 9.5);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Solar system simulation" role="img" />
    </div>
  );
}
