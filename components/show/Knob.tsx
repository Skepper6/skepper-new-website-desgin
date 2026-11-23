"use client";
import { fmt } from "@/lib/format";
import { BudgetSay, BudgetTokens, useBudget } from "../flow/Sections";
import { Mark } from "../Mark";

/** A volume knob for money: an arc that fills as you turn it. */
export function Knob() {
  const b = useBudget();
  const p = b.i / b.max;
  const L = 2 * Math.PI * 92 * 0.75;
  return (
    <section className="knob" aria-labelledby="knob-h">
      <div className="knob-dial" style={{ ["--p" as string]: p }}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="92" className="knob-back" strokeDasharray={`${L} 999`} />
          <circle cx="100" cy="100" r="92" className="knob-fill" strokeDasharray={`${L * p} 999`} />
        </svg>
        <div className="knob-in">
          <Mark lit={b.lit} />
          <output className="num">{fmt(b.budget)}</output>
        </div>
        <input type="range" min={0} max={b.max} step={1} value={b.i} aria-label="Your budget in rupees" aria-valuetext={fmt(b.budget)} onChange={(e) => b.setI(Number(e.target.value))} />
      </div>
      <div className="knob-say">
        <h2 id="knob-h">What will your <b>budget brew?</b></h2>
        <BudgetSay {...b} />
        <div className="two" role="group" aria-label="Billing">
          <button type="button" aria-pressed={!b.monthly} onClick={() => b.setMonthly(false)}>One-time</button>
          <button type="button" aria-pressed={b.monthly} onClick={() => b.setMonthly(true)}>Monthly</button>
        </div>
        <BudgetTokens list={b.list} />
      </div>
    </section>
  );
}
