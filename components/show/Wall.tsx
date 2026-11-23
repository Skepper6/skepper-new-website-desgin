"use client";
import { useState } from "react";
import { WORK, WORK_KINDS, type WorkKind } from "@/lib/content";

/** Every project on one wall, with a filter. */
export function Wall({ title = "All the work" }: { title?: string }) {
  const [kind, setKind] = useState<WorkKind | "All">("All");
  const list = WORK.filter((w) => kind === "All" || w.kind === kind);
  return (
    <section className="wall" aria-labelledby="wall-h">
      <div className="split-head">
        <h2 id="wall-h">{title}</h2>
        <div className="seg" role="group" aria-label="Filter work">
          {(["All", ...WORK_KINDS] as const).map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
        </div>
      </div>
      <p className="sr" role="status">{list.length} projects</p>
      <ul key={kind}>
        {list.map((w) => (
          <li key={w.id}><figure><img src={`/work/${w.id}.webp`} alt={w.alt} width={820} height={840} loading="lazy" /><figcaption><b>{w.client}</b>{w.what}</figcaption></figure></li>
        ))}
      </ul>
    </section>
  );
}
