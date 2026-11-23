"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATS, countIn, priceText, SERVICES } from "@/lib/catalogue";
import type { GlassScene, Layout } from "@/lib/glassScene";
import { deptPic } from "@/lib/pics";
import { SLink } from "@/lib/site";
import { actions } from "@/lib/store";
import { TINT, tint } from "@/lib/theme";
import { Icon } from "../Icon";
import { Mark, ShardShape } from "../Mark";

gsap.registerPlugin(ScrollTrigger);
// Start fetching the glass as soon as this file runs, not after the page has mounted.
const glass = typeof window === "undefined" ? null : import("@/lib/glassScene");

/** The hall, then nine rooms side by side. Scrolling down walks you sideways through the light. */
export function Walk() {
  const root = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [room, setRoom] = useState(-1);
  const [live, setLive] = useState(false);
  const [flat, setFlat] = useState(false);
  const [staged, setStaged] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let cleanup = () => {};
    (async () => {
      const mod = await glass!;
      if (dead || !canvas.current) return;
      setStaged(true);
      let g: GlassScene;
      try {
        g = mod.createGlassScene(canvas.current);
      } catch {
        setStaged(false);
        setFlat(true); // no WebGL: show the plain page
        return;
      }
      const layout = () => {
        const wide = innerWidth > 800;
        const r = innerWidth / innerHeight;
        const l: Layout = wide
          ? { mark: { x: 66, y: 50, size: Math.min(0.86, r * 0.5) }, focus: { x: 69, y: 50, size: Math.min(1.12, r * 0.62) }, flow: "x" }
          : { mark: { x: 50, y: 34, size: Math.min(0.56, r * 0.98) }, focus: { x: 60, y: 30, size: 0.5 }, flow: "x" };
        g.setLayout(l);
      };
      layout();
      addEventListener("resize", layout);
      const tints = [TINT.hall, ...CATS.map((c) => TINT[c.id])];
      let last = -2;
      const el = root.current!;
      // Reloading halfway down opens in that room, not back in the hall.
      const st = { pos: Math.max(0, Math.min(CATS.length, ((scrollY - el.offsetTop) / Math.max(1, el.offsetHeight - innerHeight)) * CATS.length)) };
      g.state.intro = 1;
      const apply = () => {
        const i = Math.max(0, Math.min(tints.length - 2, Math.floor(st.pos)));
        const t = Math.max(0, Math.min(1, st.pos - i));
        const e = t * t * (3 - 2 * t);
        const c = tints[i].map((v, k) => v + (tints[i + 1][k] - v) * e) as [number, number, number];
        g.setRoom(...c);
        floor.current!.style.backgroundColor = `rgb(${c.map(Math.round).join()})`;
        g.state.travel = Math.min(1, st.pos);
        g.state.step = Math.max(0, st.pos - 1);
        const n = Math.round(st.pos) - 1;
        if (n !== last) {
          last = n;
          setRoom(n);
        }
      };
      apply();
      await g.ready;
      if (dead) return g.dispose();
      setLive(true);
      const to = gsap.quickTo(st, "pos", { duration: 1, ease: "power3.out", onUpdate: apply });
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          snap: { snapTo: 1 / CATS.length, duration: { min: 0.3, max: 0.8 }, ease: "power2.inOut", delay: 0.15 },
          onUpdate: (t) => to(t.progress * CATS.length),
          onToggle: (t) => g.setActive(t.isActive),
        });
      });
      ScrollTrigger.refresh();
      cleanup = () => {
        removeEventListener("resize", layout);
        ctx.revert();
        g.dispose();
      };
    })();
    return () => {
      dead = true;
      cleanup();
    };
  }, []);

  const go = (i: number) => {
    const el = root.current!;
    scrollTo({ top: el.offsetTop + ((el.offsetHeight - innerHeight) * i) / CATS.length, behavior: "smooth" });
  };
  const c = room >= 0 ? CATS[room] : null;
  const hidden = (on: boolean) => (staged ? { "aria-hidden": !on, inert: !on } : {});

  return (
    <div ref={floor} className={"walk" + (live ? " is-live" : "") + (flat ? " is-flat" : "")}>
      <div ref={root} className="walk-run">
        <div className="walk-stage">
          {/* The glass mark at rest, photographed from the scene. It holds the exact place of the live one until that is ready. */}
          <picture className="hall-still">
            <source media="(max-width: 800px)" srcSet="/brand/mark-m.webp" />
            <img src="/brand/mark.webp" alt="" width={1600} height={1600} fetchPriority="high" />
          </picture>
          <canvas ref={canvas} className="walk-canvas" aria-hidden="true" />
          <div className="hall" data-on={room < 0}>
            <Mark className="hall-mark" />
            <h1>Brew your <b>brand</b></h1>
            <p className="t-lead">Strategy, identity, film, web and campaigns, from a founder-led studio in Bengaluru. Order online at a clear price and follow every stage.</p>
            <div className="talk-go">
              <SLink className="cta cta-arrow" href="/services/">Explore services <i><Icon name="arrow" /></i></SLink>
              <button type="button" className="pill" onClick={() => actions.configure("bqa")}>Free brand assessment</button>
            </div>
            <div className="hall-reel">
              <video src="/film/studio.mp4" poster="/film/studio.webp" muted loop autoPlay playsInline preload="none" aria-hidden="true" tabIndex={-1} />
              <p><b className="num">49</b> awards, 28 of them at the Rx Club Show</p>
            </div>
          </div>
          {CATS.map((x, i) => {
            const pic = deptPic(x.id);
            return (
              <section key={x.id} className="room" data-on={room === i} style={{ ["--tint" as string]: tint(x.id) }} {...hidden(room === i)}>
                <ShardShape id={x.shard} className="room-flat" />
                <span className="room-ghost" aria-hidden="true">{x.short}</span>
                <h2>{x.name}</h2>
                <p className="t-lead">{x.blurb}</p>
                <ul className="room-picks">
                  {SERVICES.filter((s) => s.cat === x.id).slice(0, 4).map((s) => <li key={s.id}><button type="button" onClick={() => actions.configure(s.id)}>{s.name}<span className="num">{priceText(s)}</span></button></li>)}
                </ul>
                <SLink className="cta cta-arrow" href={`/room/${x.id}/`}>See all {countIn(x.id)} services <i><Icon name="arrow" /></i></SLink>
                <figure className="lens"><img src={pic.src} alt={pic.alt} width={820} height={840} loading="lazy" /></figure>
              </section>
            );
          })}
          <div className="compass">
              <button type="button" aria-label="Back to the whole mark" onClick={() => go(0)}><Mark lit={c ? new Set([c.shard]) : undefined} /></button>
              <button type="button" className="link" onClick={() => go(Math.min(CATS.length, room + 2))}>{room < CATS.length - 1 ? `Next, ${CATS[room + 1].short}` : "The studio"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
