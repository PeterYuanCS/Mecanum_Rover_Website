"use client";
import { useEffect, useState } from 'react';
export const reportSections = [
  ['concept', 'The Concept'], ['diagram', 'The Diagram'], ['components', 'The Components'], ['conception', 'The Rover Conception'],
  ['code', 'The Open-Source Code'], ['showcase', 'The Showcase'], ['limitations', 'The Limitations'], ['future', 'The Future Works'],
];
export function ReportContents() {
  const [active, setActive] = useState('concept');
  useEffect(() => {
    const track = () => {
      let current = 'concept';
      for (const [id] of reportSections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * .35) current = id;
      }
      setActive(current);
    };
    track(); window.addEventListener('scroll', track, { passive: true });
    return () => window.removeEventListener('scroll', track);
  }, []);
  return <nav className="report-contents" aria-label="Report contents"><p>In This Report</p><ol>{reportSections.map(([id, name], i) =>
    <li key={id}><a href={`#${id}`} aria-current={active === id ? 'location' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{name}</a></li>
  )}</ol></nav>;
}
