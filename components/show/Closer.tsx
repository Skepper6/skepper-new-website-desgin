"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { actions } from "@/lib/store";
import { Icon } from "../Icon";

gsap.registerPlugin(ScrollTrigger);

/** The studio, filmed through the pieces of its own mark. */
export function Closer({ title = <>Not sure what your <b>brand needs first?</b></> }: { title?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(root.current!.querySelector(".closer-mark"), { scale: 0.72, rotate: -14 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: 0.6 } });
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={root} className="closer" aria-labelledby="closer-h">
      <div className="closer-in">
        <div className="closer-say">
          <h2 id="closer-h">{title}</h2>
          <p>Start with the free Brand Quick Assessment. Three priorities, one 20-minute call.</p>
          <button type="button" className="cta cta-arrow" onClick={() => actions.configure("bqa")}>Book it free <i><Icon name="arrow" /></i></button>
        </div>
        <div className="closer-mark"><video src="/film/studio.mp4" poster="/film/studio.webp" muted loop autoPlay playsInline preload="none" aria-hidden="true" tabIndex={-1} /></div>
      </div>
    </section>
  );
}
