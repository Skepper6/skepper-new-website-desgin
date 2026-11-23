"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** The studio’s own film, seen only through the letters. Scrolling walks through them into the film. */
export function FilmWords({ words, children, level = 1 }: { words: string; children?: React.ReactNode; level?: 1 | 2 }) {
  const root = useRef<HTMLElement>(null);
  const H = level === 1 ? "h1" : "h2";
  useEffect(() => {
    const v = root.current!.querySelector("video")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (still) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5 } })
        .to(".fw-words", { scale: 26, ease: "power2.in", duration: 1 }, 0)
        .to(".fw-under", { autoAlpha: 0, duration: 0.14 }, 0)
        .to(".fw-sheet", { opacity: 0, duration: 0.16 }, 0.76);
    });
    return () => {
      io.disconnect();
      mm.revert();
    };
  }, []);
  return (
    <section ref={root} className="fw">
      <div className="fw-stage">
        <video src="/film/studio.mp4" poster="/film/studio.webp" muted loop playsInline preload="metadata" aria-label="Skepper crew on a film shoot" />
        <div className="fw-sheet"><H className="fw-words">{words}</H></div>
        <div className="fw-under">{children}</div>
      </div>
    </section>
  );
}
