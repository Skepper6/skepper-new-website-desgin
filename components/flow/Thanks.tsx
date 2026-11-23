"use client";
import { useEffect, useState } from "react";
import { cat, svc } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import type { ShardId } from "@/lib/mark";
import { SLink } from "@/lib/site";
import { useStore } from "@/lib/store";
import { Mark } from "../Mark";

export function Thanks() {
  const ready = useStore((s) => s.ready);
  const o = useStore((s) => s.lastOrder);
  const projects = useStore((s) => s.projects);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 350);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return <div className="centre"><h1>Your order</h1><p role="status">Loading your order</p></div>;
  if (!o)
    return (
      <div className="centre">
        <h1>No recent order</h1>
        <p className="t-lead">Orders you place in this browser show up in your projects.</p>
        <SLink className="cta" href="/projects/">Go to My Projects</SLink>
      </div>
    );
  const lit = new Set<ShardId>(
    projects
      .filter((p) => o.ids.includes(p.id))
      .flatMap((p) => {
        const s = svc(p.sid);
        return s ? [cat(s.cat).shard] : [];
      }),
  );
  return (
    <div className="centre">
      <Mark lit={on ? lit : new Set<ShardId>()} className="centre-mark" />
      <h1>Your order is brewing</h1>
      <p className="t-lead">{o.paid ? `${fmt(o.paid)} received.` : "No payment needed."} A GST invoice and portal link go to {o.email}. Next step: share your brief so the studio can start.</p>
      <p>{o.paid ? "Paid" : "Booked"}, <b className="num">{o.orderId}</b></p>
      <div className="talk-go">
        <SLink className="cta" href={o.ids[0] ? `/projects/?id=${o.ids[0]}` : "/projects/"}>Share your brief</SLink>
        <SLink className="link" href="/services/">Keep browsing</SLink>
      </div>
    </div>
  );
}
