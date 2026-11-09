"use client";

import { useEffect, useRef, useState } from 'react';
import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { ArrowRight, Box, Maximize, Minimize, Pause, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Header } from '@/components/experience/Header';
import { TransitionLink } from '@/components/experience/PageTransition';

const playbackId = 'QfjnSLo8Fo58ghcV3NS6TxXXY7oZo1K5RBAHgHchUOo';
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function WatchExperience() {
  const player = useRef<MuxPlayerRefAttributes>(null);
  const experience = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [perspective, setPerspective] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const change = () => setExpanded(document.fullscreenElement === experience.current);
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);

  const togglePlay = async () => {
    const media = player.current;
    if (!media) return;
    if (!media.paused) { media.pause(); return; }
    setError('');
    try { await media.play(); } catch { setError('Playback could not start. Please try again.'); }
  };
  const seek = (value: number) => {
    if (!player.current || !duration) return;
    player.current.currentTime = Math.max(0, Math.min(duration, value));
    setTime(player.current.currentTime);
  };
  const fullscreen = async () => {
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    if (expanded) { setExpanded(false); return; }
    try {
      if (!experience.current?.requestFullscreen) { setExpanded(true); return; }
      await experience.current.requestFullscreen();
    } catch { setExpanded(true); }
  };

  return <main ref={experience} id="watch-experience" className="watch-page" data-theme="dark" data-scene-ready="true" data-perspective={perspective} data-expanded={expanded}>
    <a className="skip-link" href="#film-controls">Skip to video controls</a>
    <Header activePage="watch-me" />
    <div className="watch-floor" aria-hidden="true"><div /></div>
    <div className="watch-orbit" aria-hidden="true" />

    <div className="watch-heading">
      <h1><span className="watch-title-left">Watch<br />Mecanum Rover</span>{' '}<span className="watch-title-right">in my <br />flat.</span></h1>
      <div className="watch-links">
        <TransitionLink href="/proof-of-concept" className="watch-build-link">Behind the build <ArrowRight size={15} /></TransitionLink>
        <TransitionLink href="/report#showcase" className="watch-showcase-link">Read about the showcase <ArrowRight size={15} /></TransitionLink>
      </div>
    </div>

    <div className="watch-stage">
      <div className="watch-screen-float">
        <div className="watch-screen">
          <div className="watch-screen-back" aria-hidden="true" />
          <div className="watch-screen-edge" aria-hidden="true" />
          <div className="watch-screen-face">
            <div className="watch-screen-top"><span className={playing ? 'is-playing' : ''} /> Video Showcasing Mecanum Rover</div>
            <div className="watch-video">
              <MuxPlayer
                ref={player}
                playbackId={playbackId}
                streamType="on-demand"
                metadata={{ video_title: 'Mecanum Rover: Three Demonstrations' }}
                playsInline
                preload="metadata"
                muted={muted}
                thumbnailTime={45}
                disablePictureInPicture
                nohotkeys
                fullscreenElement="watch-experience"
                accentColor="#caff72"
                onPlay={() => { setPlaying(true); setError(''); }}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onTimeUpdate={() => setTime(player.current?.currentTime || 0)}
                onDurationChange={() => { const value = player.current?.duration; if (value && Number.isFinite(value)) setDuration(value); }}
                onVolumeChange={() => setMuted(player.current?.muted ?? false)}
                onError={() => setError('The film is temporarily unavailable. Please retry playback.')}
              />
              <button type="button" className="watch-screen-play" aria-label={playing ? 'Pause video' : 'Start Rover'} onClick={togglePlay}>
                {!playing && <span><span className="watch-rover-mark" aria-hidden="true">✳</span><small>Start Rover</small></span>}
              </button>
              <div className="draft-watermark watch-watermark" aria-label="Draft by Simon Provost"><span className="draft-word">DRAFT</span><span className="draft-byline">By Simon Provost</span></div>
            </div>
            <div className="watch-screen-bottom"><span>Version 0.0.1</span><span>ESP32 / HC-SR04</span></div>
          </div>
        </div>
      </div>
      <div className="watch-shadow" aria-hidden="true" />
    </div>

    <div className="watch-controls-wrap">
      {error && <p className="watch-error" role="alert">{error} <button type="button" onClick={() => { player.current?.load(); setError(''); }}>Retry</button></p>}
      <div className="watch-controls" id="film-controls" role="region" aria-label="Video controls">
        <button className="watch-play-toggle" type="button" onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Start Rover'} title={playing ? 'Pause' : 'Start Rover'}>{playing ? <Pause size={18} fill="currentColor" /> : <span className="watch-rover-mark" aria-hidden="true">✳</span>}</button>
        <button type="button" onClick={() => seek(time - 10)} disabled={!duration} aria-label="Back 10 seconds" title="Back 10 seconds"><SkipBack size={17} /></button>
        <button type="button" onClick={() => seek(time + 10)} disabled={!duration} aria-label="Forward 10 seconds" title="Forward 10 seconds"><SkipForward size={17} /></button>
        <span className="watch-control-divider" />
        <span className="watch-time">{formatTime(time)}</span>
        <input type="range" min={0} max={duration || 1} step={0.1} value={time} disabled={!duration} onChange={event => seek(Number(event.target.value))} aria-label="Video position" aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`} style={{ background: `linear-gradient(to right, #caff72 ${duration ? time / duration * 100 : 0}%, #41463b 0)` }} />
        <span className="watch-time watch-duration">{formatTime(duration)}</span>
        <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute video' : 'Mute video'} title={muted ? 'Unmute' : 'Mute'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
        <button className="watch-replay" type="button" onClick={() => seek(0)} disabled={!duration} aria-label="Restart video" title="Restart"><RotateCcw size={16} /></button>
        <span className="watch-control-divider" />
        <button className="watch-view-toggle" type="button" onClick={() => setPerspective(!perspective)} aria-pressed={perspective} aria-label="Toggle perspective view" title="Toggle perspective view"><Box size={17} /><span>{perspective ? '3D view' : 'Flat view'}</span></button>
        <button type="button" onClick={fullscreen} aria-label={expanded ? 'Exit fullscreen' : 'Fullscreen video'} title={expanded ? 'Exit fullscreen' : 'Fullscreen'}>{expanded ? <Minimize size={17} /> : <Maximize size={17} />}</button>
      </div>
    </div>
  </main>;
}
