import { ADDONS, GST, svc, isOneTime, type AddonId } from "./catalogue";

export type CartItem = { sid: string; qty: number; opts: number[]; extras: number[]; addons: AddonId[] };

export function newItem(sid: string): CartItem {
  const s = svc(sid);
  return { sid, qty: s?.qty ? s.qty.min : 1, opts: (s?.opts ?? []).map(() => 0), extras: [], addons: [] };
}

export function priceOf(item: CartItem) {
  const s = svc(item.sid);
  if (!s) return { unit: 0, qty: 1, sub: 0, add: 0, total: 0 };
  let unit = s.price;
  (s.opts ?? []).forEach((g, i) => { unit += g.choices[item.opts[i] ?? 0]?.[1] ?? 0; });
  item.extras.forEach((i) => { unit += s.extras?.[i]?.[1] ?? 0; });
  const qty = s.qty ? item.qty : 1;
  const sub = unit * qty;
  let add = 0;
  item.addons.forEach((id) => {
    const a = ADDONS.find((x) => x.id === id);
    if (a) add += a.flat ?? Math.max(a.min ?? 0, sub * (a.pct ?? 0));
  });
  return { unit, qty, sub, add, total: sub + add };
}

export function describe(item: CartItem): string {
  const s = svc(item.sid);
  if (!s) return "";
  const bits: string[] = [];
  if (s.qty) bits.push(`${item.qty} ${item.qty === 1 ? s.qty.label.replace(/s$/, "") : s.qty.label}`);
  (s.opts ?? []).forEach((g, i) => bits.push(g.choices[item.opts[i] ?? 0][0]));
  item.extras.forEach((i) => { if (s.extras?.[i]) bits.push(s.extras[i][0]); });
  item.addons.forEach((id) => { const a = ADDONS.find((x) => x.id === id); if (a) bits.push(a.name); });
  return bits.join(" · ");
}

export function totals(items: CartItem[]) {
  const sub = items.reduce((a, it) => a + priceOf(it).total, 0);
  return { sub, gst: sub * GST, grand: sub * (1 + GST) };
}

/** Monthly services are always paid in full. Projects are half now unless the client pays in full. */
export function payPlan(items: CartItem[], full: boolean) {
  let now = 0, later = 0;
  items.forEach((it) => {
    const s = svc(it.sid);
    const g = priceOf(it).total * (1 + GST);
    if (full || s?.unit === "month") now += g;
    else { now += g / 2; later += g / 2; }
  });
  return { now, later };
}

export const hasOneTime = (items: CartItem[]) => items.some((it) => { const s = svc(it.sid); return !!s && isOneTime(s); });
