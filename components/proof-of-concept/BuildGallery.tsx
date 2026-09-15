"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog } from 'radix-ui';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Header } from '@/components/experience/Header';
import { buildSteps, photoPath } from './buildSteps';
import { GalleryCanvas } from './GalleryCanvas';
import { nearestStage, pushRibbon, ribbonLayout, wrapStage } from './ribbonMotion';

export function BuildGallery() {
  const stage = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const paused = useRef(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const detail = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, lastX: 0, lastDelta: 0, lastTime: 0, moved: false, down: false });
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const step = selected === null ? null : buildSteps[selected];
  const onActive = useCallback((index: number) => setActive(index), []);
  const onReady = useCallback((value: boolean) => setReady(value), []);
  const clamp = (value: number) => Math.max(0, Math.min(buildSteps.length - 1, value));

  const navigate = useCallback((index: number) => {
    const destination = wrapStage(index, buildSteps.length);
    target.current = ready ? nearestStage(destination, current.current, buildSteps.length) : destination;
    if (!ready && rail.current) {
      const card = rail.current.querySelectorAll<HTMLButtonElement>('.build-card')[destination];
      rail.current.scrollTo({ left: card.offsetLeft - (rail.current.clientWidth - card.clientWidth) / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      current.current = destination;
      setActive(destination);
    }
  }, [ready]);

  const push = useCallback((pixels: number) => {
    const element = stage.current;
    if (!element || paused.current) return;
    target.current = pushRibbon(target.current, current.current, pixels, ribbonLayout(element.clientWidth, element.clientHeight));
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element || !ready) return;
    const wheel = (event: WheelEvent) => {
      if (paused.current || event.ctrlKey) return;
      event.preventDefault();
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1;
      push((event.deltaX + event.deltaY) * units);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [ready, push]);

  const open = (index: number, button: HTMLButtonElement) => {
    if (drag.current.moved) return;
    opener.current = button;
    paused.current = true;
    setSelected(index);
  };
  const changeAlbum = (index: number) => {
    setSelected(index);
    navigate(index);
    detail.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <main className="proof-page" data-theme="dark">
      <a className="skip-link" href="#build-navigation">Skip to build stages</a>
      <Header activePage="proof-of-concept" />
      <div className="build-intro">
        <h1>The Making of a Rover.</h1>
      </div>
      <div
        ref={stage}
        className="build-stage"
        data-ready={ready}
        aria-label="Photographic record of the rover build"
        onPointerDown={event => {
          if (!ready || event.button !== 0) return;
          drag.current = { x: event.clientX, lastX: event.clientX, lastDelta: 0, lastTime: event.timeStamp, moved: false, down: true };
        }}
        onPointerMove={event => {
          if (!ready || !drag.current.down) return;
          const distance = event.clientX - drag.current.x;
          if (drag.current.moved || Math.abs(distance) > 10) {
            if (!drag.current.moved) drag.current.lastX = event.clientX;
            drag.current.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            const delta = (drag.current.lastX - event.clientX) * 1.5;
            drag.current.lastDelta = delta;
            drag.current.lastX = event.clientX;
            drag.current.lastTime = event.timeStamp;
            push(delta);
          }
        }}
        onPointerUp={event => {
          drag.current.down = false;
          if (drag.current.moved && event.timeStamp - drag.current.lastTime < 100) push(drag.current.lastDelta * 12);
          drag.current.lastDelta = 0;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drag.current.down = false; }}
        onKeyDown={event => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const next = Math.round(target.current) + (event.key === 'ArrowRight' ? 1 : -1);
            const index = event.key === 'Home' ? 0 : event.key === 'End' ? 5 : ready ? wrapStage(next, buildSteps.length) : clamp(next);
            navigate(index);
            rail.current?.querySelectorAll<HTMLButtonElement>('.build-card')[index].focus({ preventScroll: true });
          }
        }}
      >
        <GalleryCanvas stage={stage} rail={rail} target={target} current={current} paused={paused} onActive={onActive} onReady={onReady} />
        <div className="build-rail" ref={rail} onScroll={() => {
          if (ready || !rail.current) return;
          const track = rail.current;
          const cards = Array.from(track.querySelectorAll<HTMLButtonElement>('.build-card'));
          const index = cards.reduce((best, card, i) => Math.abs(card.offsetLeft + card.clientWidth / 2 - track.scrollLeft - track.clientWidth / 2) < Math.abs(cards[best].offsetLeft + cards[best].clientWidth / 2 - track.scrollLeft - track.clientWidth / 2) ? i : best, 0);
          target.current = index;
          current.current = index;
          setActive(index);
        }}>
          {buildSteps.map((item, index) => (
            <button
              type="button" className="build-card" key={item.id}
              aria-label={`Open stage ${item.id}: ${item.title}, ${item.photos.length} photographs`}
              aria-haspopup="dialog"
              onClick={event => { if (event.detail === 0) drag.current.moved = false; open(index, event.currentTarget); }}
              onKeyUp={event => { if (event.key === 'Tab') navigate(index); }}
              onFocus={() => { if (!drag.current.down) navigate(index); }}
            >
              {/* Native images remain the no-WebGL and reduced-motion presentation. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPath(String(item.id), 'cover')} alt="" draggable={false} width={960} height={720} />
              <span className="build-card-count">{String(item.id).padStart(2, '0')} / 06</span>
              <span className="build-card-caption"><span><small>{item.category}</small><strong>{item.title}</strong></span><span className="build-card-open"><ArrowUpRight size={18} /></span></span>
            </button>
          ))}
        </div>
      </div>
      <footer className="build-footer">
        <nav id="build-navigation" className="build-navigation" aria-label="Build stages">
          {buildSteps.map((item, index) => <button type="button" key={item.id} onClick={() => navigate(index)} aria-label={`Go to stage ${item.id}: ${item.title}`} aria-current={active === index ? 'step' : undefined}>{String(item.id).padStart(2, '0')}</button>)}
        </nav>
        <div className="build-paging"><span aria-live="polite">{String(active + 1).padStart(2, '0')} <i>/ 06</i></span><button type="button" aria-label="Previous build stage" disabled={!ready && active === 0} onClick={() => navigate(Math.round(target.current) - 1)}><ArrowLeft size={17} /></button><button type="button" aria-label="Next build stage" disabled={!ready && active === 5} onClick={() => navigate(Math.round(target.current) + 1)}><ArrowRight size={17} /></button></div>
      </footer>

      <Dialog.Root open={selected !== null} onOpenChange={value => { if (!value) { setSelected(null); paused.current = false; } }}>
        <Dialog.Portal>
          <Dialog.Overlay className="build-modal-overlay" />
          <Dialog.Content
            className="build-modal" ref={detail}
            onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus({ preventScroll: true }); }}
          >
            {step && <>
              <Dialog.Close className="build-modal-close" aria-label="Close photo album"><X size={20} /></Dialog.Close>
              <aside className="build-detail-copy">
                <p className="build-eyebrow">Stage {String(step.id).padStart(2, '0')} / 06 <span className="build-detail-category">{step.category}</span></p>
                <Dialog.Title className="build-detail-title">{step.title}</Dialog.Title>
                <Dialog.Description className="build-detail-description">{step.description}</Dialog.Description>
                <p className="build-album-label">The Photographs <span>{String(step.photos.length).padStart(2, '0')}</span></p>
                <div className="build-thumbnails" aria-label="Photographs in this stage">
                  {step.photos.map(photo => <button key={photo.id} type="button" aria-label={`View photograph ${photo.id}: ${photo.caption}`} onClick={() => document.getElementById(`build-photo-${photo.id}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPath(photo.id, 'thumb')} alt="" width={72} height={60} /><span>{photo.id}</span>
                  </button>)}
                </div>
                <div className="build-album-navigation"><button type="button" disabled={selected === 0} onClick={() => changeAlbum(selected! - 1)}><ArrowLeft size={15} /> Previous Stage</button><button type="button" disabled={selected === 5} onClick={() => changeAlbum(selected! + 1)}>Next Stage <ArrowRight size={15} /></button></div>
              </aside>
              <div className="build-photo-column" key={step.id}>
                {step.photos.map((photo, index) => <figure key={photo.id} id={`build-photo-${photo.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPath(photo.id)} alt={photo.caption} width={photo.portrait ? 1200 : 1600} height={photo.portrait ? 1600 : 1200} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
                  <figcaption><span>{photo.id}</span>{photo.caption}</figcaption>
                </figure>)}
                <p className="build-album-end">End of Stage {String(step.id).padStart(2, '0')}<button type="button" onClick={() => { detail.current?.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>Back to Top <ArrowUpRight size={14} /></button></p>
              </div>
            </>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
