// Problem 2, step by step: one write to one key of a large node bumps the
// node's single version number and flushes every other key from host 2's cache.
import { useRef } from 'react';
import { StepperControls, useStepper } from '../kit/stepper';
import { track } from '@/lib/analytics';
import { FALSE_INVALIDATION_STEPS } from '@/content/posts/one-memory-many-machines/data';

const STEPS = FALSE_INVALIDATION_STEPS;
const ACCENT = 'var(--color-accent)';
const AMBER = 'var(--color-s5)';
const RUST = 'var(--color-s6)';
const RULE_STRONG = 'var(--color-rule-strong)';
const HOST_X = [26, 354];
const NODE = { x: 134, y: 128, w: 370, h: 80 };
const KEYS = ['181', '194', '298', '420', '498', '501', '645'];
const CELL = { w: 40, h: 24, x0: NODE.x + 16, y: 162 };

function Arrow({ d, color, marker, dashed }: { d: string; color: string; marker: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeDasharray={dashed ? '4 3' : undefined}
      markerEnd={`url(#fi-arrow-${marker})`}
    />
  );
}

export default function FalseInvalidation() {
  const used = useRef(false);
  const { ref, step, running, go, togglePlay, playState } = useStepper({
    count: STEPS.length,
    holdMs: 2800,
    loop: true,
    autoplay: true,
    onFirstUse: () => {
      if (!used.current) {
        used.current = true;
        track('false_invalidation_scrubbed');
      }
    },
  });
  const cur = STEPS[step];
  const host2Cache =
    step <= 1
      ? { text: 'node · v7', color: 'var(--color-ink)', struck: false }
      : { text: 'node · v7', color: RUST, struck: true };
  const hostStroke = [
    step === 1 ? AMBER : RULE_STRONG,
    step === 0 || step >= 2 ? (step >= 2 ? RUST : ACCENT) : RULE_STRONG,
  ];

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 520 228"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`Problem 2, step ${step + 1} of ${STEPS.length}: ${cur.caption}`}
      >
        <title>{cur.caption}</title>
        <defs>
          {(
            [
              ['accent', ACCENT],
              ['amber', AMBER],
              ['rust', RUST],
            ] as const
          ).map(([name, color]) => (
            <marker
              key={name}
              id={`fi-arrow-${name}`}
              viewBox="0 0 8 8"
              refX={7}
              refY={4}
              markerWidth={6}
              markerHeight={6}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" fill={color} />
            </marker>
          ))}
        </defs>
        {HOST_X.map((x, i) => (
          <g key={i}>
            <rect
              x={x}
              y={16}
              width={140}
              height={78}
              rx={5}
              fill="var(--color-paper-raised)"
              stroke={hostStroke[i]}
              strokeWidth={hostStroke[i] === RULE_STRONG ? 1.25 : 2}
              style={{ transition: 'stroke 300ms' }}
            />
            <text x={x + 70} y={37} textAnchor="middle" className="fill-ink font-mono" fontSize={11} fontWeight={700}>
              Host {i + 1}
            </text>
            <rect x={x + 16} y={48} width={108} height={34} rx={3} fill="var(--color-paper-sunk)" stroke="var(--color-rule)" />
            <text x={x + 25} y={69} className="fill-ink-faint font-mono" fontSize={8.5}>
              cache
            </text>
            {i === 1 ? (
              <g>
                <text
                  x={x + 86}
                  y={70}
                  textAnchor="middle"
                  className="font-mono"
                  fill={host2Cache.color}
                  fontSize={12}
                  fontWeight={700}
                >
                  {host2Cache.text}
                </text>
                {host2Cache.struck ? <line x1={x + 58} y1={66} x2={x + 114} y2={66} stroke={RUST} strokeWidth={1.75} /> : null}
              </g>
            ) : step >= 1 ? (
              <text x={x + 86} y={70} textAnchor="middle" className="fill-ink font-mono" fontSize={12} fontWeight={700}>
                194 ✓
              </text>
            ) : null}
          </g>
        ))}
        {step === 0 ? (
          <g>
            <Arrow d="M 318 126 L 424 97" color={ACCENT} marker="accent" dashed />
            <text x={312} y={118} textAnchor="end" className="fill-accent-deep font-mono" fontSize={9.5} fontWeight={600}>
              read key 298 earlier: node cached at v7
            </text>
          </g>
        ) : null}
        {step === 1 ? (
          <g>
            <Arrow d="M 96 97 L 96 112 L 190 112 L 190 126" color={AMBER} marker="amber" />
            <text x={104} y={109} className="font-mono" fill={AMBER} fontSize={9.5} fontWeight={600}>
              write key 194
            </text>
            <Arrow d="M 60 97 L 60 126" color={AMBER} marker="amber" dashed />
            <text x={236} y={109} className="font-mono" fill={AMBER} fontSize={9.5} fontWeight={600}>
              node version 7 → 8
            </text>
          </g>
        ) : null}
        {step === 2 ? (
          <g>
            <Arrow d="M 424 97 L 424 117 L 75 117 L 75 126" color={RUST} marker="rust" dashed />
            <text x={84} y={108} className="font-mono" fill={RUST} fontSize={9.5} fontWeight={600}>
              check: cache says 7, SCR says 8
            </text>
            <Arrow d="M 300 126 L 400 97" color={RUST} marker="rust" />
          </g>
        ) : null}
        {step === 3 ? (
          <g>
            <text x={236} y={109} className="font-mono" fill={RUST} fontSize={9.5} fontWeight={700}>
              127 unmodified keys flushed for one write
            </text>
          </g>
        ) : null}
        <clipPath id="fi-mem-clip">
          <rect x={16} y={128} width={488} height={80} rx={5} />
        </clipPath>
        <g clipPath="url(#fi-mem-clip)">
          <rect x={16} y={128} width={118} height={80} fill="var(--color-accent-soft)" />
          <rect x={NODE.x} y={NODE.y} width={NODE.w} height={NODE.h} fill={AMBER} opacity={0.16} />
        </g>
        <line x1={NODE.x} y1={128} x2={NODE.x} y2={208} stroke={RULE_STRONG} strokeWidth={1} />
        <rect x={16} y={128} width={488} height={80} rx={5} fill="none" stroke="var(--color-ink)" strokeWidth={1.25} />
        <text x={25} y={145} className="fill-accent-deep font-mono" fontSize={8} fontWeight={700}>
          SCR · coherent
        </text>
        <text x={75} y={172} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={8.5}>
          node version
        </text>
        <text
          x={75}
          y={194}
          textAnchor="middle"
          className="font-mono"
          fill={step === 1 ? AMBER : step >= 2 ? RUST : 'var(--color-ink)'}
          fontSize={16}
          fontWeight={700}
          style={{ transition: 'fill 300ms' }}
        >
          {step >= 1 ? 8 : 7}
        </text>
        <text x={NODE.x + 14} y={NODE.y + 17} className="fill-ink-faint font-mono" fontSize={8.5}>
          LNR · one B-tree node, 128 keys, one version number for all of them
        </text>
        {KEYS.map((key, i) => {
          const written = key === '194' && step >= 1;
          const flushed = step >= 2 && key !== '194';
          const read = key === '298' && step === 2;
          const stroke = written ? AMBER : flushed ? RUST : RULE_STRONG;
          return (
            <g key={key}>
              <rect
                x={CELL.x0 + i * CELL.w}
                y={CELL.y}
                width={CELL.w - 3}
                height={CELL.h}
                rx={2.5}
                fill={written ? AMBER : 'var(--color-paper-raised)'}
                fillOpacity={written ? 0.25 : 1}
                stroke={stroke}
                strokeWidth={written || flushed || read ? 1.75 : 1}
                strokeDasharray={flushed ? '3 2' : undefined}
                style={{ transition: 'stroke 300ms, fill 300ms' }}
              />
              <text
                x={CELL.x0 + i * CELL.w + (CELL.w - 3) / 2}
                y={CELL.y + 16}
                textAnchor="middle"
                className="font-mono"
                fill={written ? AMBER : read ? ACCENT : flushed ? RUST : 'var(--color-ink)'}
                fontSize={10}
                fontWeight={written || read ? 700 : 500}
              >
                {key}
              </text>
            </g>
          );
        })}
        <text x={CELL.x0 + KEYS.length * CELL.w + 4} y={CELL.y + 16} className="fill-ink-faint font-mono" fontSize={9}>
          … 128
        </text>
        <text
          x={NODE.x + 14}
          y={NODE.y + 72}
          className="font-mono"
          fill={step >= 2 ? RUST : 'var(--color-ink-faint)'}
          fontSize={8.5}
          fontWeight={step >= 2 ? 700 : 400}
          style={{ transition: 'fill 300ms' }}
        >
          {step >= 3
            ? 'false invalidation: 127 keys flushed, 1 changed'
            : step === 2
              ? 'version mismatch: flush and re-read the whole node'
              : step === 1
                ? 'only key 194 changed'
                : 'host 2 holds a copy of all 128 keys'}
        </text>
      </svg>
      <div className="mt-3 min-h-[3.2rem] border-l-2 border-accent pl-4" style={{ display: 'grid' }}>
        <div style={{ gridArea: '1 / 1' }}>
          <p className="font-mono text-[10.5px] tracking-[0.12em] text-accent uppercase">
            {step + 1} / {STEPS.length} · {cur.caption}
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted" aria-live={running ? 'off' : 'polite'}>
            {cur.detail}
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
        valueText={`Step ${step + 1} of ${STEPS.length}: ${cur.caption}`}
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
