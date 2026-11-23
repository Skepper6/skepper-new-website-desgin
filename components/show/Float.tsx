"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** left, start (screens below), width, depth. Everything keeps to the two sides of the sentence. */
const PICS: [string, number, number, number, number][] = [
  ["sitagliptin", -3, 0.1, 21, 1],
  ["viagra", 82, 0.2, 18, 1.35],
  ["cb12", 3, 0.72, 13, 1.7],
  ["land-optimizer", 84, 0.86, 20, 1],
  ["umc", -4, 1.16, 18, 1.3],
  ["saugella", 83, 1.44, 14, 1.7],
  ["omez-dsr", 2, 1.64, 17, 1.1],
  ["plantaben-time", 88, 0.5, 13, 1.1],
  ["cicaderm", 7, 0.42, 11, 1.2],
  ["hiv-self-test", 6, 1.36, 12, 1.5],
  ["duphalac", 85, 1.2, 12, 1.05],
  ["reparil", 1, 2.1, 20, 1.2],
  ["lalumar", 82, 1.94, 22, 1.2],
];
const W = ({ children }: { children: string }) => (
  <>
    {children.split(" ").map((w, i) => <span key={i} className="wd">{w} </span>)}
  </>
);

/** What the studio believes, read slowly while its work floats past. */
export function Float() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    const el = root.current!;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = { trigger: el, start: "top 70%", end: "bottom bottom", scrub: 0.6 };
      gsap.fromTo(el.querySelectorAll(".wd"), { opacity: 0.14 }, { opacity: 1, stagger: 0.12, ease: "none", scrollTrigger: st });
      gsap.from(el.querySelectorAll(".cap"), { scaleX: 0, transformOrigin: "0% 50%", stagger: 0.4, ease: "power2.out", scrollTrigger: st });
    });
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>(".float-pic", el).forEach((p) => {
        const d = Number(p.dataset.depth), s = Number(p.dataset.from);
        gsap.fromTo(p, { y: () => innerHeight * (0.75 + s * d) }, { y: () => -innerHeight * (2.7 - s) * d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.4, invalidateOnRefresh: true } });
      });
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={root} className="float" aria-labelledby="float-h">
      <div className="float-stage">
        {PICS.map(([id, left, from, w, depth]) => (
          <img key={id} className="float-pic" data-depth={depth} data-from={from} src={`/work/${id}.webp`} alt="" width={820} height={840} loading="lazy" style={{ ["--l" as string]: left + "%", ["--w" as string]: w + "vw" }} />
        ))}
        <p id="float-h" className="float-say">
          <W>Skepper isn’t an agency. It’s a</W>
          <b><W>studio,</W></b>
          <span className="cap"><video src="/film/studio.mp4" poster="/film/studio.webp" muted loop autoPlay playsInline preload="none" aria-hidden="true" tabIndex={-1} /></span>{" "}
          <W>built to go</W>
          <b><W>deep,</W></b>
          <W>not wide. Every project gets</W>
          <span className="cap cap-s"><img src="/work/cerbigem.webp" alt="" width={820} height={840} loading="lazy" /></span>{" "}
          <b><W>full attention,</W></b>
          <W>because design isn’t decoration. It’s</W>
          <span className="cap cap-s"><img src="/work/healthium.webp" alt="" width={820} height={840} loading="lazy" /></span>{" "}
          <b><W>direction.</W></b>
        </p>
      </div>
    </section>
  );
}
