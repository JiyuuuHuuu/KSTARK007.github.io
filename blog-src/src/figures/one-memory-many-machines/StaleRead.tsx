// The stale read, stepped: host 1 caches A, host 2 writes A′ to the LNR with no invalidation, and host 1 keeps serving the old A.
import { useRef } from 'react';
import { StepperControls, useStepper } from '../kit/stepper';
import { STALE_READ_STEPS } from '@/content/posts/one-memory-many-machines/data';
import { track } from '@/lib/analytics';

const STEPS = STALE_READ_STEPS;

const ARROWS = [
  { id: 'stale-arrow-accent', fill: 'var(--color-accent)' },
  { id: 'stale-arrow-amber', fill: 'var(--color-s5)' },
  { id: 'stale-arrow-rust', fill: 'var(--color-s6)' },
];

export default function StaleRead() {
  const used = useRef(false);
  const { ref, step, running, go, togglePlay, playState } = useStepper({
    count: STEPS.length,
    holdMs: 2600,
    loop: true,
    autoplay: true,
    onFirstUse: () => {
      if (used.current) return;
      used.current = true;
      track('stale_read_scrubbed');
    },
  });
  const cur = STEPS[step];
  const stale = step >= 2;

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 520 208"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`Stale read, phase ${step + 1} of 4: ${cur.caption}`}
      >
        <title>{cur.caption}</title>
        <defs>
          {ARROWS.map((a) => (
            <marker key={a.id} id={a.id} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 0 8 z" fill={a.fill} />
            </marker>
          ))}
        </defs>
        {[0, 1].map((host) => {
          const x = host === 0 ? 26 : 354;
          const active = (step === 0 && host === 0) || (step === 1 && host === 1) || (step >= 2 && host === 0);
          const warn = host === 0 && stale;
          return (
            <g key={host}>
              <rect
                x={x}
                y={16}
                width={140}
                height={78}
                rx={5}
                fill="var(--color-paper-raised)"
                stroke={warn ? 'var(--color-s6)' : active ? 'var(--color-accent)' : 'var(--color-rule-strong)'}
                strokeWidth={active || warn ? 2 : 1.25}
                style={{ transition: 'stroke 300ms' }}
              />
              <text x={x + 70} y={37} textAnchor="middle" className="fill-ink font-mono" fontSize={11} fontWeight={700}>
                Host {host + 1}
              </text>
              <rect x={x + 16} y={48} width={108} height={34} rx={3} fill="var(--color-paper-sunk)" stroke="var(--color-rule)" />
              <text x={x + 25} y={69} className="fill-ink-faint font-mono" fontSize={8.5}>
                cache
              </text>
              {/* Host 1 holds A in its cache from the first step on. */}
              {host === 0 ? (
                <text
                  x={x + 90}
                  y={70}
                  textAnchor="middle"
                  className="font-mono"
                  fill={stale ? 'var(--color-s6)' : 'var(--color-ink)'}
                  fontSize={13}
                  fontWeight={700}
                >
                  A{stale ? ' ⚠' : ''}
                </text>
              ) : null}
              {host === 1 && step >= 1 ? (
                <text x={x + 90} y={70} textAnchor="middle" className="fill-ink font-mono" fontSize={13} fontWeight={700}>
                  A′
                </text>
              ) : null}
            </g>
          );
        })}
        {step === 0 ? (
          <g>
            <path d="M 250 138 L 116 98" fill="none" stroke="var(--color-accent)" strokeWidth={1.75} markerEnd="url(#stale-arrow-accent)" />
            <text x={150} y={126} className="fill-accent-deep font-mono" fontSize={9.5} fontWeight={600}>
              read A
            </text>
          </g>
        ) : null}
        {step === 1 ? (
          <g>
            <path d="M 404 98 L 274 138" fill="none" stroke="var(--color-s5)" strokeWidth={1.75} markerEnd="url(#stale-arrow-amber)" />
            <text x={412} y={112} className="font-mono" fill="var(--color-s5)" fontSize={9.5} fontWeight={600}>
              write A′
            </text>
            <text x={150} y={126} className="fill-ink-faint font-mono" fontSize={9.5}>
              no invalidation sent
            </text>
          </g>
        ) : null}
        {step >= 2 ? (
          <g>
            <path
              d="M 60 98 C 40 116, 40 132, 66 132 C 86 132, 92 116, 92 100"
              fill="none"
              stroke="var(--color-s6)"
              strokeWidth={1.75}
              markerEnd="url(#stale-arrow-rust)"
            />
            <text x={104} y={130} className="font-mono" fill="var(--color-s6)" fontSize={9.5} fontWeight={700}>
              answered from cache · never reaches CXL
            </text>
          </g>
        ) : null}
        <rect x={106} y={140} width={308} height={46} rx={4} fill="var(--color-s5)" opacity={0.16} stroke="var(--color-s5)" />
        <text x={122} y={158} className="fill-ink-faint font-mono" fontSize={8.5}>
          LNR · no coherence
        </text>
        <text x={260} y={175} textAnchor="middle" className="fill-ink font-mono" fontSize={14} fontWeight={700}>
          {step >= 1 ? 'A′' : 'A'}
        </text>
      </svg>
      {/* Every step's text is stacked invisibly in the same grid cell so the box never changes height. */}
      <div className="mt-3 min-h-[3.2rem] border-l-2 border-accent pl-4" style={{ display: 'grid' }}>
        <div style={{ gridArea: '1 / 1' }}>
          <p className="font-mono text-[10.5px] tracking-[0.12em] text-accent uppercase">
            {step + 1}
            {' / '}
            {STEPS.length}
            {' · '}
            {cur.caption}
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted" aria-live={running ? 'off' : 'polite'}>
            {cur.detail}
          </p>
        </div>
        {STEPS.map((s, i) => (
          <div key={i} aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden' }}>
            <p className="font-mono text-[10.5px] tracking-[0.12em] text-accent uppercase">
              {i + 1}
              {' / '}
              {STEPS.length}
              {' · '}
              {s.caption}
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
