"use client";
import { priceText, svc } from "@/lib/catalogue";
import { svcPic } from "@/lib/pics";
import { actions } from "@/lib/store";
import { Icon } from "../Icon";

const PODS = ["pod-design", "pod-video", "pod-stationery", "pod-pharma"];

/** The four pods stand on a stage. They turn a little towards the pointer. */
export function Pods() {
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + "deg");
    e.currentTarget.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + "deg");
  };
  const rest = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <section className="pods" aria-labelledby="pods-h">
      <div className="split-head">
        <h2 id="pods-h">A studio <b>on subscription</b></h2>
        <p>A dedicated slice of the studio every month. Paid monthly in advance, cancel with 30 days’ notice.</p>
      </div>
      <ul className="pods-row">
        {PODS.map((id) => {
          const s = svc(id)!;
          return (
            <li key={id} data-rise>
              <article onPointerMove={tilt} onPointerLeave={rest}>
                <div className="pods-pic"><img src={svcPic(id)} alt="" width={1024} height={1536} loading="lazy" /></div>
                <div className="pods-body">
                  <h3>{s.name}</h3>
                  <p className="pods-price num"><b>{priceText(s).replace(" / month", "")}</b> a month</p>
                  <ul>{s.inc.map((x) => <li key={x}><Icon name="check" size={18} />{x}</li>)}</ul>
                  <button type="button" className="pods-go" onClick={() => actions.configure(id)} aria-label={`Start ${s.name}`}>Start this pod <Icon name="arrow" /></button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
