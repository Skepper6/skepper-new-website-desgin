// Shown while choosing. The server works every price out again before an order is placed.
export const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export const dstr = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const two = (n) => String(n).padStart(2, "0");
export const isOneTime = (s) => ["project", "unit", "from"].includes(s.unit);
export const unitText = (s) => ({ month: "/ month", unit: "/ " + (s.qty ? s.qty.label.replace(/s$/, "") : "unit"), from: "onwards" })[s.unit] || "";

export function priceOf(item, s, addons) {
  let unit = s.price;
  (s.opts || []).forEach((g, i) => (unit += g.choices[item.opts?.[i] ?? 0]?.[1] ?? 0));
  (item.extras || []).forEach((i) => (unit += s.extras?.[i]?.[1] ?? 0));
  const qty = s.qty ? item.qty : 1;
  const sub = unit * qty;
  let add = 0;
  (item.addons || []).forEach((id) => {
    const a = addons.find((x) => x.id === id);
    if (a) add += a.flat || Math.max(a.min, sub * a.pct);
  });
  return { unit, qty, sub, add, total: sub + add };
}
export function describe(item, s, addons) {
  const bits = [];
  (s.opts || []).forEach((g, i) => bits.push(g.choices[item.opts?.[i] ?? 0]?.[0]));
  (item.extras || []).forEach((i) => bits.push(s.extras?.[i]?.[0]));
  if (s.qty) bits.unshift(item.qty + " " + s.qty.label);
  (item.addons || []).forEach((id) => bits.push(addons.find((a) => a.id === id)?.name));
  return bits.filter(Boolean).join(" · ");
}
export function totals(cart, menu) {
  const sub = cart.reduce((a, it) => a + priceOf(it, menu.svc(it.sid), menu.addons).total, 0);
  return { sub, gst: sub * menu.gst, grand: sub * (1 + menu.gst) };
}
export function payPlan(cart, full, menu) {
  let now = 0, later = 0;
  for (const it of cart) {
    const s = menu.svc(it.sid);
    const g = Math.round(priceOf(it, s, menu.addons).total * (1 + menu.gst) * 100) / 100;
    const n = s.unit === "month" || full ? g : Math.round(g * 50) / 100;
    now += n;
    later += g - n;
  }
  return { now, later };
}
