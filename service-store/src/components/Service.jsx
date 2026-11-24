import { useState } from "react";
import { fmt, isOneTime, priceOf } from "../lib/pricing";
import { useStore } from "../lib/store";
import { Cross, Layer } from "./Bits";

const toggle = (list, x) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

/** One service: what you get on one side, the choices and the price on the other. */
export default function Service({ id, edit }) {
  const { menu, cart, setCart, setLayer } = useStore();
  const s = menu.svc(id);
  const [d, setD] = useState(() => (edit != null ? cart[edit] : { sid: id, qty: s.qty ? s.qty.min : 1, opts: (s.opts || []).map(() => 0), extras: [], addons: [] }));
  const [qty, setQty] = useState(String(d.qty));
  const p = priceOf(d, s, menu.addons);
  const quote = s.unit === "quote", free = s.unit === "free";
  const cat = menu.cats.find((c) => c.id === s.cat);
  const close = () => setLayer(null);
  const amount = (n) => {
    const v = Math.min(999, Math.max(s.qty.min, parseInt(n, 10) || s.qty.min));
    setD({ ...d, qty: v });
    setQty(String(v));
  };
  const add = () => {
    setCart(edit != null ? cart.map((it, i) => (i === edit ? d : it)) : [...cart, d]);
    setLayer({ type: "cart" });
  };
  return (
    <Layer className="scrim" label={s.name} onClose={close}>
      <div className="modal">
        <div className="mh">
          <button type="button" className="x" onClick={close} aria-label="Close"><Cross /></button>
          <div className="meta"><span className="chip">{cat.name}</span>{s.tag ? <span className="chip tag">{s.tag}</span> : null}<span className="chip">{s.unit === "month" ? "Monthly" : s.days ? s.days + " days" : "Custom timeline"}</span></div>
          <h2>{s.name}</h2>
          <p className="lead">{s.desc}</p>
        </div>
        <div className="mb"><div className="two">
          <div>
            <div className="lbl">What you get</div>
            <ul className="inc">
              {s.inc.map((i) => <li key={i}>{i}</li>)}
              {isOneTime(s) ? <><li>Up to {menu.rounds} rounds of corrections</li><li>Project tracking in your client portal</li></> : null}
              {s.unit === "month" ? <li>Billed monthly in advance, cancel with 30 days’ notice</li> : null}
            </ul>
            <p className="note">{s.days ? (s.unit === "month" ? "Work runs on a monthly cycle." : `Typical delivery: ${s.days} working days after your brief.`) : "Timeline agreed after the discovery call."}</p>
          </div>
          <div>
            {s.qty ? (
              <div className="field"><span className="lbl">Number of {s.qty.label} (min {s.qty.min})</span>
                <div className="qty"><button type="button" onClick={() => amount(d.qty - 1)} aria-label="Fewer">−</button><input className="num" type="number" min={s.qty.min} max="999" value={qty} aria-label="Quantity" onChange={(e) => setQty(e.target.value)} onBlur={(e) => amount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && amount(e.target.value)} /><button type="button" onClick={() => amount(d.qty + 1)} aria-label="More">+</button></div>
              </div>
            ) : null}
            {(s.opts || []).map((g, gi) => (
              <div className="field" key={g.label}><label htmlFor={"opt" + gi}>{g.label}</label>
                <select id={"opt" + gi} value={d.opts[gi]} onChange={(e) => setD({ ...d, opts: d.opts.map((o, i) => (i === gi ? Number(e.target.value) : o)) })}>
                  {g.choices.map((c, ci) => <option key={c[0]} value={ci}>{c[0]}{c[1] ? ` (+${fmt(c[1])})` : ""}</option>)}
                </select>
              </div>
            ))}
            {s.extras?.length ? <><div className="lbl">Extras</div>{s.extras.map((e, i) => <label className="check" key={e[0]}><input type="checkbox" checked={d.extras.includes(i)} onChange={() => setD({ ...d, extras: toggle(d.extras, i) })} /><span>{e[0]}</span><b className="num">+{fmt(e[1])}</b></label>)}</> : null}
            {isOneTime(s) ? <><div className="lbl">Add-ons</div>{menu.addons.map((a) => <label className="check" key={a.id}><input type="checkbox" checked={d.addons.includes(a.id)} onChange={() => setD({ ...d, addons: toggle(d.addons, a.id) })} /><span>{a.name}<small>{a.desc}</small></span><b className="num">{a.flat ? "+" + fmt(a.flat) : "+" + Math.round(a.pct * 100) + "%"}</b></label>)}</> : null}
            <div className="total" aria-live="polite">
              {quote ? <><div className="row"><span>Price</span><b>After discovery call</b></div><p className="note">Add to cart to book a free discovery call. No payment now.</p></> : free ? <div className="row"><span>Price</span><b>Free</b></div> : (
                <>
                  <div className="row"><span>{s.qty ? `${p.qty} × ${fmt(p.unit)}` : "Service"}</span><span className="num">{fmt(p.sub)}</span></div>
                  {p.add ? <div className="row"><span>Add-ons</span><span className="num">{fmt(p.add)}</span></div> : null}
                  <div className="row end"><span>Total {s.unit === "month" ? "per month " : ""}(excl. GST)</span><span className="big num">{fmt(p.total)}</span></div>
                  {s.unit === "from" ? <p className="note">Starting price. Final scope is confirmed in writing before work begins.</p> : null}
                </>
              )}
            </div>
            <div className="actions"><button type="button" className="btn block goldb" onClick={add}>{edit != null ? "Update cart" : quote ? "Add quote request" : "Add to cart"}</button></div>
          </div>
        </div></div>
      </div>
    </Layer>
  );
}
