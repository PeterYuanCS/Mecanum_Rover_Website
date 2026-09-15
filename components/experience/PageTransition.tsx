"use client";

import { createContext, useContext, useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NavigationContext = createContext<((href: string) => void) | null>(null);

/** Keep the colour cover in place until the new route has painted its scene. */
function waitForScene(root: HTMLElement, pathname: string, signal: AbortSignal) {
  return new Promise<void>(resolve => {
    const finish = () => {
      observer.disconnect();
      clearTimeout(timeout);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const check = () => {
      if (root.dataset.routePath !== pathname) return;
      if (root.querySelector('[data-scene-ready="true"], .scene-error')) finish();
    };
    const observer = new MutationObserver(check);
    // A failed scene or interrupted route must never leave navigation covered indefinitely.
    const timeout = setTimeout(finish, 8000);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-route-path', 'data-scene-ready'] });
    signal.addEventListener('abort', finish, { once: true });
    if (signal.aborted) finish(); else check();
  });
}

async function fade(element: HTMLElement, opacity: number, duration: number, signal: AbortSignal) {
  const animation = element.animate(
    [{ opacity: getComputedStyle(element).opacity }, { opacity }],
    { duration, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' },
  );
  const cancel = () => animation.cancel();
  signal.addEventListener('abort', cancel, { once: true });
  await animation.finished.catch(() => {});
  if (!signal.aborted) element.style.opacity = String(opacity);
  animation.cancel();
  signal.removeEventListener('abort', cancel);
}

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const page = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const cancel = () => pending.current?.abort();
    window.addEventListener('popstate', cancel);
    return () => { cancel(); window.removeEventListener('popstate', cancel); };
  }, []);

  const navigate = async (href: string) => {
    if (pending.current) return;
    const surface = page.current, cover = veil.current;
    if (!surface || !cover || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(href);
      return;
    }
    const destination = new URL(href, window.location.href);
    const controller = new AbortController();
    pending.current = controller;
    cover.style.backgroundColor = destination.pathname === '/proof-of-concept' ? '#080908' : '#ffffff';
    cover.dataset.active = 'true';
    try {
      // Blend the current page into the destination colour before changing its content.
      await fade(cover, 1, 340, controller.signal);
      if (controller.signal.aborted) return;
      const painted = waitForScene(surface, destination.pathname, controller.signal);
      router.push(href, { scroll: true });
      await painted;
      if (controller.signal.aborted) return;
      await fade(cover, 0, 420, controller.signal);
    } finally {
      cover.style.opacity = '0';
      delete cover.dataset.active;
      if (pending.current === controller) pending.current = null;
    }
  };

  return <NavigationContext.Provider value={navigate}>
    <div ref={page} className="route-content" data-route-path={pathname}>{children}</div>
    <div ref={veil} className="route-veil" aria-hidden="true" />
  </NavigationContext.Provider>;
}

/** Next's navigation event preserves modifier clicks, downloads and same-page anchors. */
export function TransitionLink(props: ComponentProps<typeof Link>) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} onNavigate={event => {
    props.onNavigate?.(event);
    if (!navigate || typeof props.href !== 'string') return;
    const destination = new URL(props.href, window.location.href);
    if (destination.pathname === window.location.pathname) return;
    event.preventDefault();
    navigate(props.href);
  }} />;
}
