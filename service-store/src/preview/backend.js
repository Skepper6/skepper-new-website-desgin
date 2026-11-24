// Stands in for the PHP and MySQL server on hosts that cannot run them, such as Vercel.
// Everything stays in the visitor's own browser: no order reaches the studio, no money moves, no email is sent.
// It is left out of the normal build (see vite.config.js).
import catalogue from "./catalogue.json";

const KEY = "skepper-preview-v1";
const DAY = 864e5;
const ROUNDS = catalogue.rounds;
const TYPES = "pdf png jpg jpeg webp gif svg ai eps psd doc docx ppt pptx xls xlsx txt csv zip mp4 mov mp3 wav ttf otf".split(" ");
const services = new Map(catalogue.services.map((s) => [s.id, s]));
const addons = new Map(catalogue.addons.map((a) => [a.id, a]));
const blobs = new Map(); // files picked in this tab; a reload forgets them

const iso = (days = 0) => new Date(Date.now() + days * DAY).toISOString();
const cents = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const stop = (message, status = 422) => Object.assign(new Error(message), { status });
const code = (p) => `${p}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(7, "0").slice(-6)}`;

function examples() {
  const base = { phone: "", company: "", quote: false, example: true, brief: null, files: [], messages: [] };
  return [
    {
      ...base, id: "PRJ-DEMO1", orderId: "ORD-DEMO1", sid: "social20", name: "Monthly Plan · Growth", detail: "December content", client: "Aarav Menon", company: "Greenleaf Organics", email: "aarav@example.com",
      created: iso(-12), due: iso(3), stage: 4, round: 1, resource: "Senior Graphic Designer 2", total: 53100, paid: 53100, monthly: true,
      brief: { goal: "Grow Instagram following ahead of the winter range launch", audience: "Urban families, 28 to 45", content: "Winter range, recipes, farm stories", refs: "@goodearth, @thewholetruthfoods", assets: "Have logo & guidelines", date: "", files: [] },
      files: [{ id: 1, kind: "draft", name: "Greenleaf_Dec_Calendar_SCA_D1.pdf", round: 0, status: "changes" }, { id: 2, kind: "draft", name: "Greenleaf_Dec_Posts_SCA_D2.pdf", round: 1, status: "pending" }],
      messages: [{ from: "studio", text: "Draft 2 is up with the recipe carousels reworked as you asked.", t: iso(-1) }],
      log: [[iso(-12), "Order paid in full"], [iso(-11), "Brief submitted"], [iso(-6), "First cut shared"], [iso(-4), "Corrections requested (round 1 of 4)"], [iso(-1), "Draft 2 shared for review"]],
    },
    {
      ...base, id: "PRJ-DEMO2", orderId: "ORD-DEMO2", sid: "logo", name: "Logo Design", detail: "Signature: 4 concepts + monogram + favicon", client: "Nisha Rao", company: "Kaapi Kottai Café", email: "nisha@example.com",
      created: iso(-4), due: iso(3), stage: 2, round: 0, resource: "Senior Graphic Designer 1", total: 41300, paid: 20650, monthly: false,
      brief: { goal: "Logo for a filter-coffee café in Indiranagar", audience: "Young professionals and students", content: "Name: Kaapi Kottai. Warm, South Indian, not kitsch", refs: "Brass tumblers, old Madras signage", assets: "Starting fresh", date: "", files: [] },
      log: [[iso(-4), "50% advance paid"], [iso(-4), "Brief submitted"], [iso(-3), "Kick-off call done"]],
    },
    {
      ...base, id: "PRJ-DEMO3", orderId: "ORD-DEMO3", sid: "v30", name: "30-Second Video", detail: "2D motion graphics · Professional voice-over (1 language)", client: "Dr. Suresh Pillai", company: "Pillai Dental Care", email: "suresh@example.com",
      created: iso(-1), due: iso(9), stage: 0, round: 0, resource: "Unassigned", total: 60180, paid: 30090, monthly: false,
      log: [[iso(-1), "50% advance paid"]],
    },
  ];
}

let memory = null;
function open() {
  if (memory) return memory;
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(d?.projects)) memory = d;
  } catch {
    // a private window, or nothing saved yet
  }
  memory ??= { projects: examples(), files: 100 };
  return memory;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // kept until the tab closes
  }
}

const shape = (p) => ({
  ...p,
  brief: p.brief ? { ...p.brief, files: p.files.filter((f) => f.kind === "brief").map((f) => ({ id: f.id, name: f.name, stored: blobs.has(f.id) })) } : null,
  files: p.files.filter((f) => f.kind !== "brief").map((f) => ({ ...f, final: f.kind === "final", stored: blobs.has(f.id) })),
});
const note = (p, text) => p.log.push([iso(), text]);
const pending = (p) => p.files.find((f) => f.status === "pending");
const value = (body, k) => String((body instanceof FormData ? body.get(k) : body?.[k]) ?? "").trim();
const ending = (name) => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");

function picked(body, field, max) {
  const list = body instanceof FormData ? body.getAll(field).filter((f) => f instanceof File && f.size) : [];
  if (list.length > max) throw stop(`Attach up to ${max} files.`);
  for (const f of list) {
    if (f.size > 50 * 1024 * 1024) throw stop(`${f.name} could not be uploaded. Keep each file under 50 MB.`);
    if (!TYPES.includes(ending(f.name))) throw stop(`${f.name} is a type of file we cannot take. Put it in a zip and try again.`);
  }
  return list;
}
function keep(p, file, row) {
  const id = ++memory.files;
  if (file) blobs.set(id, file);
  p.files.push({ id, round: p.round, ...row });
}
function fileName(p, what, ext) {
  const clean = (s) => s.replace(/[^A-Za-z0-9]+/g, "");
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}_${clean(p.company || p.client)}_${clean(p.name)}_SCA_${what}.${ext}`;
}

/** The same price rules as Catalogue.php. */
function line(raw) {
  const s = services.get(raw?.sid);
  if (!s) throw stop("One of the services in your cart is no longer on the menu. Please remove it and try again.");
  const bad = () => stop(`Please open ${s.name} in your cart and check its options.`);
  const bits = [];
  let unit = s.price;
  (s.opts || []).forEach((g, i) => {
    const c = g.choices[raw.opts?.[i] ?? 0];
    if (!c) throw bad();
    unit += c[1];
    bits.push(c[0]);
  });
  for (const k of new Set(raw.extras || [])) {
    const x = s.extras?.[k];
    if (!x) throw bad();
    unit += x[1];
    bits.push(x[0]);
  }
  let qty = 1;
  if (s.qty) {
    qty = raw.qty;
    if (!Number.isInteger(qty) || qty < s.qty.min || qty > 999) throw bad();
    bits.unshift(`${qty} ${s.qty.label}`);
  }
  const sub = unit * qty;
  let add = 0;
  const chosen = ["project", "unit", "from"].includes(s.unit) ? [...new Set(raw.addons || [])] : [];
  for (const id of chosen) {
    const a = addons.get(id);
    if (!a) throw bad();
    add += a.flat ?? Math.max(a.min, sub * a.pct);
    bits.push(a.name);
  }
  return { s, amount: cents(sub + add), detail: bits.join(" · "), express: chosen.includes("express") };
}

function order(b) {
  if (!b.items?.length) throw stop("Your cart is empty.");
  if (!b.name?.trim() || !/^\S+@\S+\.\S+$/.test(b.email?.trim() || "") || (b.phone || "").replace(/\D/g, "").length < 10) throw stop("Add your name, a valid email and a 10-digit phone number to continue.");
  const gstin = (b.gstin || "").trim().toUpperCase();
  if (gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(gstin)) throw stop("That GSTIN does not look right. Check it, or leave it empty.");
  const orderId = code("ORD");
  let due = 0;
  const made = b.items.map(line).map((l) => {
    const total = cents(l.amount * (1 + catalogue.gst));
    const paid = b.plan === "full" || l.s.unit === "month" ? total : cents(total / 2);
    due += paid;
    const what = { quote: "Quote request received", free: "Free assessment booked" }[l.s.unit] || `${paid >= total ? "Paid in full" : "50% advance paid"} via ${b.method}`;
    return {
      id: code("PRJ"), orderId, sid: l.s.id, name: l.s.name, detail: l.detail, client: b.name.trim(), company: (b.company || "").trim(), email: b.email.trim().toLowerCase(), phone: b.phone,
      created: iso(), due: iso(l.express ? 3 : l.s.days || 7), stage: 0, round: 0, resource: "Unassigned", total, paid, monthly: l.s.unit === "month", quote: l.s.unit === "quote", example: false,
      brief: null, files: [], messages: [], log: [[iso(), what]],
    };
  });
  memory.projects.unshift(...made.toReversed());
  return { status: "placed", order: { orderId, paid: cents(due), email: b.email.trim().toLowerCase(), ids: made.map((p) => p.id) } };
}

const client = {
  brief(p, b) {
    if (p.stage !== 0) throw stop("The brief for this project is already in.");
    if (!value(b, "goal")) throw stop("Tell us what the work should achieve so we can start.");
    const date = value(b, "date");
    if (date && date < new Date().toLocaleDateString("en-CA")) throw stop("The deadline is in the past. Pick a later date.");
    const up = picked(b, "files[]", 10);
    p.brief = { date, files: [] };
    for (const k of ["goal", "audience", "content", "refs", "assets"]) p.brief[k] = value(b, k);
    up.forEach((f) => keep(p, f, { kind: "brief", name: f.name, status: "sent" }));
    if (date) p.due = new Date(date + "T23:59:59").toISOString();
    p.stage = 1;
    note(p, p.quote ? "Event details shared, discovery call to be scheduled" : "Brief submitted");
  },
  approve(p) {
    const f = pending(p);
    if (!f) throw stop("There is no draft waiting for your review.");
    f.status = "approved";
    p.stage = 5;
    note(p, "Draft approved by client");
  },
  changes(p, b) {
    const text = value(b, "text");
    if (!text) throw stop("Please list the corrections before sending");
    const f = pending(p);
    if (!f) throw stop("There is no draft waiting for your review.");
    f.status = "changes";
    p.round++;
    p.stage = 4;
    p.messages.push({ from: "client", text: "Corrections: " + text, t: iso() });
    note(p, `Corrections requested (round ${p.round} of ${ROUNDS})${p.round > ROUNDS ? ", extra round to be costed" : ""}`);
  },
  balance(p) {
    if (p.stage !== 5 || p.total - p.paid <= 1) throw stop("There is no balance to pay on this project.");
    p.paid = p.total;
    note(p, "Balance paid");
  },
  complete: (p) => finish(p, null),
  messages: (p, b) => say(p, b, "client"),
};
const studio = {
  advance(p, b) {
    const draft = p.stage === 2 || (p.stage === 4 && !pending(p));
    if (p.stage === 0 && p.quote) {
      p.stage = 1;
      note(p, "Discovery call done, proposal sent");
    } else if (p.stage === 1) {
      p.stage = 2;
      note(p, `Production started (${p.resource})`);
    } else if (draft) {
      const [f] = picked(b, "file", 1);
      const n = 1 + p.files.filter((x) => x.kind === "draft").length;
      keep(p, f, { kind: "draft", name: fileName(p, "D" + n, f ? ending(f.name) : "pdf"), status: "pending" });
      note(p, p.stage === 2 ? "First cut shared for review" : `Draft ${n} shared for review`);
      if (p.stage === 2) p.stage = 3;
    } else {
      throw stop("This project is waiting for the client.");
    }
  },
  assign(p, b) {
    if (!catalogue.team.includes(b.resource)) throw stop("That person is not on the team list.");
    p.resource = b.resource;
    note(p, `Assigned to ${b.resource}`);
  },
  complete: (p, b) => finish(p, picked(b, "file", 1)[0]),
  messages: (p, b) => say(p, b, "studio"),
};
function finish(p, file) {
  if (p.stage !== 5 || p.total - p.paid > 1) throw stop("Final files are released once the work is approved and the balance is paid.");
  const last = p.files.findLast((f) => f.status === "approved");
  const body = file || blobs.get(last?.id);
  keep(p, body, { kind: "final", name: fileName(p, "Final", body ? ending(body.name) : "zip"), status: "final" });
  p.stage = 6;
  note(p, "Final files delivered, project closed");
}
function say(p, b, from) {
  const text = value(b, "text");
  if (!text) throw stop("Write a message first.");
  p.messages.push({ from, text, t: iso() });
}

export default function call(method, path, body) {
  const db = open();
  if (path === "/catalogue") return catalogue;
  if (path === "/session" || path.startsWith("/auth/")) return { user: null, orders: db.projects.filter((p) => !p.example).length };
  if (path === "/projects") return db.projects.map(shape);
  if (path === "/studio/projects") return db.projects.toSorted((a, b) => a.example - b.example).map(shape);
  if (path === "/orders") {
    const r = order(body);
    save();
    return r;
  }
  if (path === "/studio/examples/clear") {
    db.projects = db.projects.filter((p) => !p.example);
    save();
    return db.projects.map(shape);
  }
  const [, desk, id, what] = path.match(/^(\/studio)?\/projects\/(PRJ-\w+)\/(\w+)$/) || [];
  const p = db.projects.find((x) => x.id === id);
  const step = (desk ? studio : client)[what];
  if (!p || !step || method !== "POST") throw stop("We could not find this project.", 404);
  step(p, body);
  save();
  return shape(p);
}

const urls = new Map();
export function blobUrl(id) {
  if (!blobs.has(id)) return "#portal";
  if (!urls.has(id)) urls.set(id, URL.createObjectURL(blobs.get(id)));
  return urls.get(id);
}
