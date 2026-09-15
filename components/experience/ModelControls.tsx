"use client";

import {
  ArrowUpRight,
  Box,
  ChevronLeft,
  ChevronRight,
  Layers,
  Minus,
  MoveHorizontal,
  MoveRight,
  Plus,
  RotateCcw,
  RotateCw,
  Square,
  Tags,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { View } from "@/components/car/CarScene";
import type { Motion } from "./StoryPanel";

type ModelControlsProps = {
  view: View;
  onView: (view: View) => void;
  explode: number;
  onExplode: (value: number) => void;
  labels: boolean;
  onLabels: () => void;
  onReset: () => void;
  inspect: boolean;
  onInspect: () => void;
  zoom: number;
  onZoom: (value: number) => void;
  onTurn: (direction: number) => void;
  chapter: number;
  motion: Motion;
  setMotion: (motion: Motion) => void;
  autoRotate: boolean;
  onAutoRotate: () => void;
  assemblyControls?: boolean;
};

export function ModelControls({
  view,
  onView,
  explode,
  onExplode,
  labels,
  onLabels,
  onReset,
  inspect,
  onInspect,
  zoom,
  onZoom,
  onTurn,
  chapter,
  motion,
  setMotion,
  autoRotate,
  onAutoRotate,
  assemblyControls = true,
}: ModelControlsProps) {
  return (
    <>
      <div className={`orbit-console ${inspect ? "is-inspecting" : ""}`}>
        <div className="orbit-main">
          <button
            className="orbit-mode"
            onClick={onInspect}
            aria-expanded={inspect}
            aria-controls="inspection-controls"
          >
            <MoveHorizontal size={15} />
            {inspect ? "Free orbit" : "Drag to rotate"}
            <span>360°</span>
          </button>
          <div className="orbit-extras" aria-hidden={!inspect}>
            <button aria-label="Rotate car left" title="Rotate left" tabIndex={inspect ? 0 : -1} onClick={() => onTurn(-1)}><ChevronLeft size={18} /></button>
            <button aria-label="Rotate car right" title="Rotate right" tabIndex={inspect ? 0 : -1} onClick={() => onTurn(1)}><ChevronRight size={18} /></button>
            <span className="control-divider" />
            <button aria-label="Zoom out" title="Zoom out" tabIndex={inspect ? 0 : -1} disabled={!inspect || zoom <= 0.7} onClick={() => onZoom(Math.max(0.7, zoom - 0.15))}><Minus size={17} /></button>
            <button aria-label="Zoom in" title="Zoom in" tabIndex={inspect ? 0 : -1} disabled={!inspect || zoom >= 1.75} onClick={() => onZoom(Math.min(1.75, zoom + 0.15))}><Plus size={17} /></button>
            <button aria-label="Auto rotate car" title="Auto rotate" tabIndex={inspect ? 0 : -1} aria-pressed={autoRotate} onClick={onAutoRotate}><RotateCw size={17} /></button>
          </div>
        </div>

        <div id="inspection-controls" className="inspection-reveal" aria-hidden={!inspect}>
          <div className="inspection-options">
            <Select value={view} onValueChange={(value) => onView(value as View)}>
              <SelectTrigger aria-label="Camera view" className="view-select" tabIndex={inspect ? 0 : -1}><SelectValue /></SelectTrigger>
              <SelectContent className="view-menu" position="popper">
                <SelectItem value="perspective">Perspective</SelectItem>
                <SelectItem value="top">Top view</SelectItem>
                <SelectItem value="side">Side view</SelectItem>
                <SelectItem value="rear">Rear view</SelectItem>
              </SelectContent>
            </Select>
            <span className="control-divider" />
            {assemblyControls && <button aria-label={explode > 0.2 ? "Reassemble the car" : "Take the car apart"} title={explode > 0.2 ? "Reassemble" : "Explode"} tabIndex={inspect ? 0 : -1} aria-pressed={explode > 0.2} onClick={() => onExplode(explode > 0.2 ? 0 : 1)}>{explode > 0.2 ? <Layers size={17} /> : <Box size={17} />}</button>}
            <button aria-label={labels ? "Show chapter labels" : "Show all component labels"} title={labels ? "Chapter labels" : "All labels"} tabIndex={inspect ? 0 : -1} aria-pressed={labels} onClick={onLabels}><Tags size={17} /></button>
            <button aria-label="Reset camera and assembly" title="Reset view" tabIndex={inspect ? 0 : -1} onClick={onReset}><RotateCcw size={17} /></button>
            {assemblyControls && <><Slider min={0} max={100} step={1} value={[Math.round(explode * 100)]} onValueChange={(value) => onExplode(value[0] / 100)} aria-label="Exploded view amount" className="assembly-slider" disabled={!inspect} />
            <span className="assembly-label">{Math.round(explode * 100)}%</span></>}
          </div>
        </div>
      </div>

      {chapter === 9 && (
        <div className="motion-controls">
          <span>TRY A DIRECTION</span>
          <div>
            {(["forward", "strafe", "rotate"] as const).map((option) => (
              <button key={option} aria-pressed={motion === option} onClick={() => setMotion(motion === option ? "stopped" : option)}>
                {option === "forward" ? <ArrowUpRight size={15} /> : option === "strafe" ? <MoveRight size={15} /> : <RotateCw size={15} />}
                <span>{option === "forward" ? "Forward" : option === "strafe" ? "Sideways" : "Rotate"}</span>
              </button>
            ))}
            <button aria-label="Stop wheel motion" title="Stop" aria-pressed={motion === "stopped"} onClick={() => setMotion("stopped")}><Square size={13} /><span>Stop</span></button>
          </div>
        </div>
      )}
    </>
  );
}
