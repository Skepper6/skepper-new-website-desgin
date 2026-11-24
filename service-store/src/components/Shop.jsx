import { useMemo, useRef, useState } from "react";
import { fmt, isOneTime, two, unitText } from "../lib/pricing";
import { useStore } from "../lib/store";
import { Arrow, Pill } from "./Bits";
import Pick from "./Pick";

const Price = ({ s }) =>
  s.unit === "free" ? "Free" : s.unit === "quote" ? "On quote" : (
    <>
      {s.unit === "from" ? <span className="from">from</span> : null}
      {fmt(s.price)}
      {s.unit !== "from" && unitText(s) ? <small>{unitText(s)}</small> : null}
    </>
  );

function Item({ s, n, rounds, open }) {
  return (
    <button type="button" className="item" onClick={open} aria-label={`${s.name}, ${s.unit === "free" ? "free" : s.unit === "quote" ? "on quote" : fmt(s.price)}`}>
      <span className="no">{two(n)}</span>
      <span className="top"><b>{s.name}</b><span className="dots" aria-hidden="true" /><span className="pr num"><Price s={s} /></span></span>
      <span className="go" aria-hidden="true"><Arrow /></span>
      <span className="desc">{s.desc}</span>
      <span className="meta">
        {s.tag ? <span className="chip tag">{s.tag}</span> : null}
        {s.days ? <span className="chip">{s.unit === "month" ? "Monthly" : s.days + " days"}</span> : null}
        {isOneTime(s) ? <span className="chip">{rounds} correction rounds</span> : null}
      </span>
    </button>
  );
}

const useOpen = () => {
  const { setLayer } = useStore();
  return (id) => setLayer({ type: "service", id });
};

export function Specials() {
  const { menu } = useStore();
  const open = useOpen();
  const { rounds } = menu;
  return (
    <div className="ticket specials">
      <h2>Today’s specials</h2>
      <div className="rule" />
      {menu.specials.map(menu.svc).filter(Boolean).map((s) => (
        <button key={s.id} type="button" className="tl" onClick={() => open(s.id)}><span className="n">{s.name.replace("Monthly Plan · ", "Social · ")}</span><span className="d" /><span className="num">{fmt(s.price)}{s.unit === "month" ? "/mo" : ""}</span></button>
      ))}
      <div className="rule" />
      <div className="foot">Every project includes up to {rounds} correction rounds.<br />Start with 50% advance. GST invoice issued.</div>
    </div>
  );
}

export function Marquee() {
  const { services } = useStore().menu;
  const names = services.filter((s) => s.unit !== "quote");
  return <div className="marquee" aria-hidden="true"><div className="track-m">{[0, 1].map((k) => names.map((s) => <span key={k + s.id}>{s.name}</span>))}</div></div>;
}

/** Search, category, billing and the 59 services. */
export function ServiceMenu({ ref }) {
  const { cats, services, rounds } = useStore().menu;
  const open = useOpen();
  const results = useRef(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [type, setType] = useState("all");
  const pickCat = (id) => {
    setCat(id);
    const r = results.current;
    if (r.getBoundingClientRect().top < 0) requestAnimationFrame(() => r.scrollIntoView());
  };
  const blocks = useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (s) =>
      (cat === "all" || s.cat === cat) &&
      (type === "all" || (type === "month" ? s.unit === "month" : s.unit !== "month")) &&
      (!term || (s.name + " " + s.desc + " " + s.inc.join(" ")).toLowerCase().includes(term));
    return cats.map((c, i) => [c, i, services.filter((s) => s.cat === c.id && match(s))]).filter((b) => b[2].length);
  }, [cats, services, q, cat, type]);
  const choices = [{ id: "all", name: "Everything", n: services.length }, ...cats.map((c) => ({ id: c.id, name: c.name, n: services.filter((s) => s.cat === c.id).length }))];
  return (
    <>
      <div className="filters" id="menu" ref={ref}>
        <div className="wrap">
          <div className="row1">
            <input className="search" type="search" placeholder="Search the menu: logo, reel, 30 seconds, brochure…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search services" />
            <Pick label="Category" value={cat} options={choices} onPick={pickCat} />
            <div className="seg" role="group" aria-label="Billing type">
              {[["all", "All"], ["once", "One-time"], ["month", "Monthly"]].map(([id, l]) => <button key={id} type="button" className={type === id ? "on" : ""} aria-pressed={type === id} onClick={() => setType(id)}>{l}</button>)}
            </div>
          </div>
        </div>
      </div>
      <div className="wrap" id="results" ref={results}>
        {blocks.map(([c, i, list]) => (
          <section key={c.id} className="catblock" aria-labelledby={"cat-" + c.id}>
            <div className="cathead"><span className="big" aria-hidden="true">{two(i + 1)}</span><h2 id={"cat-" + c.id}>{c.name}</h2><p>{c.blurb}</p></div>
            <div className="items">{list.map((s, k) => <Item key={s.id} s={s} n={k + 1} rounds={rounds} open={() => open(s.id)} />)}</div>
          </section>
        ))}
        {blocks.length ? null : <div className="empty">Nothing on the menu matches “{q}”. Try another word or <button type="button" className="link" onClick={() => { setQ(""); setCat("all"); setType("all"); }}>clear the filters</button>.</div>}
      </div>
    </>
  );
}

export default function Shop() {
  const { menu } = useStore();
  const { services, rounds } = menu;
  const open = useOpen();
  const list = useRef(null);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toMenu = () => list.current.scrollIntoView({ behavior: calm ? "auto" : "smooth" });

  return (
    <>
      <div className="top-glow">
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="eyebrow"><span>Skepper Creative Agency</span><span>Bengaluru</span><span>Since 2013</span></div>
            <h1><b className="l">Brew</b> <span className="l">your</span> <b className="l swoosh">brand.<svg viewBox="0 0 268 30" aria-hidden="true"><path d="M2 28C70-4 190-8 266 28 190 4 80 4 2 28Z" /></svg></b></h1>
            <p className="sub">Order logos, films, posts, websites and full brand systems the way you order from a menu. Pick, pay, share your brief and watch every stage move, right here.</p>
            <div className="ctas">
              <Pill onClick={toMenu}>See the full menu</Pill>
              <Pill onClick={() => open("bqa")}>Free brand assessment</Pill>
            </div>
          </div>
          <Specials />
        </div>
        <div className="wrap"><div className="stats">
          <div><b>20+</b><span>years of branding, design and film</span></div>
          <div><b>49</b><span>international and national awards</span></div>
          <div><b>{services.length}</b><span>services you can order online</span></div>
          <div><b>3 days</b><span>express delivery, hybrid human-AI studio</span></div>
        </div></div>
      </section>
      <Marquee />
      </div>
      <div className="paper">
        <div className="wrap">
          <div className="how">
            <div><b><i>01</i>Choose</b><p>Pick a service, set the options, see the price instantly.</p></div>
            <div><b><i>02</i>Pay</b><p>50% advance for projects. Monthly plans paid in advance.</p></div>
            <div><b><i>03</i>Brief</b><p>Share your goals, references and files in your portal.</p></div>
            <div><b><i>04</i>Approve</b><p>Review drafts, request up to {rounds} rounds, download finals.</p></div>
          </div>
        </div>
        <ServiceMenu ref={list} />
      </div>
      <section className="closer"><div className="wrap">
        <div><h2>Not sure what your brand needs first?</h2><p>Start with the free Brand Quick Assessment. Three priorities, one 20-minute call.</p></div>
        <Pill onClick={() => open("bqa")}>Book it free</Pill>
      </div></section>
    </>
  );
}
