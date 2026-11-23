"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUNDS, svc } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import { describe, hasOneTime, payPlan, priceOf, totals } from "@/lib/pricing";
import { SLink, useSite } from "@/lib/site";
import { actions, useStore } from "@/lib/store";

type Details = { name: string; company: string; email: string; phone: string; gstin: string; city: string };
const METHODS = ["UPI", "Card", "Net banking"];

/** Checkout in three quiet screens: who you are, how you pay, one last look. */
export function Checkout() {
  const ready = useStore((s) => s.ready);
  const cart = useStore((s) => s.cart);
  const router = useRouter();
  const { to } = useSite();
  const [at, setAt] = useState(0);
  const [d, setD] = useState<Details>({ name: "", company: "", email: "", phone: "", gstin: "", city: "" });
  const [full, setFull] = useState(false);
  const [method, setMethod] = useState(METHODS[0]);
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState<Partial<Record<keyof Details | "terms", string>>>({});
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) head.current?.focus();
  }, [at]);

  if (!ready || busy) return <div className="steps-page"><h1>Checkout</h1><p role="status">{busy ? "Placing your order" : "Loading your order"}</p></div>;
  if (!cart.length)
    return (
      <div className="steps-page">
        <h1>Checkout</h1>
        <p className="t-lead">Your order is empty. Choose a service and it will show up here.</p>
        <SLink className="cta" href="/services/">Explore services</SLink>
      </div>
    );

  const once = hasOneTime(cart);
  const t = totals(cart);
  const half = payPlan(cart, false);
  const all = payPlan(cart, true);
  const now = full ? all.now : half.now;
  const focusFirst = (e: typeof err) => {
    const k = Object.keys(e)[0];
    if (k) requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>(`[name=${k}]`)?.focus());
  };
  const move = (n: number) => {
    moved.current = true;
    setAt(n);
    scrollTo({ top: 0 });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bad: typeof err = {};
    if (at === 0) {
      if (!d.name.trim()) bad.name = "Add your full name.";
      if (!/^\S+@\S+\.\S+$/.test(d.email.trim())) bad.email = "Add a valid email, like name@company.com.";
      if (d.phone.replace(/\D/g, "").length < 10) bad.phone = "Add a phone number with at least 10 digits.";
    }
    if (at === 2 && !terms) bad.terms = "Accept the terms to place the order.";
    setErr(bad);
    if (Object.keys(bad).length) return focusFirst(bad);
    if (at < 2) return move(at + 1);
    setBusy(true);
    const c = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.trim()])) as Details;
    actions.placeOrder(c, full, method);
    router.push(to("/thanks/"));
  };
  const field = (k: keyof Details, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="ask-field">
      <label htmlFor={"c-" + k}>{label}</label>
      <input id={"c-" + k} name={k} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} aria-invalid={!!err[k]} aria-describedby={err[k] ? "e-" + k : undefined} {...props} />
      {err[k] ? <p className="err" id={"e-" + k}>{err[k]}</p> : null}
    </div>
  );

  return (
    <form className="steps-page" ref={form} onSubmit={submit} noValidate>
      <p className="steps-at">{["You", "Payment", "Confirm"].map((x, i) => <button key={x} type="button" disabled={i > at} aria-current={i === at ? "step" : undefined} onClick={() => move(i)}>{x}</button>)}</p>
      <h1 ref={head} tabIndex={-1}>{["Who is this for?", "How would you like to pay?", "One last look"][at]}</h1>

      {at === 0 ? (
        <div className="ask-grid">
          {field("name", "Full name", { autoComplete: "name", required: true })}
          {field("company", "Company or brand, optional", { autoComplete: "organization" })}
          {field("email", "Email", { type: "email", autoComplete: "email", required: true })}
          {field("phone", "Phone or WhatsApp", { type: "tel", autoComplete: "tel", required: true })}
          {field("gstin", "GSTIN, optional, for input tax credit")}
          {field("city", "City, optional", { autoComplete: "address-level2" })}
        </div>
      ) : null}

      {at === 1 ? (
        <>
          {once ? (
            <fieldset className="talk-picks">
              <legend className="sr">Payment plan</legend>
              <label>
                <input type="radio" name="plan" value="half" checked={!full} onChange={() => setFull(false)} />
                <span><b>50% advance now, {fmt(half.now)}</b><small>Balance of {fmt(half.later)} is due when final files are ready.</small></span>
              </label>
              <label>
                <input type="radio" name="plan" value="full" checked={full} onChange={() => setFull(true)} />
                <span><b>Pay in full now, {fmt(all.now)}</b><small>Final files are released as soon as you approve.</small></span>
              </label>
            </fieldset>
          ) : null}
          <fieldset className="talk-picks talk-picks-s">
            <legend>With</legend>
            {METHODS.map((m) => (
              <label key={m}><input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} /><span><b>{m}</b></span></label>
            ))}
          </fieldset>
          <p>Secured by Razorpay in the live store. This prototype simulates a successful payment.</p>
        </>
      ) : null}

      {at === 2 ? (
        <>
          <ul className="look">
            {cart.map((it, i) => {
              const s = svc(it.sid);
              return s ? (
                <li key={i}>
                  <b>{s.name}</b> {describe(it).replaceAll(" · ", ", ")} <span className="num">{s.unit === "quote" ? "on quote" : s.unit === "free" ? "free" : fmt(priceOf(it).total)}</span>
                  <button type="button" className="link" onClick={() => actions.configure(it.sid, i)} aria-label={`Change ${s.name}`}>Change</button>
                </li>
              ) : null;
            })}
          </ul>
          <p className="t-lead">
            {fmt(t.sub)} plus {fmt(t.gst)} GST is {fmt(t.grand)}. {once ? (full ? "You pay it all now" : `You pay ${fmt(now)} now and ${fmt(half.later)} when final files are ready`) : "Monthly services are paid in advance"}, by {method}. A GST invoice goes to {d.email}.
          </p>
          <label className="agree">
            <input type="checkbox" name="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={!!err.terms} aria-describedby={err.terms ? "e-terms" : undefined} />
            <span>I agree to Skepper’s <SLink href="/terms/">terms</SLink>: up to {ROUNDS} correction rounds per project, extra rounds costed separately.</span>
          </label>
          {err.terms ? <p className="err" id="e-terms">{err.terms}</p> : null}
        </>
      ) : null}

      <div className="steps-foot">
        <p aria-live="polite"><b className="num paynow">{fmt(now)}</b> to pay now</p>
        <div className="talk-go">
          {at > 0 ? <button type="button" className="link" onClick={() => move(at - 1)}>Back</button> : null}
          <button type="submit" className="cta">{at < 2 ? "Next" : now > 0 ? `Pay ${fmt(now)}` : "Place order"}</button>
        </div>
      </div>
    </form>
  );
}
