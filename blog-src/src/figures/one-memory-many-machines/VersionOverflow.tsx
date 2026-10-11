// SC-ART version numbers outgrowing an 8-slot SCR and spilling into the LNR, where they can no longer be trusted.
import { useRef } from 'react';
import { StepperControls, useStepper } from '../kit/stepper';
import { VERSION_OVERFLOW_STEPS } from '@/content/posts/one-memory-many-machines/data';
import { track } from '@/lib/analytics';

const STEPS = VERSION_OVERFLOW_STEPS;
const ACCENT = 'var(--color-accent)';
const AMBER = 'var(--color-s5)';
const RUST = 'var(--color-s6)';
const SLOTS = 8;
const INNER = [48, 116, 184, 252].map((x) => ({ x, y: 76 }));
const LEAVES = [30, 64, 98, 132, 166, 200, 234, 268].map((x) => ({ x, y: 130 }));

/** A tree node with its version-number badge in the top-right corner. */
function Node({ x, y, shown, badge }: { x: number; y: number; shown: boolean; badge: string }) {
  return (
    <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 320ms ease-out' }}>
      <rect x={x} y={y} width={26} height={16} rx={3} fill="var(--color-paper-raised)" stroke="var(--color-ink)" strokeWidth={1} />
      <rect x={x + 26 - 7} y={y - 4} width={9} height={9} rx={1.5} fill={badge} stroke="var(--color-paper-raised)" strokeWidth={1} />
      <text x={x + 26 - 2.5} y={y + 3} textAnchor="middle" className="font-mono" fill="var(--color-paper-raised)" fontSize={6.5} fontWeight={700}>
        V
      </text>
    </g>
  );
}

export default function VersionOverflow() {
  const used = useRef(false);
  const { ref, step, running, go, togglePlay, playState } = useStepper({
    count: STEPS.length,
    holdMs: 2800,
    loop: true,
    autoplay: true,
    onFirstUse: () => {
      if (!used.current) {
        used.current = true;
        track('version_overflow_scrubbed');
      }
    },
  });
  const current = STEPS[step];
  const grown = step >= 1;
  const nodes = grown ? 1 + INNER.length + LEAVES.length : 1 + INNER.length;
  const spilled = Math.max(0, nodes - SLOTS);
  const stale = step >= 2;
  const spillFill = stale ? RUST : AMBER;
  const spillBadge = stale ? RUST : AMBER;

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 520 208"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`Problem 1, step ${step + 1} of ${STEPS.length}: ${current.caption}`}
      >
        <title>{current.caption}</title>
        <g stroke="var(--color-rule-strong)" strokeWidth={1}>
          {INNER.map((n, i) => (
            <line key={`ri${i}`} x1={163} y1={38} x2={n.x + 13} y2={n.y} />
          ))}
          {LEAVES.map((n, i) => {
            const parent = INNER[Math.floor(i / 2)];
            return (
              <line
                key={`il${i}`}
                x1={parent.x + 13}
                y1={parent.y + 16}
                x2={n.x + 13}
                y2={n.y}
                opacity={grown ? 1 : 0}
                style={{ transition: 'opacity 320ms ease-out' }}
              />
            );
          })}
        </g>
        <Node x={150} y={22} shown badge={ACCENT} />
        {INNER.map((n, i) => (
          <Node key={`in${i}`} x={n.x} y={n.y} shown badge={ACCENT} />
        ))}
        {LEAVES.map((n, i) => (
          <Node key={`lf${i}`} x={n.x} y={n.y} shown={grown} badge={i < SLOTS - 1 - INNER.length ? ACCENT : spillBadge} />
        ))}
        <text x={163} y={178} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={9}>
          SC-ART · {nodes} nodes · {nodes} version numbers
        </text>
        <text x={163} y={194} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={8.5}>
          tree nodes and data in the LNR
        </text>
        <rect x={322} y={16} width={182} height={84} rx={5} fill="var(--color-accent-soft)" stroke={ACCENT} strokeWidth={1.25} />
        <text x={331} y={31} className="fill-accent-deep font-mono" fontSize={8} fontWeight={700}>
          SCR · hardware coherent · {SLOTS} slots
        </text>
        {Array.from({ length: SLOTS }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const filled = i < Math.min(nodes, SLOTS);
          return (
            <g key={i}>
              <rect
                x={336 + 40 * col}
                y={42 + 24 * row}
                width={32}
                height={18}
                rx={2.5}
                fill={filled ? ACCENT : 'none'}
                stroke={ACCENT}
                strokeDasharray={filled ? undefined : '3 2'}
                opacity={filled ? 0.9 : 0.5}
                style={{ transition: 'fill 300ms, opacity 300ms' }}
              />
              {filled ? (
                <text
                  x={352 + 40 * col}
                  y={55 + 24 * row}
                  textAnchor="middle"
                  className="font-mono"
                  fill="var(--color-paper-raised)"
                  fontSize={8}
                  fontWeight={700}
                >
                  V
                </text>
              ) : null}
            </g>
          );
        })}
        <text x={331} y={94} className="fill-ink-faint font-mono" fontSize={8}>
          {Math.min(nodes, SLOTS)} of {SLOTS} slots used
        </text>
        <rect
          x={322}
          y={112}
          width={182}
          height={84}
          rx={5}
          fill={AMBER}
          opacity={0.14}
          stroke={stale && spilled ? RUST : AMBER}
          strokeWidth={stale && spilled ? 1.75 : 1}
          style={{ transition: 'stroke 300ms' }}
        />
        <text x={331} y={127} className="fill-ink-faint font-mono" fontSize={8}>
          LNR · no coherence across hosts
        </text>
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} opacity={i < spilled ? 1 : 0} style={{ transition: 'opacity 320ms ease-out' }}>
            <rect x={336 + 34 * i} y={138} width={28} height={18} rx={2.5} fill={spillFill} opacity={0.9} style={{ transition: 'fill 300ms' }} />
            <text x={350 + 34 * i} y={151} textAnchor="middle" className="font-mono" fill="var(--color-paper-raised)" fontSize={8} fontWeight={700}>
              {stale ? 'V?' : 'V'}
            </text>
          </g>
        ))}
        <text
          x={331}
          y={176}
          className="font-mono"
          fill={stale ? RUST : 'var(--color-ink-muted)'}
          fontSize={8.5}
          fontWeight={stale ? 700 : 400}
          style={{ transition: 'fill 300ms' }}
        >
          {step === 0 ? 'nothing spilled' : step === 1 ? `${spilled} version numbers spilled` : 'spilled: flush on every access'}
        </text>
        {stale ? (
          <text x={331} y={189} className="font-mono" fill={RUST} fontSize={8}>
            fresh or stale? a host cannot tell
          </text>
        ) : null}
      </svg>
      <div className="mt-3 min-h-[3.2rem] border-l-2 border-accent pl-4" style={{ display: 'grid' }}>
        <div style={{ gridArea: '1 / 1' }}>
          <p className="font-mono text-[10.5px] tracking-[0.12em] text-accent uppercase">
            {step + 1} / {STEPS.length} · {current.caption}
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted" aria-live={running ? 'off' : 'polite'}>
            {current.detail}
          </p>
        </div>
        {STEPS.map((s, i) => (
          <div key={i} aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden' }}>
            <p className="font-mono text-[10.5px] tracking-[0.12em] text-accent uppercase">
              {i + 1} / {STEPS.length} · {s.caption}
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">{s.detail}</p>
          </div>
        ))}
      </div>
      <StepperControls
        className="mt-3"
        value={step}
        max={STEPS.length - 1}
        valueText={`Step ${step + 1} of ${STEPS.length}: ${current.caption}`}
        onChange={go}
        onPrev={() => go(step - 1)}
        onNext={() => go(step + 1)}
        prevDisabled={step === 0}
        nextDisabled={step === STEPS.length - 1}
        play={playState}
        onPlay={togglePlay}
        rangeLabel="Scrub through the steps"
      />
    </div>
  );
}
