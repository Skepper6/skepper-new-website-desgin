"use client";
import { useMemo, useState } from "react";
import { CATS, isOneTime, priceText, ROUNDS, SERVICES, timeText, type CategoryId, type Service } from "@/lib/catalogue";
import { deptPic, svcPic } from "@/lib/pics";
import { SLink } from "@/lib/site";
import { actions } from "@/lib/store";
import { tint } from "@/lib/theme";
import { Icon } from "../Icon";

/** One service as a pane of coloured light. */
export function Pane({ s }: { s: Service }) {
  return (
    <li className="pane" style={{ ["--tint" as string]: tint(s.cat) }}>
      <SLink
        href={`/service/${s.id}/`}
        prefetch={false}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          actions.configure(s.id);
        }}
      >
        <span className="pane-pic"><img src={svcPic(s.id)} alt="" width={820} height={840} loading="lazy" />{s.tag ? <em>{s.tag}</em> : null}</span>
        <b>{s.name}</b>
        <span className="pane-desc">{s.desc}</span>
        <span className="pane-foot">
          <span className="num">{priceText(s)}</span>
          <span>{[timeText(s), isOneTime(s) ? `${ROUNDS} correction rounds` : null].filter(Boolean).join(", ")}</span>
          <i><Icon name="arrow" /></i>
        </span>
      </SLink>
    </li>
  );
}

/** The catalogue as a sentence you finish: “I need ____, for ____, paid ____.” */
export function Find({ start = "all" }: { start?: CategoryId | "all" }) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<CategoryId | "all">(start);
  const [pay, setPay] = useState<"all" | "once" | "month">("all");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SERVICES.filter(
      (s) =>
        (dept === "all" || s.cat === dept) &&
        (pay === "all" || (pay === "month" ? s.unit === "month" : s.unit !== "month")) &&
        (!term || (s.name + " " + s.desc + " " + s.inc.join(" ")).toLowerCase().includes(term)),
    );
  }, [q, dept, pay]);
  return (
    <section className="find" aria-label="Find a service">
      <div className="find-say">
        <span>I need </span>
        <label>
          <span className="sr">Search services</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="a logo, a reel, a website" />
        </label>
        <span> from </span>
        <label>
          <span className="sr">Department</span>
          <select value={dept} onChange={(e) => setDept(e.target.value as CategoryId | "all")}>
            <option value="all">any department</option>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <span> paid </span>
        <label>
          <span className="sr">Billing</span>
          <select value={pay} onChange={(e) => setPay(e.target.value as typeof pay)}>
            <option value="all">any way</option>
            <option value="once">one time</option>
            <option value="month">monthly</option>
          </select>
        </label>
      </div>
      <ul className="find-chips" aria-label="Departments">
        <li><button type="button" aria-pressed={dept === "all"} onClick={() => setDept("all")}>All</button></li>
        {CATS.map((c) => <li key={c.id}><button type="button" aria-pressed={dept === c.id} onClick={() => setDept(c.id)}><img src={deptPic(c.id).src} alt="" width={96} height={96} loading="lazy" />{c.short}</button></li>)}
      </ul>
      <p className="find-count" role="status">{list.length} of {SERVICES.length} services. Prices exclude 18% GST.</p>
      {list.length ? (
        <ul className="panes">{list.map((s) => <Pane key={s.id} s={s} />)}</ul>
      ) : (
        <div className="find-none">
          <p>No services match{q ? ` “${q}”` : ""}. Try another word.</p>
          <button type="button" className="cta" onClick={() => { setQ(""); setDept("all"); setPay("all"); }}>Show everything</button>
        </div>
      )}
    </section>
  );
}
