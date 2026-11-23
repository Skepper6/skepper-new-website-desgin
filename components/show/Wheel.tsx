"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORK, WORK_KINDS, type WorkKind } from "@/lib/content";
import { SLink } from "@/lib/site";
import { Icon } from "../Icon";

gsap.registerPlugin(ScrollTrigger);

/** The work rides on the rim of a wheel larger than the screen. Scrolling turns it. */
export function Wheel({ limit, title, filter = false, level = 2 }: { limit?: number; title: React.ReactNode; filter?: boolean; level?: 1 | 2 }) {
  const root = useRef<HTMLElement>(null);
  const [kind, setKind] = useState<WorkKind | "All">("All");
  const [at, setAt] = useState(0);
  const list = WORK.filter((w) => kind === "All" || w.kind === kind).slice(0, limit);
  const H = level === 1 ? "h1" : "h2";
  const n = list.length;
  const gap = 15;
  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (s) => {
          el.style.setProperty("--turn", `${-s.progress * (n - 1) * gap}deg`);
          setAt(Math.round(s.progress * (n - 1)));
        },
      });
      ScrollTrigger.refresh();
      return () => {
        st.kill();
      };
    });
    return () => mm.revert();
  }, [n]);
  const w = list[Math.min(at, n - 1)];
  // A full rim has no ends: the last two come round before the first, and the first two after the last.
  const ends = n >= 6 ? [-2, -1, n, n + 1] : [];
  return (
    <section ref={root} className="wheel" style={{ ["--n" as string]: n }} aria-labelledby="wheel-h">
      <div className="wheel-stage">
        <div className="wheel-head">
          <H id="wheel-h">{title}</H>
          {filter ? (
            <div className="two" role="group" aria-label="Filter work">
              {(["All", ...WORK_KINDS] as const).map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setAt(0); }}>{k}</button>)}
            </div>
          ) : level === 2 ? (
            <SLink className="pill" href="/work/">See all {WORK.length} projects <Icon name="arrow" /></SLink>
          ) : null}
        </div>
        <ul>
          {list.map((x, i) => (
            <li key={x.id} style={{ ["--r" as string]: `${i * gap}deg` }} data-on={i === at}>
              <figure><img src={`/work/${x.id}.webp`} alt={x.alt} width={820} height={840} loading={i < 4 ? "eager" : "lazy"} /><figcaption><b>{x.client}</b> {x.what}</figcaption></figure>
            </li>
          ))}
          {ends.map((i) => (
            <li key={i} className="wheel-end" aria-hidden="true" style={{ ["--r" as string]: `${i * gap}deg` }}><figure><img src={`/work/${list[(i + n) % n].id}.webp`} alt="" width={820} height={840} loading="lazy" /></figure></li>
          ))}
        </ul>
        <p className="wheel-cap" aria-hidden="true"><b>{w?.client}</b> {w?.what}</p>
      </div>
    </section>
  );
}
