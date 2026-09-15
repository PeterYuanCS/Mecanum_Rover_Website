"use client";

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SketchKind } from './PencilScene';
const PencilScene = lazy(() => import('./PencilScene'));

class DrawingBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const notes: Record<SketchKind, [string, string?]> = {
  rover: ['Four independently driven wheels'],
  stack: ['Control + power', 'Two additional accessory decks'],
  scan: ['180° field of observation', 'Servo-mounted distance sensor'],
  vision: ['DJI O4 camera', 'Distance sensing retained below'],
};

export function PencilFigure({ kind = 'rover', description }: { kind?: SketchKind; description: string }) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [poster, setPoster] = useState(`/images/report/${kind}-study.png`);
  const [lost, setLost] = useState(false);
  const [angle, setAngle] = useState(.72);
  const onImage = useCallback((data: string) => setPoster(data), []);
  const onLost = useCallback(() => setLost(true), []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '250px' });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  const fallback = <div className="pencil-fallback"><span>{notes[kind][0]}</span><p>{notes[kind][1]}</p><small>The interactive drawing requires WebGL.</small></div>;
  return <figure className={`report-figure pencil-figure pencil-${kind}`}>
    <div className="pencil-stage" ref={element} role="group" aria-label={`Pencil drawing: ${description}`}>
      {poster && <img className="pencil-poster" src={poster} alt={description} loading="lazy" />}
      {visible && !lost && <DrawingBoundary fallback={poster ? null : fallback} onError={onLost}><Suspense fallback={null}><PencilScene kind={kind} angle={angle} onImage={onImage} onLost={onLost} /></Suspense></DrawingBoundary>}
      {lost && !poster && fallback}
      <div className="pencil-note pencil-note-top" aria-hidden="true">{notes[kind][0]}<svg viewBox="0 0 90 45"><path d="M2 2 Q50 2 83 37 M75 34 L84 39 86 30" /></svg></div>
      {notes[kind][1] && <div className="pencil-note pencil-note-bottom" aria-hidden="true">{notes[kind][1]}</div>}
      {!lost && <div className="pencil-tools"><button type="button" onClick={() => setAngle(a => a - .35)} aria-label={`Rotate ${kind} drawing left`}>←</button><span>Drag to inspect</span><button type="button" onClick={() => setAngle(a => a + .35)} aria-label={`Rotate ${kind} drawing right`}>→</button></div>}
    </div>
  </figure>;
}
