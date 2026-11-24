import { useRef, useState } from "react";
import { post, razorpay } from "../lib/api";
import { fmt, isOneTime, payPlan } from "../lib/pricing";
import { useStore } from "../lib/store";
import { Field } from "./Bits";
import { Lines, Sum } from "./Cart";
import { PageHead } from "./Frame";

export function Checkout() {
  const { menu, cart, setCart, setOrder, setSession, session, go } = useStore();
  const [full, setFull] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useRef(null);
  const intro = "Projects start with a 50% advance. Monthly services are paid in advance each month. A GST invoice is issued for every payment.";
  if (!cart.length) return <><PageHead title="Checkout">{intro}</PageHead><div className="paper page"><div className="wrap"><div className="empty">Your cart is empty. <a href="#shop">Browse services</a>.</div></div></div></>;

  const half = payPlan(cart, false, menu), whole = payPlan(cart, true, menu);
  const hasOnce = cart.some((it) => isOneTime(menu.svc(it.sid)));
  const now = full && hasOnce ? whole.now : half.now;

  const fail = (msg, name) => {
    setErr(msg);
    if (name) form.current.elements[name]?.focus();
  };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const v = Object.fromEntries(new FormData(form.current));
    const late = "Add your name, a valid email and a 10-digit phone number to continue.";
    if (!v.name.trim()) return fail(late, "name");
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) return fail(late, "email");
    if (v.phone.replace(/\D/g, "").length < 10) return fail(late, "phone");
    if (!v.terms) return fail("Please accept the terms to place the order.", "terms");
    setErr("");
    setBusy(true);
    try {
      let r = await post("/orders", { ...v, terms: true, plan: full && hasOnce ? "full" : "half", items: cart });
      if (r.status === "pay") {
        const paid = await razorpay(r.razorpay);
        if (!paid) return setErr("The payment was not completed. Nothing was charged, and your cart is still here.");
        r = await post("/payments/verify", paid);
      }
      setOrder(r.order);
      setSession({ ...session, orders: (session?.orders || 0) + 1 });
      setCart([]);
      go("thanks");
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead title="Checkout">{intro}</PageHead>
      <div className="paper page"><div className="wrap">
        <form className="co" ref={form} onSubmit={submit} noValidate>
          <div className="stack">
            <div className="panel"><h2><i>01</i>Your details</h2>
              <div className="cols2">
                <Field id="name" label="Full name" required autoComplete="name" />
                <Field id="company" label="Company / brand" autoComplete="organization" />
                <Field id="email" label="Email" type="email" required autoComplete="email" defaultValue={session?.user?.role === "client" ? session.user.email : ""} />
                <Field id="phone" label="Phone / WhatsApp" type="tel" required autoComplete="tel" />
                <Field id="gstin" label="GSTIN (optional)" placeholder="For input tax credit" />
                <Field id="city" label="City" autoComplete="address-level2" />
              </div>
            </div>
            {hasOnce ? (
              <div className="panel"><h2><i>02</i>Payment plan</h2>
                <label className="radio"><input type="radio" name="plan" value="half" checked={!full} onChange={() => setFull(false)} /><span><b>50% advance now</b> · <span className="num">{fmt(half.now)}</span><small>Balance of {fmt(half.later)} is due when final files are ready.</small></span></label>
                <label className="radio"><input type="radio" name="plan" value="full" checked={full} onChange={() => setFull(true)} /><span><b>Pay in full now</b> · <span className="num">{fmt(whole.now)}</span><small>Final files are released as soon as you approve.</small></span></label>
              </div>
            ) : null}
            <div className="panel"><h2><i>{hasOnce ? "03" : "02"}</i>Payment method</h2>
              <div className="paym">{["UPI", "Card", "Net banking"].map((m, i) => <label key={m}><input type="radio" name="method" value={m} defaultChecked={!i} />{m}</label>)}</div>
              <p className="note">{menu.payments === "simulated" ? "Secured by Razorpay in the live store. This prototype simulates a successful payment." : "Secured by Razorpay."}</p>
            </div>
          </div>
          <div className="sumticket stack">
            <div className="receipt flat">
              <div className="hd"><b>Order summary</b>{cart.length} item{cart.length === 1 ? "" : "s"}</div>
              <div className="rule" />
              <Lines /><Sum />
            </div>
            <div className="total"><div className="row end"><span>Pay now</span><span className="big num">{fmt(now)}</span></div></div>
            <label className="check"><input type="checkbox" name="terms" /><span>I agree to Skepper’s terms: up to {menu.rounds} correction rounds per project, extra rounds costed separately.</span></label>
            <div className="err" role="alert">{err}</div>
            <button className="btn block goldb" type="submit" disabled={busy}>{busy ? "One moment" : now ? "Pay " + fmt(now) : "Place order"}</button>
          </div>
        </form>
      </div></div>
    </>
  );
}

export function Thanks() {
  const { order: o, setCurrent, go } = useStore();
  if (!o) return <><PageHead title="My Projects" /><div className="paper page"><div className="wrap"><div className="empty">No recent order. <a href="#portal">Go to My Projects</a>.</div></div></div></>;
  return (
    <section className="success"><div className="wrap">
      <div className="stamp">Paid · {o.orderId}</div>
      <h1>Your order is brewing.</h1>
      <p>{o.paid ? `${fmt(o.paid)} received.` : "No payment needed."} A GST invoice and portal link go to {o.email}. Next step: share your brief so the studio can start.</p>
      <div className="actions"><button type="button" className="btn goldb" onClick={() => { setCurrent(o.ids[0]); go("portal"); }}>Share your brief</button><a className="btn plain" href="#shop">Keep browsing</a></div>
    </div></section>
  );
}
