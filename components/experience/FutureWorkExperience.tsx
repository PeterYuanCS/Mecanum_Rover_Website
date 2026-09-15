"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Camera, Pause, Play, Radar, RotateCw, ScanLine } from "lucide-react";
import CarScene, { type View } from "@/components/car/CarScene";
import { initialScanReading } from "@/components/car/rangeScan";
import { RangeScanReadout } from "@/components/experience/RangeScanReadout";
import { visionSubjects } from "@/components/car/VisionEnvironment";
import { Header } from "@/components/experience/Header";
import { ModelControls } from "@/components/experience/ModelControls";
import { StoryPanel, type Motion } from "@/components/experience/StoryPanel";
import { futureWorkChapter, scanWorkChapter, visionWorkChapter } from "@/components/experience/chapters";
import { useScrollJourney } from "@/components/experience/useScrollJourney";

const futureChapters = [{ ...futureWorkChapter, at: 0 }, { ...scanWorkChapter, at: 0.5 }, { ...visionWorkChapter, at: 0.9 }];

export function FutureWorkExperience() {
  const { progress, reduced, manual, setManual, goTo } = useScrollJourney(futureChapters);
  const chapter = progress < 0.3 ? 0 : progress < 0.7 ? 1 : 2;

  // Retain existing shared links while using scrolling for all chapter navigation.
  useEffect(() => {
    const followHash = () => {
      if (window.location.hash === "#vision") goTo(2);
      if (window.location.hash === "#scan") goTo(1);
      if (window.location.hash === "#scalable") goTo(0);
    };
    followHash();
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, [goTo]);

  return <main data-theme="light" className="future-work-page">
    <a className="skip-link" href="#future-chapter-controls">Skip to chapter controls</a>
    <Header activePage="future-work" />
    <div className="scroll-journey future-work-journey">
      <FutureChapter chapter={chapter} progress={progress} reduced={reduced} manual={manual} setManual={setManual} goTo={goTo} />
    </div>
  </main>;
}

function FutureChapter({ chapter, progress, reduced, manual, setManual, goTo }: {
  chapter: number;
  progress: number;
  reduced: boolean;
  manual: number | null;
  setManual: (value: number | null) => void;
  goTo: (index: number) => void;
}) {
  const vision = chapter === 2;
  const scanner = chapter === 1;
  const expanded = chapter === 0;
  const story = futureChapters[chapter];
  const [view, setView] = useState<View>("perspective");
  const explode = expanded ? manual ?? 1 : 0;
  const [labels, setLabels] = useState(false);
  const [motion, setMotion] = useState<Motion>("stopped");
  const [resetKey, setResetKey] = useState(0);
  const [inspect, setInspect] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [turn, setTurn] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [detail, setDetail] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [visionStep, setVisionStep] = useState(0);
  const [scanReading, setScanReading] = useState(initialScanReading);
  const [previousChapter, setPreviousChapter] = useState(chapter);
  const subject = visionSubjects[visionStep];

  // Keep the Canvas mounted while resetting inspection when the scroll changes chapter.
  if (previousChapter !== chapter) {
    setPreviousChapter(chapter);
    setView("perspective");
    setLabels(false);
    setInspect(false);
    setZoom(1);
    setTurn(0);
    setAutoRotate(false);
    setDetail(false);
    setPlaying(true);
    setVisionStep(0);
    setScanReading(initialScanReading);
  }

  const interact = useCallback(() => { setInspect(true); setAutoRotate(false); }, []);
  const reset = () => {
    setView("perspective");
    setManual(null);
    setResetKey((value) => value + 1);
    setZoom(1);
    setAutoRotate(false);
    setInspect(false);
    setLabels(false);
  };
  const showDetail = (next: boolean) => {
    setDetail(next);
    setView("perspective");
    setInspect(false);
    setZoom(1);
    setAutoRotate(false);
  };

  return (
      <section className={`experience chapter-8 ${!expanded ? "vision-page" : ""} ${scanner ? "scan-page" : ""} ${inspect ? "inspect-mode" : ""} ${detail ? "vision-detail" : ""}`} aria-label={`Future Work, step ${chapter + 1}: ${story.label}`} data-chapter={chapter}>
        <StoryPanel key={chapter} chapter={8} progress={0.86} reduced={reduced} story={story} />
        {!expanded ? (
          <div className="stack-view-control vision-view-control" role="group" aria-label={scanner ? "Distance scanner view" : "Vision view"}>
            <button type="button" aria-pressed={!detail} onClick={() => showDetail(false)}>{scanner ? <Radar size={14} /> : <ScanLine size={14} />} {scanner ? "180° sweep" : "Environment"}</button>
            <button type="button" aria-pressed={detail} onClick={() => showDetail(true)}>{scanner ? <RotateCw size={14} /> : <Camera size={14} />} {scanner ? "Sensor detail" : "Camera detail"}</button>
          </div>
        ) : (
          <div className="stack-view-control" role="group" aria-label="Deck assembly">
            <button type="button" aria-pressed={explode === 0} onClick={() => setManual(0)}>Assembled</button>
            <button type="button" aria-pressed={explode === 1} onClick={() => setManual(1)}>Exploded</button>
          </div>
        )}
        <div className="scene">
          <CarScene
            explode={explode} view={view} motion="stopped" reduced={reduced}
            resetKey={resetKey} labels={labels} chapter={0} sensorFocus={false}
            futureStack={expanded} scanner={scanner} scanPlaying={playing} onScanReading={setScanReading} vision={vision} visionDetail={detail}
            futureProgress={progress}
            visionPlaying={playing && !detail} visionStep={visionStep} onVisionStep={setVisionStep}
            progress={0.86} freeOrbit={inspect} onInteract={interact}
            zoom={zoom} turn={turn} autoRotate={autoRotate && !reduced}
          />
        </div>
        {scanner && <RangeScanReadout reading={scanReading} playing={playing} reduced={reduced} detail={detail} onPlay={() => setPlaying((value) => !value)} />}
        {vision && (detail ? (
          <aside className="vision-readout camera-readout">
            <div className="vision-readout-heading"><Camera size={15} /><span>THE NEW PERSPECTIVE</span></div>
            <h3>DJI O4 Air Unit Pro</h3>
            <p>A compact camera on a raised mount, directly above the ultrasonic distance sensor.</p>
            <div className="camera-feature"><span>01</span> Wide glass lens</div>
            <div className="camera-feature"><span>02</span> Adjustable side mounts</div>
            <div className="camera-feature"><span>03</span> Rear camera cable</div>
            <small>Camera concept modelled from reference photographs.</small>
          </aside>
        ) : (
          <aside className="vision-readout" aria-label="Illustrative vision-language model analysis">
            <div className="vision-readout-heading"><ScanLine size={15} /><span>SCENE UNDERSTANDING</span><span className="concept-tag">CONCEPT</span></div>
            <div className="vision-pipeline" aria-label="Camera image, vision-language model, scene meaning"><span>Camera</span><span>→</span><strong>VLM</strong><span>→</span><span>Meaning</span></div>
            <div className="vision-result" key={visionStep}>
              <span className="vision-result-kind">{subject ? `0${visionStep + 1} / ${subject.kind}` : "04 / Scene understood"}</span>
              <h3>{subject ? subject.name === "Tree" ? "A living boundary." : subject.name === "Person" ? "Someone ahead." : "A way around." : "Context, then motion."}</h3>
              <p>{subject?.meaning ?? "Trees frame the path. A person has priority. Obstacles need a wider route. Each image adds context to the next move."}</p>
              <div className="vision-action"><ArrowUpRight size={15} /><span>{subject?.action ?? "Choose a clear, considerate route"}</span></div>
            </div>
            <div className="vision-playback"><span>{reduced ? "Static overview" : playing ? "Analysing the scene" : "Analysis paused"}</span><button type="button" disabled={reduced} aria-label={playing ? "Pause scene analysis" : "Play scene analysis"} onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? "Pause" : "Play"}</button></div>
          </aside>
        ))}
        <ModelControls
          view={view} onView={(nextView) => { setView(nextView); setResetKey((value) => value + 1); }}
          explode={explode} onExplode={setManual} assemblyControls={expanded}
          labels={labels} onLabels={() => setLabels((value) => !value)} onReset={reset}
          inspect={inspect} onInspect={() => { setInspect((value) => !value); setAutoRotate(false); }}
          zoom={zoom} onZoom={setZoom} onTurn={(direction) => { setTurn((value) => value + direction); setAutoRotate(false); }}
          chapter={-1} motion={motion} setMotion={setMotion} autoRotate={autoRotate}
          onAutoRotate={() => setAutoRotate((value) => !value)}
        />
        <footer id="future-chapter-controls" className="chapter-footer" tabIndex={-1}>
          <p className="chapter-note">{story.note}</p>
          <nav className="chapter-track" aria-label="Future Work chapters">
            {futureChapters.map((item, index) => <button type="button" key={item.label} onClick={() => goTo(index)} aria-current={chapter === index ? "step" : undefined} aria-label={item.label} title={item.label}><span /></button>)}
          </nav>
          <button type="button" className="screen-counter" onClick={() => goTo(vision ? 0 : chapter + 1)} aria-label={vision ? "Restart the journey" : `Next: ${futureChapters[chapter + 1]?.label}`}><span>{vision ? "BACK TO TOP" : inspect ? "KEEP EXPLORING" : "ON SCREEN"}</span><i /><span>0{chapter + 1}<span className="counter-total"> / 03</span></span>{vision ? <ArrowUp size={13} /> : <ArrowDown size={13} />}</button>
          <div className="journey-progress" style={{ transform: `scaleX(${progress})` }} />
        </footer>
      </section>
  );
}
