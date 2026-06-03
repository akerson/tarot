import { useMemo } from "react";
import { mulberry32 } from "../../game/engine/rng";

// ─────────────────────────────────────────────────────────────────────────────
//  Procedural arcana sigil — a deterministic, symmetric occult glyph generated
//  from a hero's artSeed. Every card gets a unique, hand-drawn-looking sigil:
//  star polygons, orbiting nodes, radial spokes and concentric rings, rendered
//  in neon with a glow filter. This is what makes the set read as "curated."
// ─────────────────────────────────────────────────────────────────────────────

interface SigilProps {
  seed: number;
  color: string;
  color2?: string;
  size?: number;
  strokeWidth?: number;
  opacity?: number;
}

export function Sigil({ seed, color, color2, size = 200, strokeWidth = 1.4, opacity = 1 }: SigilProps) {
  const id = useMemo(() => `sig${seed}-${Math.round(Math.random() * 1e6)}`, [seed]);
  const { paths, dots, rings, points } = useMemo(() => buildSigil(seed), [seed]);
  const c = 50;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ opacity, overflow: "visible" }}>
      <defs>
        <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`rg-${id}`}>
          <stop offset="0%" stopColor={color2 ?? color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g filter={`url(#glow-${id})`} stroke={`url(#rg-${id})`} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {rings.map((r, i) => (
          <circle key={`r${i}`} cx={c} cy={c} r={r} opacity={0.55} />
        ))}
        {paths.map((d, i) => (
          <path key={`p${i}`} d={d} opacity={0.9} />
        ))}
        {points.map((p, i) => (
          <line key={`l${i}`} x1={c} y1={c} x2={p.x} y2={p.y} opacity={0.3} strokeWidth={strokeWidth * 0.6} />
        ))}
      </g>
      <g fill={color2 ?? color} filter={`url(#glow-${id})`}>
        {dots.map((p, i) => (
          <circle key={`d${i}`} cx={p.x} cy={p.y} r={p.r} opacity={0.95} />
        ))}
      </g>
    </svg>
  );
}

interface Pt { x: number; y: number; r: number; }

function buildSigil(seed: number) {
  const rnd = mulberry32(seed * 2654435761 + 7);
  const c = 50;
  const n = 5 + Math.floor(rnd() * 5); // 5..9 points
  const radius = 30 + rnd() * 8;
  const rot = rnd() * Math.PI * 2;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    pts.push({ x: c + Math.cos(a) * radius, y: c + Math.sin(a) * radius });
  }

  // Star polygon — connect each point to the one `skip` ahead.
  const skip = 1 + Math.floor(rnd() * Math.floor(n / 2));
  const paths: string[] = [];
  let star = "";
  for (let i = 0; i <= n; i++) {
    const p = pts[(i * skip) % n];
    star += `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  paths.push(star + "Z");

  // A second, inner polygon for depth.
  if (rnd() > 0.4) {
    const ir = radius * (0.45 + rnd() * 0.2);
    const irot = rot + rnd() * 1.2;
    let inner = "";
    const m = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i <= m; i++) {
      const a = irot + (i / m) * Math.PI * 2;
      const x = c + Math.cos(a) * ir;
      const y = c + Math.sin(a) * ir;
      inner += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    paths.push(inner + "Z");
  }

  const rings = [radius + 6 + rnd() * 4];
  if (rnd() > 0.5) rings.push(radius * (0.3 + rnd() * 0.15));

  const dots: Pt[] = pts.map((p) => ({ x: p.x, y: p.y, r: 1.1 + rnd() * 0.9 }));
  dots.push({ x: c, y: c, r: 1.6 + rnd() * 1.2 });

  return { paths, dots, rings, points: pts };
}
