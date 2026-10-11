// Throughput of SC-ART, SC-BTree and Prism as the write ratio rises from 10% to
// 50% (Prism Fig. 7c), with a per-ratio hover tooltip.
import { AxisX, AxisY, Annotation, DrawnPath, Legend, Plot, linePath, makeFrame, scaleLinear, usePlateReveal } from '../kit/plot';
import { Tip, useTip } from '../kit/tip';
import { WRITE_RATIO_SWEEP } from '@/content/posts/one-memory-many-machines/data';

type MarkerKind = 'circle' | 'square' | 'diamond';

const SERIES: { key: 'scArt' | 'scBtree' | 'prism'; label: string; color: string; marker: MarkerKind }[] = [
  { key: 'scArt', label: 'SC-ART', color: 'var(--color-s5)', marker: 'circle' },
  { key: 'scBtree', label: 'SC-BTree', color: 'var(--color-s6)', marker: 'square' },
  { key: 'prism', label: 'Prism', color: 'var(--color-accent)', marker: 'diamond' },
];

function Marker({ kind, x, y, color, r = 3.6 }: { kind: MarkerKind; x: number; y: number; color: string; r?: number }) {
  const outline = { stroke: 'var(--color-paper-raised)', strokeWidth: 1.5 };
  if (kind === 'circle') return <circle cx={x} cy={y} r={r} fill={color} {...outline} />;
  if (kind === 'square') return <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill={color} {...outline} />;
  const k = 1.35 * r;
  return <polygon points={`${x},${y - k} ${x + k},${y} ${x},${y + k} ${x - k},${y}`} fill={color} {...outline} />;
}

export default function WriteRatio() {
  const { ref, shown, width } = usePlateReveal(0.25, 520);
  const [tip, setTip] = useTip();
  const w = Math.max(300, width);
  const frame = makeFrame(w, 272, { right: 24, left: 52 });
  const x = scaleLinear([5, 55], [frame.pad.left, frame.pad.left + frame.innerW]);
  const y = scaleLinear([0, 20], [frame.pad.top + frame.innerH, frame.pad.top]);
  const lines = SERIES.map((s) => ({
    ...s,
    pts: WRITE_RATIO_SWEEP.map((r) => [x.to(r.writeRatio), y.to(r[s.key])] as [number, number]),
  }));
  const first = WRITE_RATIO_SWEEP[0];
  const last = WRITE_RATIO_SWEEP[WRITE_RATIO_SWEEP.length - 1];
  const bandW = frame.innerW / WRITE_RATIO_SWEEP.length;

  return (
    <div ref={ref} className="relative">
      <Plot frame={frame} title="Throughput against write ratio for Prism, SC-BTree and SC-ART">
        {[0, 5, 10, 15, 20].map((t) => (
          <line
            key={t}
            x1={frame.pad.left}
            x2={frame.pad.left + frame.innerW}
            y1={y.to(t)}
            y2={y.to(t)}
            stroke="var(--color-rule)"
            strokeWidth={0.75}
            aria-hidden="true"
          />
        ))}
        <AxisX frame={frame} x={x} ticks={[10, 20, 30, 40, 50]} format={(v) => `${v}%`} label="write ratio" />
        <AxisY frame={frame} y={y} ticks={[0, 5, 10, 15, 20]} format={(v) => String(v)} label="throughput · Mops/s" />
        {lines.map((s, i) => (
          <DrawnPath key={s.key} d={linePath(s.pts)} stroke={s.color} width={2} shown={shown} delay={140 * i} />
        ))}
        {lines.map((s) => (
          <g key={`${s.key}-m`} opacity={shown ? 1 : 0} style={{ transition: 'opacity 400ms 900ms ease-out' }}>
            {s.pts.map(([px, py], i) => (
              <Marker key={i} kind={s.marker} x={px} y={py} color={s.color} />
            ))}
          </g>
        ))}
        <Annotation
          x={x.to(first.writeRatio)}
          y={y.to(first.scBtree)}
          label={`${first.scBtree.toFixed(1)}`}
          color="var(--color-s6)"
          shown={shown}
          delay={1000}
          dx={9}
          dy={-9}
        />
        <Annotation
          x={x.to(last.writeRatio)}
          y={y.to(last.scBtree)}
          label={`${last.scBtree.toFixed(1)}`}
          color="var(--color-s6)"
          shown={shown}
          delay={1080}
          anchor="end"
          dx={-9}
          dy={15}
        />
        <Annotation x={x.to(first.writeRatio)} y={y.to(first.prism)} label={`${first.prism.toFixed(1)}`} shown={shown} delay={1160} dx={9} dy={-9} />
        <Annotation
          x={x.to(last.writeRatio)}
          y={y.to(last.prism)}
          label={`${last.prism.toFixed(1)}`}
          shown={shown}
          delay={1240}
          anchor="end"
          dx={-9}
          dy={15}
        />
        {WRITE_RATIO_SWEEP.map((r) => {
          const cx = x.to(r.writeRatio);
          const hovered = tip?.title === `${r.writeRatio}% writes`;
          return (
            <g key={r.writeRatio}>
              {hovered ? (
                <line
                  x1={cx}
                  x2={cx}
                  y1={frame.pad.top}
                  y2={frame.pad.top + frame.innerH}
                  stroke="var(--color-ink)"
                  strokeWidth={0.75}
                  opacity={0.3}
                />
              ) : null}
              <rect
                x={cx - bandW / 2}
                y={frame.pad.top}
                width={bandW}
                height={frame.innerH}
                fill="transparent"
                onMouseEnter={() =>
                  setTip({
                    x: cx,
                    y: y.to(r.prism),
                    title: `${r.writeRatio}% writes`,
                    rows: SERIES.map((s) => ({ label: s.label, value: `${r[s.key].toFixed(1)} Mops/s`, color: s.color })),
                  })
                }
                onMouseLeave={() => setTip(null)}
              />
            </g>
          );
        })}
      </Plot>
      <Tip tip={tip} width={w} height={frame.height} />
      <Legend className="mt-3" items={SERIES.map((s) => ({ label: s.label, color: s.color }))} />
    </div>
  );
}
