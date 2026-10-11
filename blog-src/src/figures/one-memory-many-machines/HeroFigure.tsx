// The masthead drawing: four hosts whose beams converge on one shared CXL memory device.
import { useRef } from 'react';
import { useInView } from '../kit/motion';

const BEAMS = ['M 100 62 L 170 128', 'M 330 62 L 260 128', 'M 100 258 L 170 192', 'M 330 258 L 260 192'];

const HOSTS = [
  { x: 30, y: 30, label: 'Host 1' },
  { x: 330, y: 30, label: 'Host 2' },
  { x: 30, y: 250, label: 'Host 3' },
  { x: 330, y: 250, label: 'Host 4' },
];

const PULSE_CSS = `
          /* A short travelling segment, not a dashed line: the beam itself
             stays solid, so the diagram reads correctly in a screenshot and
             when animation is switched off. Only the highlight moves. */
          .hero-pulse {
            stroke-dasharray: 14 190;
            animation: hero-flow 3.2s linear infinite;
          }
          @keyframes hero-flow {
            from { stroke-dashoffset: 204; }
            to   { stroke-dashoffset: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-pulse { display: none; }
          }
        `;

export default function HeroFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 430 320"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="Four host machines connected to one shared CXL memory device"
      >
        <title>Four hosts, one shared CXL memory</title>
        <style>{PULSE_CSS}</style>
        {BEAMS.map((d, i) => (
          <g key={d}>
            <path
              d={d}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={shown ? 0.7 : 0}
              style={{ transition: `opacity 500ms ${140 + 70 * i}ms ease-out` }}
            />
            <path
              className="hero-pulse"
              d={d}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={shown ? 1 : 0}
              style={{ transition: `opacity 500ms ${200 + 70 * i}ms ease-out`, animationDelay: `${0.5 * i}s` }}
            />
          </g>
        ))}
        {HOSTS.map((h, i) => (
          <g key={h.label} opacity={shown ? 1 : 0} style={{ transition: `opacity 420ms ${60 * i}ms ease-out` }}>
            <rect x={h.x} y={h.y} width={70} height={40} rx={4} fill="var(--color-paper-raised)" stroke="var(--color-ink)" strokeWidth={1.25} />
            <rect
              x={h.x + 8}
              y={h.y + 8}
              width={22}
              height={6}
              rx={1.5}
              fill="var(--color-accent-soft)"
              stroke="var(--color-accent)"
              strokeWidth={0.75}
            />
            <text x={h.x + 35} y={h.y + 30} textAnchor="middle" className="fill-ink font-mono" fontSize={10.5} fontWeight={600}>
              {h.label}
            </text>
          </g>
        ))}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 560ms 300ms ease-out' }}>
          <rect x={155} y={125} width={120} height={70} rx={5} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.5} />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={166 + 26 * i}
              y={136}
              width={18}
              height={26}
              rx={2}
              fill="var(--color-paper-raised)"
              stroke="var(--color-accent)"
              strokeWidth={0.75}
            />
          ))}
          <text x={215} y={181} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={10.5} fontWeight={600}>
            CXL MEMORY · TBs
          </text>
        </g>
        <text
          x={215}
          y={312}
          textAnchor="middle"
          className="fill-ink-faint font-mono"
          fontSize={9.5}
          opacity={shown ? 1 : 0}
          style={{ transition: 'opacity 420ms 520ms ease-out' }}
        >
          one device · four address spaces · zero copies
        </text>
      </svg>
    </div>
  );
}
