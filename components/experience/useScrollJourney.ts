"use client";
import { useCallback,useEffect,useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from './chapters';
export function useScrollJourney(journeyChapters:readonly {at:number}[]=chapters){
 const [progress,setProgress]=useState(0);const[reduced,setReduced]=useState(false);const[manual,setManual]=useState<number|null>(null);
 useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const media=window.matchMedia('(prefers-reduced-motion: reduce)');const preference=()=>setReduced(media.matches);preference();media.addEventListener('change',preference);return()=>media.removeEventListener('change',preference);},[]);
 useEffect(()=>{const proxy={value:0};const ctx=gsap.context(()=>{gsap.to(proxy,{value:1,ease:'none',onUpdate:()=>setProgress(proxy.value),scrollTrigger:{trigger:'.scroll-journey',start:'top top',end:'bottom bottom',scrub:reduced?true:.65,invalidateOnRefresh:true}});});const resume=()=>setManual(null);window.addEventListener('scroll',resume,{passive:true});ScrollTrigger.refresh();return()=>{ctx.revert();window.removeEventListener('scroll',resume);};},[reduced]);
 const goTo=useCallback((index:number)=>{setManual(null);window.scrollTo({top:journeyChapters[index].at*(document.documentElement.scrollHeight-window.innerHeight),behavior:reduced?'instant':'smooth'});},[reduced,journeyChapters]);
 return {progress,reduced,manual,setManual,goTo};
}
