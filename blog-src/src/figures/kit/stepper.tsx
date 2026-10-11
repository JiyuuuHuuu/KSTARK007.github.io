// Step-through animations: ◀ / Play / ▶ controls with a scrubber, and the
// hook that autoplays while the figure is on screen (never under reduced motion).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView, useReducedMotion } from './motion';

const stepButton =
  'rounded-sm border border-rule-strong px-3 py-1.5 font-mono text-[12px] text-ink transition-colors hover:border-ink disabled:opacity-35';

export type PlayState = 'playing' | 'paused' | 'ended';

export function StepperControls({
  value,
  min = 0,
  max,
  step = 1,
  valueText,
  onChange,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  play,
  onPlay,
  prevLabel = 'Previous step',
  nextLabel = 'Next step',
  rangeLabel,
  startLabel,
  endLabel,
  className = 'mt-4',
}: {
  value: number;
  min?: number;
  max: number;
  step?: number;
  valueText?: string;
  onChange: (v: number) => void;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  play: PlayState;
  onPlay: () => void;
  prevLabel?: string;
  nextLabel?: string;
  rangeLabel: string;
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  className?: string;
}) {
  const range = (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={rangeLabel}
      aria-valuetext={valueText}
      className="h-1 min-w-32 flex-1 cursor-pointer appearance-none rounded-full bg-rule accent-(--color-accent)"
    />
  );
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onPrev} disabled={prevDisabled} aria-label={prevLabel} className={stepButton}>
          <span aria-hidden="true">◀</span>
        </button>
        <button
          type="button"
          onClick={onPlay}
          aria-label={play === 'playing' ? 'Pause' : play === 'ended' ? 'Restart' : 'Play'}
          className="rounded-sm bg-ink px-4 py-1.5 font-mono text-[12px] text-paper-raised transition-colors hover:bg-accent"
        >
          <span aria-hidden="true">{play === 'playing' ? '❚❚' : play === 'ended' ? '↺' : '▶'}</span>
        </button>
        <button type="button" onClick={onNext} disabled={nextDisabled} aria-label={nextLabel} className={stepButton}>
          <span aria-hidden="true">▶</span>
        </button>
      </div>
      {startLabel || endLabel ? (
        <label className="flex flex-1 items-center gap-4" style={{ minWidth: '18rem' }}>
          {startLabel ? <span className="shrink-0 font-mono text-[10.5px] tracking-wide text-ink-muted">{startLabel}</span> : null}{' '}
          {range}{' '}
          {endLabel ? <span className="shrink-0 font-mono text-[10.5px] tracking-wide text-ink-muted">{endLabel}</span> : null}
        </label>
      ) : (
        range
      )}
    </div>
  );
}

/**
 * State for a stepped animation of `count` steps that advances every `holdMs`
 * while at least 30% of it is visible. `onFirstUse` fires on any manual control
 * (used for analytics).
 */
export function useStepper({
  count,
  holdMs,
  loop,
  autoplay,
  onFirstUse,
}: {
  count: number;
  holdMs: number;
  loop: boolean;
  autoplay: boolean;
  onFirstUse: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [wantPlay, setWantPlay] = useState(autoplay);
  const atEnd = !loop && step >= count - 1;
  const running = wantPlay && visible && !reduced && !atEnd;
  const advance = (s: number) => (loop ? (s + 1) % count : Math.min(count - 1, s + 1));

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep(advance), holdMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step, loop, count, holdMs]);

  const playState: PlayState = running ? 'playing' : atEnd ? 'ended' : 'paused';
  return {
    ref,
    step,
    running,
    atEnd,
    playState,
    go: (s: number) => {
      setStep(Math.max(0, Math.min(count - 1, s)));
      setWantPlay(false);
      onFirstUse();
    },
    togglePlay: () => {
      onFirstUse();
      if (atEnd) {
        setStep(0);
        setWantPlay(true);
        return;
      }
      if (running) {
        setWantPlay(false);
        return;
      }
      if (reduced) {
        setStep(advance);
        setWantPlay(false);
        return;
      }
      setWantPlay(true);
    },
  };
}
