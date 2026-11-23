"use client";
import { useEffect, useRef, useState } from "react";
import { CATS, type CategoryId } from "@/lib/catalogue";
import type { GlassScene } from "@/lib/glassScene";
import { TINT } from "@/lib/theme";
import { ShardShape } from "../Mark";

const glass = typeof window === "undefined" ? null : import("@/lib/glassScene");

/** One giant piece of glass standing in a room flooded with its own light. */
export function GlassPiece({ dept, x = 69, y = 50, size = 1.05 }: { dept: CategoryId; x?: number; y?: number; size?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [flat, setFlat] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let g: GlassScene | null = null;
    let io: IntersectionObserver | null = null;
    const layout = () => {
      const r = innerWidth / innerHeight;
      const wide = innerWidth > 800;
      g?.setLayout({ mark: { x, y, size: 0.8 }, focus: wide ? { x, y, size: Math.min(size, r * 0.6) } : { x: 62, y: 30, size: 0.5 }, flow: "x" });
    };
    (async () => {
      const mod = await glass!;
      if (dead || !canvas.current) return;
      try {
        g = mod.createGlassScene(canvas.current);
      } catch {
        setFlat(true);
        return;
      }
      g.state.intro = 1;
      g.state.travel = 1;
      g.state.step = CATS.findIndex((c) => c.id === dept);
      g.setRoom(...TINT[dept]);
      layout();
      addEventListener("resize", layout);
      io = new IntersectionObserver(([e]) => g?.setActive(e.isIntersecting));
      io.observe(canvas.current);
      await g.ready;
      if (!dead) setLive(true);
    })();
    return () => {
      dead = true;
      removeEventListener("resize", layout);
      io?.disconnect();
      g?.dispose();
    };
  }, [dept, x, y, size]);
  return (
    <div className="glass-piece" data-live={live} data-flat={flat} aria-hidden="true">
      <canvas ref={canvas} />
      <ShardShape id={CATS.find((c) => c.id === dept)!.shard} />
    </div>
  );
}
