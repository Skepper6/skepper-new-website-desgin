"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export type Spoke = { id: string; label: string };

/** A wheel you turn by dragging, clicking or with the arrow keys. What faces right is chosen. */
export function Ring({ items, value, onChange, label, children }: { items: Spoke[]; value: number; onChange: (i: number) => void; label: string; children?: React.ReactNode }) {
  const ring = useRef<HTMLDivElement>(null);
  const turn = useRef({ a: -value * (360 / items.length), to: -value * (360 / items.length) });
  const N = items.length;
  const step = 360 / N;
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });
  const paint = () => ring.current?.style.setProperty("--a", turn.current.a + "deg");

  // Face the chosen spoke by the shortest way round.
  useEffect(() => {
    const t = turn.current;
    const want = -value * step;
    t.to = want + Math.round((t.to - want) / 360) * 360;
    const tw = gsap.to(t, { a: t.to, duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1.2, ease: "expo.out", onUpdate: paint });
    return () => {
      tw.kill();
    };
  }, [value, step]);

  useEffect(() => {
    const el = ring.current!;
    let start: { ang: number; from: number; moved: boolean } | null = null;
    const angle = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180) / Math.PI;
    };
    const nearest = () => ((Math.round(-turn.current.a / step) % N) + N) % N;
    const down = (e: PointerEvent) => {
      start = { ang: angle(e), from: turn.current.a, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      const d = ((((angle(e) - start.ang + 180) % 360) + 360) % 360) - 180;
      if (Math.abs(d) < 2.5 && !start.moved) return;
      start.moved = true;
      gsap.killTweensOf(turn.current);
      turn.current.a = turn.current.to = start.from + d;
      paint();
      cb.current(nearest());
    };
    const up = () => {
      if (!start) return;
      const was = start.moved;
      start = null;
      if (!was) return;
      const i = nearest();
      turn.current.to = -i * step + Math.round((turn.current.a + i * step) / 360) * 360;
      gsap.to(turn.current, { a: turn.current.to, duration: 0.8, ease: "expo.out", onUpdate: paint });
      cb.current(i);
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
  }, [N, step]);

  return (
    <div className="ring-wrap">
      <div
        ref={ring}
        className="ring"
        role="group"
        aria-label={label}
        style={{ ["--a" as string]: `${-value * step}deg` }}
        onKeyDown={(e) => {
          const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          onChange((value + d + N) % N);
        }}
      >
        {items.map((x, i) => (
          <button key={x.id} type="button" className="spoke" style={{ ["--i" as string]: `${i * step}deg` }} aria-pressed={i === value} onClick={() => onChange(i)}>
            <span>{x.label}</span>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
