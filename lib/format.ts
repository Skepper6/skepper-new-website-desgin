export const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const dstr = (d: string | Date) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const addDays = (d: string | Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
/** “MLR-ready versions” keeps its capitals; “Up to 25 requests” reads on inside a sentence. */
export const inline = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
export const uid = (p: string) => p + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
