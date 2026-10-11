// HCMeta software coherence in four steps: two hosts, a version record in the SCR and the data in the LNR.
import { useRef, type ReactNode } from 'react';
import { StepperControls, useStepper } from '../kit/stepper';
import { HCMETA_STEPS } from '@/content/posts/one-memory-many-machines/data';
import { track } from '@/lib/analytics';

const STEPS = HCMETA_STEPS;
const ACCENT = 'var(--color-accent)';
const AMBER = 'var(--color-s5)';
const RUST = 'var(--color-s6)';
const HOST_X = [26, 354];
const LNR = { x: 162, y: 128, w: 342, h: 80 };

function Arrow({ d, color, marker, dashed }: { d: string; color: string; marker: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeDasharray={dashed ? '4 3' : undefined}
      markerEnd={`url(#hcmeta-arrow-${marker})`}
    />
  );
}

function Label({
  x,
  y,
  color,
  children,
  anchor,
  bold = true,
}: {
  x: number;
  y: number;
  color: string;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="font-mono" fill={color} fontSize={9.5} fontWeight={bold ? 600 : 400}>
      {children}
    </text>
  );
}

export default function HcmetaSteps() {
  const used = useRef(false);
  const { ref, step, running, go, togglePlay, playState } = useStepper({
    count: STEPS.length,
    holdMs: 2600,
    loop: true,
    autoplay: true,
    onFirstUse: () => {
      if (!used.current) {
        used.current = true;
        track('hcmeta_scrubbed');
      }
    },
  });
  const current = STEPS[step];
  const host1Cache =
    step <= 1
      ? { text: 'A: 0', color: 'var(--color-ink)', struck: false }
      : step === 2
        ? { text: 'A: 0', color: RUST, struck: true }
        : { text: 'A′: 1 ✓', color: ACCENT, struck: false };
  const active = [step === 0 || step >= 2, step === 1];
  const hostStroke = [step === 2 ? RUST : active[0] ? ACCENT : 'var(--color-rule-strong)', active[1] ? AMBER : 'var(--color-rule-strong)'];

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 520 228"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`HCMeta, phase ${step + 1} of 4: ${current.caption}`}
      >
        <title>{current.caption}</title>
        <defs>
          {[
            ['accent', ACCENT],
            ['amber', AMBER],
            ['rust', RUST],
          ].map(([name, color]) => (
            <marker
              key={name}
              id={`hcmeta-arrow-${name}`}
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
              strokeWidth={hostStroke[i] === 'var(--color-rule-strong)' ? 1.25 : 2}
              style={{ transition: 'stroke 300ms' }}
            />
            <text x={x + 70} y={37} textAnchor="middle" className="fill-ink font-mono" fontSize={11} fontWeight={700}>
              Host {i + 1}
            </text>
            <rect x={x + 16} y={48} width={108} height={34} rx={3} fill="var(--color-paper-sunk)" stroke="var(--color-rule)" />
            <text x={x + 25} y={69} className="fill-ink-faint font-mono" fontSize={8.5}>
              cache
            </text>
            {i === 0 ? (
              <g>
                <text x={x + 88} y={70} textAnchor="middle" className="font-mono" fill={host1Cache.color} fontSize={13} fontWeight={700}>
                  {host1Cache.text}
                </text>
                {host1Cache.struck ? <line x1={x + 68} y1={66} x2={x + 108} y2={66} stroke={RUST} strokeWidth={1.75} /> : null}
              </g>
            ) : step >= 1 ? (
              <text x={x + 88} y={70} textAnchor="middle" className="fill-ink font-mono" fontSize={13} fontWeight={700}>
                A′: 1
              </text>
            ) : null}
          </g>
        ))}
        {step === 0 ? (
          <g>
            <Arrow d="M 300 126 L 160 97" color={ACCENT} marker="accent" />
            <Label x={236} y={104} color="var(--color-accent-deep)">
              read A
            </Label>
            <Arrow d="M 60 126 L 60 97" color={ACCENT} marker="accent" dashed />
            <Label x={68} y={115} color="var(--color-accent-deep)">
              version 0
            </Label>
          </g>
        ) : null}
        {step === 1 ? (
          <g>
            <Arrow d="M 424 97 L 424 126" color={AMBER} marker="amber" />
            <Label x={432} y={116} color={AMBER}>
              write A′
            </Label>
            <Arrow d="M 372 97 L 372 112 L 100 112 L 100 126" color={AMBER} marker="amber" dashed />
            <Label x={228} y={107} color={AMBER}>
              version → 1
            </Label>
          </g>
        ) : null}
        {step === 2 ? (
          <g>
            <Arrow d="M 60 97 L 60 126" color={RUST} marker="rust" dashed />
            <Label x={68} y={115} color={RUST}>
              check: 0 ≠ 1 → invalidate A
            </Label>
          </g>
        ) : null}
        {step === 3 ? (
          <g>
            <Arrow d="M 300 126 L 160 97" color={ACCENT} marker="accent" />
            <Label x={236} y={104} color="var(--color-accent-deep)">
              re-read A′
            </Label>
          </g>
        ) : null}
        <clipPath id="hcmeta-mem-clip">
          <rect x={16} y={128} width={488} height={80} rx={5} />
        </clipPath>
        <g clipPath="url(#hcmeta-mem-clip)">
          <rect x={16} y={128} width={146} height={80} fill="var(--color-accent-soft)" />
          <rect x={LNR.x} y={LNR.y} width={LNR.w} height={LNR.h} fill={AMBER} opacity={0.16} />
        </g>
        <line x1={LNR.x} y1={128} x2={LNR.x} y2={208} stroke="var(--color-rule-strong)" strokeWidth={1} />
        <rect x={16} y={128} width={488} height={80} rx={5} fill="none" stroke="var(--color-ink)" strokeWidth={1.25} />
        {step === 2 ? <rect x={17.5} y={129.5} width={143} height={77} rx={4} fill="none" stroke={RUST} strokeWidth={1.75} /> : null}
        <text x={25} y={145} className="fill-accent-deep font-mono" fontSize={8} fontWeight={700}>
          SCR · hardware coherent
        </text>
        <rect x={34} y={152} width={110} height={20} rx={3} fill="var(--color-s4)" opacity={0.16} stroke="var(--color-s4)" />
        <text x={89} y={166} textAnchor="middle" className="font-mono" fill="var(--color-s4)" fontSize={9.5} fontWeight={700}>
          INDEX
        </text>
        <text
          x={89}
          y={192}
          textAnchor="middle"
          className="font-mono"
          fill={step === 2 ? RUST : 'var(--color-ink)'}
          fontSize={10}
          fontWeight={700}
        >
          coherence record: {step >= 1 ? 1 : 0}
        </text>
        <text x={LNR.x + 14} y={LNR.y + 17} className="fill-ink-faint font-mono" fontSize={8.5}>
          LNR · no coherence
        </text>
        <text x={LNR.x + LNR.w / 2} y={LNR.y + 46} textAnchor="middle" className="fill-ink font-mono" fontSize={14} fontWeight={700}>
          {step >= 1 ? 'A′' : 'A'}
        </text>
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
