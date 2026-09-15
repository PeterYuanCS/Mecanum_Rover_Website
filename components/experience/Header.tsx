"use client";
import { ArrowUpRight } from 'lucide-react';
import type { MouseEvent } from 'react';
import { TransitionLink as Link } from './PageTransition';

export function Header({
  goTo,
  activePage = "project",
}: {
  goTo?: (i: number) => void;
  activePage?: "project" | "proof-of-concept" | "future-work" | "report";
}) {
  const returnToProject = (event: MouseEvent<HTMLAnchorElement>) => {
    if (activePage === "project" && goTo) {
      event.preventDefault();
      goTo(0);
    }
  };

  return (
    <header className="site-header">
      <div className="brand-lockup">
        <Link
          className="wordmark"
          href="/#project"
          onClick={returnToProject}
          aria-label="Mecanum Rover, back to the beginning"
        >
          Mecanum<span className="logo-cross">✳</span>Rover
        </Link>
        <span className="brand-credit">By Peter Yuan</span>
      </div>
      <div className="header-actions">
        <nav className="pill-nav" aria-label="Project navigation">
          <Link href="/#project" data-active={activePage === "project"} onClick={returnToProject}>
            Project
          </Link>
          <Link href="/proof-of-concept" data-active={activePage === "proof-of-concept"}>
            Engineering
          </Link>
          <Link href="/future-work" data-active={activePage === "future-work"}>
            Future Work
          </Link>
          <Link href="/report" data-active={activePage === "report"} aria-current={activePage === "report" ? "page" : undefined}>
            Report
          </Link>
        </nav>
        <details className="mobile-page-menu">
          <summary>Explore</summary>
          <nav aria-label="Mobile project navigation">
            <Link href="/#project" aria-current={activePage === 'project' ? 'page' : undefined} onClick={event => { event.currentTarget.closest('details')?.removeAttribute('open'); returnToProject(event); }}>Project</Link>
            <Link href="/proof-of-concept" aria-current={activePage === 'proof-of-concept' ? 'page' : undefined} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>Engineering</Link>
            <Link href="/future-work" aria-current={activePage === 'future-work' ? 'page' : undefined} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>Future Work</Link>
            <Link href="/report" aria-current={activePage === 'report' ? 'page' : undefined} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>Report</Link>
          </nav>
        </details>
        <a
          className="lime-button"
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <ArrowUpRight size={15} />
        </a>
      </div>
    </header>
  );
}
