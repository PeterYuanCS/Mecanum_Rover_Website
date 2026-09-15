"use client";

import { Pause, Play, Radar, RotateCw } from "lucide-react";
import { scanRadius, type ScanReading } from "@/components/car/rangeScan";

export function RangeScanReadout({ reading, playing, reduced, detail, onPlay }: {
  reading: ScanReading; playing: boolean; reduced: boolean; detail: boolean; onPlay: () => void;
}) {
  const bearing = Math.round(reading.angle * 180 / Math.PI);
  const plot = (angle: number, distance: number) => ({ x: 110 + Math.sin(angle) * distance / scanRadius * 93, y: 109 - Math.cos(angle) * distance / scanRadius * 93 });
  const endpoint = plot(reading.angle, reading.distance ?? scanRadius);
  return <aside className="vision-readout scan-readout" aria-label="180 degree distance scan">
    <div className="vision-readout-heading"><Radar size={15} /><span>A WIDER SENSE OF SPACE</span></div>
    <h3>{detail ? "A sensor that turns." : "One sweep. More context."}</h3>
    {detail ? <div className="scan-detail-copy"><p>A micro servo turns the distance sensor through a half circle. Its cradle, sensor, and flexible leads move together.</p><div className="camera-feature"><span>01</span> Fixed servo mount</div><div className="camera-feature"><span>02</span> Rotating sensor cradle</div><div className="camera-feature"><span>03</span> Left-to-right distance sweep</div></div> : <>
      <svg className="scan-map" viewBox="0 0 220 133" role="img" aria-label="Top view of the 180 degree scan and measured obstacle returns">
        {[31, 62, 93].map((radius) => <path key={radius} d={`M ${110 - radius} 109 A ${radius} ${radius} 0 0 1 ${110 + radius} 109`} fill="none" stroke="#d9e2cd" strokeWidth="0.7" />)}
        {[-90, -45, 0, 45, 90].map((degrees) => { const p = plot(degrees * Math.PI / 180, scanRadius); return <line key={degrees} x1="110" y1="109" x2={p.x} y2={p.y} stroke="#e1e7d8" strokeWidth="0.6" />; })}
        <path d={`M 110 109 L ${plot(reading.angle - 0.085, scanRadius).x} ${plot(reading.angle - 0.085, scanRadius).y} L ${plot(reading.angle + 0.085, scanRadius).x} ${plot(reading.angle + 0.085, scanRadius).y} Z`} fill="#b7d691" opacity="0.25" />
        {reading.samples.map((sample, i) => { const p = plot(sample.angle, sample.distance); return <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#88a95f" />; })}
        <line x1="110" y1="109" x2={endpoint.x} y2={endpoint.y} stroke="#78a34b" strokeWidth="1.2" />
        {reading.distance !== null && <circle cx={endpoint.x} cy={endpoint.y} r="3" fill="#c89c56" />}
        <circle cx="110" cy="109" r="3" fill="#486534" />
        <g fill="#87917b" fontSize="8" fontFamily="monospace"><text x="9" y="126">−90°</text><text x="106" y="10">0°</text><text x="190" y="126">+90°</text></g>
      </svg>
      <div className="scan-measurements"><div><span>BEARING</span><strong>{bearing > 0 ? "+" : ""}{bearing}°</strong></div><div><span>ECHO</span><strong>{reading.distance === null ? "—" : Math.round(reading.distance * 20)}<small>{reading.distance === null ? "" : " cm"}</small></strong></div></div>
      <p className="scan-status">{reading.hit ? `Return from obstacle ${reading.hit}` : "Sweeping for the next return"}<span>Simulated distances</span></p>
    </>}
    <div className="vision-playback"><span><RotateCw size={11} /> {reduced ? "Static survey" : "180° field of view"}</span><button type="button" disabled={reduced} aria-label={playing ? "Pause distance sweep" : "Resume distance sweep"} onClick={onPlay}>{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? "Pause" : "Play"}</button></div>
  </aside>;
}
