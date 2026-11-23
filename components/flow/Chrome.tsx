"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useStore } from "@/lib/store";
import { OrderFlow } from "./OrderFlow";
import { Tray } from "./Tray";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scroll, entrances, the order conversation, the tray and the announcer. */
export function Overlay() {
  const path = usePathname();
  const say = useStore((s) => s.say);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const root = document.documentElement;
      const seen = new MutationObserver(() => (root.classList.contains("is-locked") ? lenis.stop() : lenis.start()));
      seen.observe(root, { attributes: true, attributeFilter: ["class"] });
      return () => {
        seen.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => mm.revert();
  }, []);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => document.querySelectorAll<HTMLVideoElement>("video[autoplay]").forEach((v) => { v.autoplay = false; v.pause(); }));
    const id = requestAnimationFrame(() =>
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const all = (q: string) => gsap.utils.toArray<HTMLElement>(q).filter((el) => el.getBoundingClientRect().top > innerHeight * 0.92);
        all("[data-rise]").forEach((el) => gsap.from(el, { y: 44, opacity: 0, duration: 1.2, ease: "expo.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
        all("[data-iris]").forEach((el) => gsap.from(el, { clipPath: "circle(0% at 50% 50%)", duration: 1.5, ease: "expo.inOut", clearProps: "clipPath", scrollTrigger: { trigger: el, start: "top 85%", once: true } }));
        ScrollTrigger.refresh();
      }),
    );
    return () => {
      cancelAnimationFrame(id);
      mm.revert();
    };
  }, [path]);
  return (
    <>
      <OrderFlow />
      <Tray />
      <div className="sr" role="status" aria-live="polite">{say}</div>
    </>
  );
}
