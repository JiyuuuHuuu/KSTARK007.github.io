// The SCR as a sliver of the device: a bar for the LNR with a widened marker
// for the coherent region, magnified in a callout above it.
import { usePlateReveal } from '../kit/plot';
import { TWO_REGIONS_NOTE } from '@/content/posts/one-memory-many-machines/data';

export default function TwoRegions() {
  const { ref, shown, width } = usePlateReveal(0.3, 520);
  const w = Math.max(300, width);
  const barW = w - 28;
  const calloutW = Math.min(190, 0.42 * w);
  const fade = (ms: number, delay = 0) => ({ transition: `opacity ${ms}ms ${delay ? `${delay}ms ` : ''}ease-out` });

  return (
    <div ref={ref}>
      <svg
        viewBox={`0 0 ${w} 152`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="The hardware-coherent region against the whole device, marker widened for visibility"
      >
        <title>SCR versus LNR, not to scale</title>
        <g opacity={shown ? 1 : 0} style={fade(520, 360)}>
          <path d={`M 14 60 L ${14 + calloutW} 60 L 19.5 92 L 14 92 Z`} fill="var(--color-accent)" opacity={0.1} />
          <rect x={14} y={8} width={calloutW} height={52} rx={4} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.25} />
          <text x={27} y={30} className="fill-accent-deep font-mono" fontSize={11.5} fontWeight={700}>
            SCR · 100s MB
          </text>
          <text x={27} y={47} className="fill-accent-deep font-mono" fontSize={9}>
            hardware coherent
          </text>
        </g>
        <rect
          x={14}
          y={92}
          width={barW}
          height={44}
          rx={4}
          fill="var(--color-s5)"
          opacity={shown ? 0.2 : 0}
          stroke="var(--color-s5)"
          strokeWidth={1}
          style={fade(500)}
        />
        <rect x={14} y={92} width={2.5} height={44} fill="var(--color-accent)" opacity={shown ? 1 : 0} style={fade(500, 300)} />
        <text
          x={14 + barW / 2}
          y={119}
          textAnchor="middle"
          className="fill-ink font-mono"
          fontSize={11}
          fontWeight={600}
          opacity={shown ? 1 : 0}
          style={fade(500, 200)}
        >
          LNR · several TB · no coherence across hosts
        </text>
        <text x={14} y={151} className="fill-ink-faint font-mono" fontSize={9} opacity={shown ? 1 : 0} style={fade(420, 460)}>
          0
        </text>
        <text
          x={14 + barW}
          y={151}
          textAnchor="end"
          className="fill-ink-faint font-mono"
          fontSize={9}
          opacity={shown ? 1 : 0}
          style={fade(420, 460)}
        >
          4 TB
        </text>
      </svg>
      <p className="mt-3 font-serif text-[12.5px] leading-relaxed text-ink-muted italic">{TWO_REGIONS_NOTE}</p>
    </div>
  );
}
