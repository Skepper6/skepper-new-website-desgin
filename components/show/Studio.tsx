"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES } from "@/lib/catalogue";
import { SLink } from "@/lib/site";
import { Icon } from "../Icon";

gsap.registerPlugin(ScrollTrigger);

export function Count({ to, tail = "" }: { to: number; tail?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const v = { n: 0 };
      gsap.to(v, { n: to, duration: 1.8, ease: "power3.out", onUpdate: () => { if (el.current) el.current.textContent = Math.round(v.n) + tail; }, scrollTrigger: { trigger: el.current, start: "top 92%", once: true } });
    });
    return () => mm.revert();
  }, [to, tail]);
  return <span ref={el} className="num">{to}{tail}</span>;
}

/** The intro film, waiting as a picture until somebody asks for it. */
export function Film({ className = "" }: { className?: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  return (
    <div className={"reel " + className} data-on={on}>
      <video ref={v} src="/film/intro.mp4" poster="/film/intro.webp" controls={on} preload="none" playsInline aria-label="Binoy introduces Skepper, 48 seconds" onEnded={() => setOn(false)} />
      {on ? null : (
        <button type="button" onClick={() => { setOn(true); v.current?.play(); }}><i><Icon name="play" size={30} /></i><span>Hear it from him, 48 seconds</span></button>
      )}
    </div>
  );
}

export function Studio() {
  return (
    <section className="stu" aria-labelledby="stu-h">
      <div className="stu-grid">
        <div className="stu-face"><img src="/brand/binoy.webp" alt="Binoy, founder of Skepper, with a mug in hand" width={1400} height={1750} loading="lazy" /></div>
        <div className="stu-say">
          <h2 id="stu-h">Led by Binoy, <b>not a committee</b></h2>
          <p>With two decades of experience, Binoy started Skepper in 2013. The studio brings branding, design and film together, with a hybrid human-AI workflow.</p>
          <SLink className="pill" href="/about/">Read why he built it <Icon name="arrow" /></SLink>
        </div>
        <div className="stu-n stu-n1"><b><Count to={49} /></b><span>awards, 28 of them at the Rx Club Show</span></div>
        <Film className="stu-film" />
        <div className="stu-n stu-n2"><b><Count to={20} tail="+" /></b><span>years of branding, design and film</span></div>
        <div className="stu-n stu-n3"><b><Count to={SERVICES.length} /></b><span>services you can order online</span></div>
        <div className="stu-n stu-n4"><b><Count to={3} /> days</b><span>the fastest we can deliver</span></div>
        <div className="stu-loop"><video src="/film/studio.mp4" poster="/film/studio.webp" muted loop autoPlay playsInline preload="none" aria-hidden="true" tabIndex={-1} /></div>
      </div>
    </section>
  );
}
