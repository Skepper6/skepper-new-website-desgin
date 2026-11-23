"use client";
import { useMemo, useState } from "react";
import { cat, CATS, priceText, SERVICES, type Service } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import type { ShardId } from "@/lib/mark";
import { newItem, priceOf } from "@/lib/pricing";
import { actions } from "@/lib/store";
import { tint } from "@/lib/theme";
import { ShardShape } from "../Mark";

const STEPS = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 90000, 120000, 150000, 200000, 250000, 350000];
const entry = (s: Service) => priceOf(newItem(s.id)).total;

export function useBudget() {
  const [i, setI] = useState(9);
  const [monthly, setMonthly] = useState(false);
  const budget = STEPS[i];
  const { list, n, lit } = useMemo(() => {
    const pool = SERVICES.filter((s) => s.price > 0 && (monthly ? s.unit === "month" : s.unit !== "month"));
    const inside = pool.filter((s) => entry(s) <= budget).sort((a, b) => entry(b) - entry(a));
    const seen = new Set<string>();
    const first = inside.filter((s) => !seen.has(s.cat) && seen.add(s.cat));
    return { list: [...first, ...inside.filter((s) => !first.includes(s))].slice(0, 8), n: inside.length, lit: new Set<ShardId>(inside.map((s) => cat(s.cat).shard)) };
  }, [budget, monthly]);
  return { i, setI, max: STEPS.length - 1, budget, monthly, setMonthly, list, n, lit };
}

export function BudgetTokens({ list }: { list: Service[] }) {
  return (
    <ul className="tokens tokens-pick">
      {list.map((s) => (
        <li key={s.id} style={{ ["--tint" as string]: tint(s.cat) }}>
          <button type="button" onClick={() => actions.configure(s.id)}>
            <ShardShape id={cat(s.cat).shard} />
            <b>{s.name}</b>
            <span className="num">{priceText(s)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function BudgetSay({ n, lit, monthly, budget }: { n: number; lit: Set<ShardId>; monthly: boolean; budget: number }) {
  return (
    <p aria-live="polite">
      {n ? `${fmt(budget)}${monthly ? " a month" : ""} opens ${n} ${n === 1 ? "service" : "services"} in ${lit.size} of ${CATS.length} departments, before GST.` : "Nothing starts this low yet. The Brand Quick Assessment is free."}
    </p>
  );
}
