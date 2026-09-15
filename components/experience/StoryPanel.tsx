"use client";
import { useEffect,useRef } from 'react';
import gsap from 'gsap';
import { chapters, type StoryChapter } from './chapters';
export type Motion='stopped'|'forward'|'strafe'|'rotate';
export function StoryPanel({chapter,progress,reduced,story}:{chapter:number;progress:number;reduced:boolean;story?:StoryChapter}){const ref=useRef<HTMLDivElement>(null);const item=story??chapters[chapter];const bookend=chapter===0||chapter===9;
 useEffect(()=>{if(reduced)return;const ctx=gsap.context(()=>{gsap.fromTo('.title-line span',{yPercent:110,rotate:2},{yPercent:0,rotate:0,duration:.9,stagger:.09,ease:'power3.out'});},ref);return()=>ctx.revert();},[chapter,reduced]);
 return <div ref={ref} className={`story-panel ${bookend?'story-bookend':''}`} key={chapter}>{bookend?<h1 className="split-headline"><span className="title-line split-left"><span>{item.title}</span></span><span className="title-line split-right"><span>{item.accent}</span></span></h1>:<h2 className="chapter-title"><span className="title-line"><span>{item.title}</span></span><span className="title-line"><span>{item.accent}</span></span></h2>}{item.mark&&<div className={`backdrop-word ${chapter===2?'backdrop-lime':''} ${item.mark.length>6?'backdrop-wide':''}`} aria-hidden="true" style={{transform:`translate(-50%, -50%) translateY(${(progress-chapter/10)*-140}px)`}}>{item.mark}</div>}</div>}
