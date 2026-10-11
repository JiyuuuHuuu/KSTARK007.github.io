// Prism's write path, step by step: a key enters the BUL, is promoted into the
// memtable on its second write, then updated in place; cold keys flush to SSTables.
import { useId } from 'react';
import { StepperControls, useStepper } from '../kit/stepper';
import { PRISM_WRITE_STEPS } from '@/content/posts/one-memory-many-machines/data';

const STEPS = PRISM_WRITE_STEPS;
const ACCENT = 'var(--color-accent)';
const BUL = 'var(--color-s4)';
const COLD = 'var(--color-s5)';
const PAPER = 'var(--color-paper-raised)';
const noop = () => undefined;

function KeyBox({ x, y, label, color, width = 86 }: { x: number; y: number; label: string; color: string; width?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={26} rx={4} fill={PAPER} stroke={color} />
      <text x={x + width / 2} y={y + 17.5} textAnchor="middle" className="fill-ink font-mono" fontSize={13} fontWeight={600}>
        {label}
      </text>
    </g>
  );
}

function Tiers({ step, markerId }: { step: number; markerId: string }) {
  const cur = STEPS[step];
  const memtableState = ['miss', 'promoted', 'hit', 'hot key'][step];
  return (
    <svg viewBox="0 0 360 366" className="mx-auto block h-auto w-full max-w-[440px]" role="img" aria-label={cur.caption}>
      <title>{cur.caption}</title>
      <defs>
        {(
          [
            ['coherent', ACCENT],
            ['bul', BUL],
            ['cold', COLD],
          ] as const
        ).map(([name, color]) => (
          <marker
            key={name}
            id={`${markerId}-${name}`}
            viewBox="0 0 8 8"
            refX={7}
            refY={4}
            markerWidth={6}
            markerHeight={6}
            orient="auto"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill={color} />
          </marker>
        ))}
      </defs>
      <rect x={4} y={4} width={352} height={114} rx={5} fill="var(--color-accent-soft)" stroke={ACCENT} />
      <text x={16} y={23} className="fill-accent-deep font-mono" fontSize={12} fontWeight={600}>
        SCR · hardware coherence
      </text>
      <rect x={44} y={34} width={172} height={72} rx={4} fill={PAPER} stroke={ACCENT} strokeWidth={step === 2 ? 2.5 : 1} />
      <text x={130} y={53} textAnchor="middle" className="fill-ink font-mono" fontSize={12} fontWeight={600}>
        Memtable · {memtableState}
      </text>
      {step === 0 ? (
        <text x={130} y={85} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={13}>
          empty
        </text>
      ) : (
        <KeyBox x={87} y={69} label={step === 1 ? 'A = 2' : 'A = 3'} color={ACCENT} />
      )}
      <rect x={230} y={34} width={114} height={72} rx={4} fill={PAPER} stroke={ACCENT} />
      <text x={287} y={53} textAnchor="middle" className="fill-ink font-mono" fontSize={11.5} fontWeight={600}>
        BUL versions
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={247 + 17 * i} y={65} width={12} height={10} rx={2} fill={ACCENT} opacity={0.65} />
      ))}
      <text x={287} y={94} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={11}>
        fit in SCR
      </text>
      <line x1={4} y1={128} x2={356} y2={128} stroke="var(--color-rule-strong)" strokeDasharray="5 4" />
      <text x={350} y={146} textAnchor="end" className="fill-ink-muted font-mono" fontSize={11}>
        LNR below
      </text>
      {step === 0 ? (
        <g>
          <path d="M 130 108 V 172" fill="none" stroke={BUL} strokeWidth={2} markerEnd={`url(#${markerId}-bul)`} />
          <text x={141} y={165} className="fill-ink font-mono" fontSize={12}>
            miss → insert A
          </text>
        </g>
      ) : step === 1 ? (
        <g>
          <path d="M 79 175 V 108" fill="none" stroke={ACCENT} strokeWidth={2} markerEnd={`url(#${markerId}-coherent)`} />
          <text x={91} y={164} className="fill-accent-deep font-mono" fontSize={12}>
            BUL hit → promote A
          </text>
        </g>
      ) : step === 2 ? (
        <g>
          <path d="M 87 82 H 57 V 65 H 76" fill="none" stroke={ACCENT} strokeWidth={2} markerEnd={`url(#${markerId}-coherent)`} />
          <text x={130} y={162} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={12}>
            hit → update A in place
          </text>
        </g>
      ) : null}
      <path d="M 57 178 H 303 L 330 257 H 30 Z" fill={BUL} fillOpacity={0.12} stroke={BUL} strokeWidth={step === 0 ? 2 : 1} />
      <text x={180} y={197} textAnchor="middle" className="fill-ink font-mono" fontSize={13} fontWeight={600}>
        BUL · data in LNR
      </text>
      <text x={180} y={213} textAnchor="middle" className="fill-ink-muted" fontSize={12}>
        fine-grained software coherence
      </text>
      {step === 0 ? <KeyBox x={77} y={223} label="A = 1" color={BUL} /> : null}
      {step < 3 ? (
        <KeyBox x={step === 0 ? 197 : 137} y={223} label="B = 1" color={BUL} />
      ) : (
        <text x={180} y={241} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={13}>
          empty
        </text>
      )}
      {step === 3 ? (
        <g>
          <path d="M 180 259 V 286" fill="none" stroke={COLD} strokeWidth={2.25} markerEnd={`url(#${markerId}-cold)`} />
          <text x={193} y={279} className="fill-ink font-mono" fontSize={12}>
            flush B
          </text>
        </g>
      ) : null}
      <rect x={4} y={290} width={352} height={71} rx={4} fill={COLD} fillOpacity={0.1} stroke={COLD} />
      <text x={180} y={309} textAnchor="middle" className="fill-ink font-mono" fontSize={12.5} fontWeight={600}>
        Immutable SSTables · LNR
      </text>
      <text x={17} y={341} className="fill-ink-muted font-mono" fontSize={12}>
        L0
      </text>
      {[54, 151, 248].map((x, i) => (
        <g key={x}>
          <rect
            x={x}
            y={321}
            width={86}
            height={28}
            rx={3}
            fill={PAPER}
            stroke={COLD}
            strokeDasharray={step < 3 && i === 1 ? '3 3' : undefined}
          />
          {step === 3 && i === 1 ? (
            <text x={x + 43} y={340} textAnchor="middle" className="fill-ink font-mono" fontSize={13} fontWeight={600}>
              B = 1
            </text>
          ) : (
            <text x={x + 43} y={340} textAnchor="middle" className="fill-ink-faint font-mono" fontSize={12}>
              {i === 1 ? 'empty' : '…'}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function PrismWrites() {
  const markerId = `prism-write-${useId().replace(/:/g, '')}`;
  const { ref, step, running, go, togglePlay, playState } = useStepper({
    count: STEPS.length,
    holdMs: 5000,
    loop: false,
    autoplay: false,
    onFirstUse: noop,
  });
  const cur = STEPS[step];
  return (
    <div ref={ref}>
      <p className="mb-3 font-mono text-[12px] font-medium text-ink">{cur.operation}</p>
      <Tiers step={step} markerId={markerId} />
      <div className="mt-3 min-h-[7.5rem] border-l-2 border-accent pl-3">
        <p className="font-mono text-[10.5px] tracking-[0.06em] text-accent uppercase">
          Step {step + 1} / {STEPS.length} · {cur.caption}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-ink-muted" aria-live={running ? 'off' : 'polite'}>
          {cur.detail}
        </p>
      </div>
      <StepperControls
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
        rangeLabel="Scrub through Prism's write path"
      />
    </div>
  );
}
