import { useId, type ReactNode } from 'react';

// Deterministic companion strokes preserve sharp, selectable diagram labels.
// Wiring and algorithms stay vector-based for printing and small screens.
function PencilPath({ d, strong = false, dashed = false }: { d: string; strong?: boolean; dashed?: boolean }) {
  return <g fill="none" stroke="currentColor" strokeWidth={strong ? 2.1 : 1.1} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '5 6' : undefined}>
    <path d={d} /><path d={d} transform="translate(.8 -.6)" opacity=".24" strokeWidth=".65" />
  </g>;
}
function Board({ x, y, w, h, name, detail }: { x: number; y: number; w: number; h: number; name: string; detail: string }) {
  return <g><PencilPath d={`M${x} ${y + 2} L${x + w - 1} ${y} L${x + w} ${y + h - 1} L${x + 1} ${y + h} Z`} />
    {[0, 1].flatMap(i => [0, 1].map(j => <circle key={`${i}${j}`} cx={x + 8 + i * (w - 16)} cy={y + 8 + j * (h - 16)} r="2" fill="none" stroke="currentColor" opacity=".5" />))}
    <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" className="diagram-label">{name}</text>
    <text x={x + w / 2} y={y + h / 2 + 18} textAnchor="middle" className="diagram-detail">{detail}</text>
  </g>;
}
function Motor({ x, y, label }: { x: number; y: number; label: string }) {
  return <g><PencilPath d={`M${x - 15} ${y - 16} Q${x} ${y - 20} ${x + 15} ${y - 16} L${x + 15} ${y + 15} Q${x} ${y + 19} ${x - 15} ${y + 15} Z M${x} ${y - 19} V${y - 30}`} />
    <text x={x} y={y + 5} textAnchor="middle" className="diagram-label">M</text><text x={x} y={y + 40} textAnchor="middle" className="diagram-detail">{label}</text>
  </g>;
}
export function WiringFigure() {
  const id = useId();
  return <figure className="report-figure wiring-figure">
    <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Rover system diagram, scroll horizontally on small screens">
      <svg viewBox="0 0 720 520" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>The Rover Electrical Architecture</title>
        <desc id={`${id}-description`}>An ESP32 sends direction and enable signals to two L298N boards. The front driver powers the front-right and front-left motors; the rear driver powers the rear-right and rear-left motors. Two 18650 cells supply the motor power path. Logic power requires suitable regulation. All modules share a ground. The added HC-SR04 connects by trigger and level-shifted echo signals.</desc>
        <defs><pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V6" stroke="currentColor" strokeWidth=".7" opacity=".13" /></pattern></defs>
        <Motor x={64} y={88} label="Front right" /><Motor x={206} y={88} label="Front left" />
        <Motor x={514} y={88} label="Rear right" /><Motor x={656} y={88} label="Rear left" />
        <PencilPath strong d="M64 107 L64 149 L111 150 L111 173 M206 107 L206 149 L159 150 L159 173 M514 107 L514 149 L561 150 L561 173 M656 107 L656 149 L609 150 L609 173" />
        <Board x={68} y={174} w={134} h={87} name="L298N" detail="Front motor pair" /><Board x={518} y={174} w={134} h={87} name="L298N" detail="Rear motor pair" />
        <rect x="82" y="184" width="105" height="12" fill={`url(#${id}-hatch)`} /><rect x="532" y="184" width="105" height="12" fill={`url(#${id}-hatch)`} />
        <Board x={289} y={169} w={142} h={103} name="ESP32" detail="Control + expansion" />
        <PencilPath d="M289 205 C257 204 235 207 202 205 M289 214 C258 213 230 216 202 214 M431 205 C460 205 486 207 518 205 M431 214 C460 214 489 216 518 214" />
        <text x="244" y="191" textAnchor="middle" className="diagram-detail">Control</text><text x="474" y="191" textAnchor="middle" className="diagram-detail">Control</text>
        <Board x={294} y={59} w={132} h={62} name="HC-SR04" detail="Distance sensor" />
        <PencilPath dashed d="M347 122 V167 M372 167 V122" />
        <text x="333" y="145" textAnchor="end" className="diagram-detail">Trigger</text>
        <text x="386" y="145" className="diagram-detail">Echo</text>
        <PencilPath strong d="M135 262 L135 358 L297 358 M585 262 L585 358 L424 358" />
        <text x="196" y="345" className="diagram-detail">Motor supply</text><text x="470" y="345" className="diagram-detail">Motor supply</text>
        <Board x={297} y={318} w={127} h={80} name="2 × 18650" detail="Battery holder" />
        <PencilPath d="M352 318 V273 M365 318 V273" />
        <text x="378" y="298" className="diagram-detail">Regulated logic supply</text>
        <PencilPath dashed d="M86 263 L86 429 L635 429 L635 263 M319 272 V300 H256 V429 M405 398 V429" />
        <PencilPath d="M351 429 V441 M339 442 L363 441 M343 448 L359 447 M348 454 H355" />
        <text x="377" y="454" className="diagram-detail">Common ground</text>
      </svg>
    </div>
  </figure>;
}

export const avoidanceAlgorithm = [
  ['01', 'repeat', ''],
  ['02', 'front ← measure_forward()', 'indent'],
  ['03', 'if front is invalid: stop; retry', 'indent'],
  ['04', 'if front > clearance: drive_forward', 'indent'],
  ['05', 'else', 'indent'],
  ['06', 'stop; remember_heading', 'indent2'],
  ['07', 'turn_left; left ← measure(); return_heading', 'indent2'],
  ['08', 'turn_right; right ← measure(); return_heading', 'indent2'],
  ['09', 'if left or right is invalid: stop; retry', 'indent2'],
  ['10', 'if either side > clearance', 'indent2'],
  ['11', 'turn_towards the clearer available side', 'indent3'],
  ['12', 'else', 'indent2'],
  ['13', 'reverse for a target distance ≥ 1 metre', 'indent3'],
  ['14', 'stop; measure again', 'indent3'],
];
export function AlgorithmFigure() {
  return <figure className="report-figure algorithm-figure">
    <div className="algorithm-flow" aria-hidden="true"><span>Observe</span><i>→</i><span>Inspect Both Sides</span><i>→</i><span>Choose or Retreat</span></div>
    <pre tabIndex={0} aria-label="Obstacle avoidance pseudocode"><code>{avoidanceAlgorithm.map(([number, line, indent]) => <span key={number} className={`algorithm-line ${indent}`}><span className="algorithm-number" aria-hidden="true">{number}</span><span>{line}</span>{'\n'}</span>)}</code></pre>
  </figure>;
}

export function ReportSection({ id, number, title, children }: { id: string; number: string; title: string; children: ReactNode }) {
  return <section className="report-section" id={id} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}><span>{number}</span>{title}</h2>{children}</section>;
}
