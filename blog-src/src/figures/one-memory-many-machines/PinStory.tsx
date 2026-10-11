// Pin budgets: a CPU reaching local DRAM over a wide DDR ribbon and CXL memory over a narrow CXL link.
import { usePlateReveal } from '../kit/plot';
import { PIN_STORY } from '@/content/posts/one-memory-many-machines/data';

export default function PinStory() {
  const { ref, shown } = usePlateReveal(0.3);

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 560 210"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="Pin counts of DDR versus CXL attachments"
      >
        <title>DDR versus CXL pin budgets</title>
        {/* The CPU package. */}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 500ms ease-out' }}>
          <rect x={20} y={60} width={110} height={90} rx={6} fill="var(--color-paper-sunk)" stroke="var(--color-ink)" strokeWidth={1.25} />
          <rect x={40} y={80} width={70} height={50} rx={3} fill="var(--color-paper-raised)" stroke="var(--color-rule-strong)" />
          <text x={75} y={109} textAnchor="middle" className="fill-ink font-mono" fontSize={11} fontWeight={600}>
            CPU
          </text>
        </g>
        {/* The wide DDR ribbon to local DRAM. */}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 600ms 200ms ease-out' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={130} y1={70 + 4 * i} x2={330} y2={30 + 4 * i} stroke="var(--color-s5)" strokeWidth={2} opacity={0.75} />
          ))}
          <rect x={330} y={22} width={130} height={52} rx={4} fill="var(--color-paper-raised)" stroke="var(--color-s5)" strokeWidth={1.25} />
          <text x={395} y={44} textAnchor="middle" className="fill-ink font-mono" fontSize={10.5} fontWeight={600}>
            LOCAL DRAM
          </text>
          <text x={395} y={60} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={9}>
            hundreds of GB
          </text>
          <text x={196} y={28} textAnchor="middle" className="font-mono" fill="var(--color-s5)" fontSize={9.5} fontWeight={600}>
            {PIN_STORY.ddrChannel}
            {' · '}
            {PIN_STORY.ddrPins}
            {' · '}
            {PIN_STORY.ddrBandwidth}
          </text>
        </g>
        {/* The narrow CXL link, through a controller, to CXL memory. */}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 600ms 400ms ease-out' }}>
          {[0, 1].map((i) => (
            <line key={i} x1={130} y1={132 + 5 * i} x2={300} y2={150 + 5 * i} stroke="var(--color-accent)" strokeWidth={2.25} />
          ))}
          <rect x={300} y={138} width={64} height={34} rx={4} fill="var(--color-paper-raised)" stroke="var(--color-accent)" strokeWidth={1.25} />
          <text x={332} y={153} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={8.5} fontWeight={600}>
            CXL
          </text>
          <text x={332} y={165} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={8.5}>
            CTRL
          </text>
          {[0, 1].map((i) => (
            <line key={i} x1={364} y1={150 + 5 * i} x2={430} y2={150 + 5 * i} stroke="var(--color-accent)" strokeWidth={2.25} />
          ))}
          <rect x={430} y={128} width={110} height={58} rx={4} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.5} />
          <text x={485} y={152} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={10.5} fontWeight={600}>
            CXL MEMORY
          </text>
          <text x={485} y={168} textAnchor="middle" className="fill-accent-deep font-mono" fontSize={9}>
            terabytes
          </text>
          <text x={222} y={190} textAnchor="middle" className="font-mono" fill="var(--color-accent)" fontSize={9.5} fontWeight={600}>
            {PIN_STORY.cxlLink}
            {' · '}
            {PIN_STORY.cxlPins}
            {' · '}
            {PIN_STORY.cxlBandwidth}
          </text>
        </g>
      </svg>
    </div>
  );
}
