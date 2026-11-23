"use client";
import { useState } from "react";
import { CATS, cat, countIn, isOneTime, priceText, ROUNDS, SERVICES, timeText, type CategoryId } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import { shard } from "@/lib/mark";
import { deptPic } from "@/lib/pics";
import { SLink } from "@/lib/site";
import { actions } from "@/lib/store";
import { ShardShape } from "../Mark";
import { Ring } from "./Ring";

/** Turn the round mark to choose a department. */
export function DeptDial() {
  const [i, setI] = useState(0);
  const c = CATS[i];
  const pic = deptPic(c.id);
  return (
    <section className="turner" style={{ ["--c" as string]: shard(c.shard).color }} aria-labelledby="dd-h">
      <Ring items={CATS.map((x) => ({ id: x.id, label: x.short }))} value={i} onChange={setI} label="Departments">
        <figure className="eye" key={c.id}><img src={pic.src} alt="" width={820} height={840} /></figure>
      </Ring>
      <div className="dial-side" key={c.id} aria-live="polite">
        <ShardShape id={c.shard} className="dial-piece" />
        <h2 id="dd-h">{c.name}</h2>
        <p className="t-lead">{c.blurb}</p>
        <div className="dial-words">
          {SERVICES.filter((x) => x.cat === c.id).map((x) => (
            <button key={x.id} type="button" onClick={() => actions.configure(x.id)}>{x.name}<sup>{x.unit === "free" ? "Free" : x.unit === "quote" ? "On quote" : fmt(x.price)}</sup></button>
          ))}
        </div>
        <SLink className="link" href={`/room/${c.id}/`}>Turn through all {countIn(c.id)}</SLink>
      </div>
    </section>
  );
}

/** Inside a department the same dial carries its services. */
export function ServiceDial({ dept }: { dept: CategoryId }) {
  const list = SERVICES.filter((x) => x.cat === dept);
  const [i, setI] = useState(0);
  const s = list[i];
  const c = cat(dept);
  const pic = deptPic(dept);
  return (
    <section className="turner turner-in" style={{ ["--c" as string]: shard(c.shard).color }} aria-labelledby="sd-h">
      <Ring items={list.map((x) => ({ id: x.id, label: x.name }))} value={i} onChange={setI} label={`${c.name} services`}>
        <figure className="eye"><img src={pic.src} alt={pic.alt} width={820} height={840} /></figure>
      </Ring>
      <div className="dial-side" key={s.id} aria-live="polite">
        <ShardShape id={c.shard} className="dial-piece" />
        <h2 id="sd-h">{s.name}</h2>
        <p className="t-lead">{s.desc}</p>
        <p className="dial-price num">{priceText(s)}</p>
        <p>{[s.tag, timeText(s), isOneTime(s) ? `${ROUNDS} correction rounds` : null].filter(Boolean).join(", ")}</p>
        <div className="talk-go">
          <button type="button" className="cta" onClick={() => actions.configure(s.id)}>Set it up</button>
          <SLink className="link" href={`/service/${s.id}/`}>Read more</SLink>
        </div>
      </div>
    </section>
  );
}
