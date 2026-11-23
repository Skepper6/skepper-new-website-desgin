"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ADDONS, cat, isOneTime, ROUNDS, svc, timeText, type Service } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import { describe, newItem, priceOf, type CartItem } from "@/lib/pricing";
import { SLink } from "@/lib/site";
import { actions, useStore } from "@/lib/store";
import { tint } from "@/lib/theme";
import { Dialog } from "../Dialog";
import { Icon } from "../Icon";
import { ShardShape } from "../Mark";

type Step = { key: string; ask: string };

function stepsFor(s: Service): Step[] {
  const out: Step[] = [{ key: "what", ask: s.name }];
  if (s.qty) out.push({ key: "qty", ask: `How many ${s.qty.label}?` });
  (s.opts ?? []).forEach((g, i) => out.push({ key: "opt" + i, ask: `Which ${g.label.toLowerCase()}?` }));
  if (s.extras?.length) out.push({ key: "extras", ask: "Anything extra?" });
  if (isOneTime(s)) out.push({ key: "addons", ask: "Any add-ons?" });
  out.push({ key: "review", ask: "Does this look right?" });
  return out;
}

function Conversation({ s, line, index, onClose }: { s: Service; line?: CartItem; index: number | null; onClose: () => void }) {
  const uid = useId();
  const steps = useMemo(() => stepsFor(s), [s]);
  const [d, setD] = useState<CartItem>(() => (line ? structuredClone(line) : newItem(s.id)));
  const [at, setAt] = useState(index != null ? steps.length - 1 : 0);
  const head = useRef<HTMLHeadingElement>(null);
  const step = steps[at];
  const last = at === steps.length - 1;
  const min = s.qty?.min ?? 1;
  const clamp = (n: number) => Math.min(999, Math.max(min, Math.floor(n) || min));
  const safe = { ...d, qty: clamp(d.qty) };
  const p = priceOf(safe);
  const quote = s.unit === "quote", free = s.unit === "free";
  const toggle = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) first.current = false;
    else head.current?.focus();
  }, [at]);

  const inc = [...s.inc];
  if (isOneTime(s)) inc.push(`Up to ${ROUNDS} rounds of corrections`, "Project tracking in your client portal");
  if (s.unit === "month") inc.push("Billed monthly in advance, cancel with 30 days’ notice");

  return (
    <form
      className="talk"
      style={{ ["--tint" as string]: tint(s.cat) }}
      onSubmit={(e) => {
        e.preventDefault();
        if (last) actions.addToCart(safe, index);
        else setAt(at + 1);
      }}
    >
      <div className="talk-top">
        <p>
          <ShardShape id={cat(s.cat).shard} /> {s.name}
        </p>
        <button type="button" className="round" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>

      <div className="talk-stage" key={step.key}>
        <h2 ref={head} tabIndex={-1}>{step.ask}</h2>

        {step.key === "what" ? (
          <div className="talk-what">
            <p className="t-lead">{s.desc}</p>
            <ul>{inc.map((x) => <li key={x}>{x}</li>)}</ul>
            <p>{s.days ? (s.unit === "month" ? "Work runs on a monthly cycle." : `Typical delivery: ${s.days} working days after your brief.`) : "Timeline agreed after the discovery call."}</p>
          </div>
        ) : null}

        {step.key === "qty" && s.qty ? (
          <div className="talk-qty">
            <button type="button" className="round" onClick={() => setD({ ...d, qty: clamp(d.qty - 1) })} disabled={d.qty <= min} aria-label="Fewer"><Icon name="minus" /></button>
            <input aria-label={`Number of ${s.qty.label}`} type="number" inputMode="numeric" min={min} max={999} value={d.qty || ""} onChange={(e) => setD({ ...d, qty: Number(e.target.value) })} onBlur={() => setD({ ...d, qty: clamp(d.qty) })} />
            <button type="button" className="round" onClick={() => setD({ ...d, qty: clamp(d.qty + 1) })} aria-label="More"><Icon name="plus" /></button>
            <p>{s.qty.label}, minimum {min}. {fmt(p.unit)} each.</p>
          </div>
        ) : null}

        {step.key.startsWith("opt") ? (
          <fieldset className="talk-picks">
            <legend className="sr">{step.ask}</legend>
            {s.opts![Number(step.key.slice(3))].choices.map((c, ci) => {
              const gi = Number(step.key.slice(3));
              return (
                <label key={c[0]}>
                  <input type="radio" name={uid + gi} checked={d.opts[gi] === ci} onChange={() => setD({ ...d, opts: d.opts.map((x, i) => (i === gi ? ci : x)) })} />
                  <span><b>{c[0]}</b><small>{c[1] ? "+" + fmt(c[1]) : "Included"}</small></span>
                </label>
              );
            })}
          </fieldset>
        ) : null}

        {step.key === "extras" ? (
          <fieldset className="talk-picks">
            <legend className="sr">{step.ask}</legend>
            {s.extras!.map((e, i) => (
              <label key={e[0]}>
                <input type="checkbox" checked={d.extras.includes(i)} onChange={() => setD({ ...d, extras: toggle(d.extras, i) })} />
                <span><b>{e[0]}</b><small>+{fmt(e[1])}</small></span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {step.key === "addons" ? (
          <fieldset className="talk-picks">
            <legend className="sr">{step.ask}</legend>
            {ADDONS.map((a) => (
              <label key={a.id}>
                <input type="checkbox" checked={d.addons.includes(a.id)} onChange={() => setD({ ...d, addons: toggle(d.addons, a.id) })} />
                <span><b>{a.name}</b><small>{a.desc}. {a.flat ? "+" + fmt(a.flat) : `+${Math.round((a.pct ?? 0) * 100)}%, minimum ${fmt(a.min ?? 0)}`}</small></span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {step.key === "review" ? (
          <div className="talk-what">
            <p className="t-lead">
              {s.name}{describe(safe) ? `: ${describe(safe).replaceAll(" · ", ", ")}` : ""}. {timeText(s)}.
            </p>
            <p>
              {quote ? "Add it to book a free discovery call. No payment now." : free ? "It is free. Nothing to pay." : s.unit === "from" ? "This is a starting price. Final scope is confirmed in writing before work begins." : "GST of 18% is added at checkout."}
            </p>
            <SLink className="link" href={`/service/${s.id}/`} onClick={onClose}>Open the full page</SLink>
          </div>
        ) : null}
      </div>

      <div className="talk-foot">
        <div className="talk-price" aria-live="polite">
          {quote ? <b>After a discovery call</b> : free ? <b>Free</b> : <><b className="num">{fmt(p.total)}</b><span>{s.unit === "month" ? "per month, " : ""}before GST{p.add ? `, includes ${fmt(p.add)} of add-ons` : ""}</span></>}
        </div>
        <ol className="talk-dots" aria-label={`Step ${at + 1} of ${steps.length}`}>
          {steps.map((x, i) => <li key={x.key} data-on={i <= at} />)}
        </ol>
        <div className="talk-go">
          {at > 0 ? <button type="button" className="link" onClick={() => setAt(at - 1)}>Back</button> : null}
          {!last && at === 0 ? <button type="button" className="link" onClick={() => setAt(steps.length - 1)}>Skip to the end</button> : null}
          <button type="submit" className="cta">{!last ? "Next" : index != null ? "Update order" : quote ? "Request a quote" : "Add to order"}</button>
        </div>
      </div>
    </form>
  );
}

/** Ordering as a conversation: one question on the screen at a time, the price always in view. */
export function OrderFlow() {
  const editing = useStore((x) => x.editing);
  const line = useStore((x) => (x.editing?.index != null ? x.cart[x.editing.index] : undefined));
  const s = editing ? svc(editing.sid) : undefined;
  return (
    <Dialog open={!!s} onClose={actions.closeConfigure} className="talk-dialog" label={s ? `Order ${s.name}` : "Order"}>
      {s ? <Conversation key={s.id + String(editing?.index)} s={s} line={line} index={editing?.index ?? null} onClose={actions.closeConfigure} /> : null}
    </Dialog>
  );
}
