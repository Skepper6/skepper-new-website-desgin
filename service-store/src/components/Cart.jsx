import { describe, fmt, priceOf, totals } from "../lib/pricing";
import { useStore } from "../lib/store";
import { Cross, Layer } from "./Bits";

export function Lines({ editable }) {
  const { menu, cart, setCart, setLayer } = useStore();
  return cart.map((it, i) => {
    const s = menu.svc(it.sid);
    return (
      <div className="rl" key={i}>
        <div className="t"><span>{s.name}</span><span className="d" /><span className="num">{s.unit === "quote" ? "QUOTE" : s.unit === "free" ? "FREE" : fmt(priceOf(it, s, menu.addons).total)}</span></div>
        <div className="s">{describe(it, s, menu.addons) || (s.unit === "month" ? "Monthly" : "Standard scope")}{s.unit === "month" ? " · per month" : ""}</div>
        {editable ? <div className="a"><button type="button" className="link" onClick={() => setLayer({ type: "service", id: s.id, edit: i })} aria-label={"Edit " + s.name}>Edit</button><button type="button" className="link bad" onClick={() => setCart(cart.filter((_, k) => k !== i))} aria-label={"Remove " + s.name}>Remove</button></div> : null}
      </div>
    );
  });
}
export function Sum() {
  const { menu, cart } = useStore();
  const t = totals(cart, menu);
  const row = (l, n, c = "") => <div className={"rl " + c}><div className="t"><span>{l}</span><span className="d" /><span className="num">{fmt(n)}</span></div></div>;
  return <><div className="rule" /><div className="sum">{row("Subtotal", t.sub)}{row("GST 18%", t.gst)}{row("TOTAL", t.grand, "grand")}</div></>;
}

export default function Cart() {
  const { cart, setLayer, go } = useStore();
  const close = () => setLayer(null);
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <Layer className="drawer" label="Cart" onClose={close}>
      <div className="drawer-in">
        <div className="dh"><h2>Your order</h2><button type="button" className="x" onClick={close} aria-label="Close"><Cross /></button></div>
        <div className="receipt">
          <div className="hd"><b>skepper</b>Service Store · Bengaluru<br />{date} · {cart.length} item{cart.length === 1 ? "" : "s"}</div>
          <div className="rule" />
          {cart.length ? <><Lines editable /><Sum /></> : <p className="nothing">Nothing ordered yet.<br />Pick something from the menu.</p>}
          <div className="rule" />
          <div className="hd small">Thank you · Brew your brand</div>
        </div>
        <div className="df"><button type="button" className="btn block" disabled={!cart.length} onClick={() => { close(); go("checkout"); }}>Checkout</button></div>
      </div>
    </Layer>
  );
}
