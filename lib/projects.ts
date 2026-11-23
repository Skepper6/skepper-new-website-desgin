import { GST, ROUNDS, svc } from "./catalogue";
import { addDays, uid } from "./format";
import { describe, priceOf, type CartItem } from "./pricing";

export const STAGES = ["Brief", "Kick-off", "In production", "First cut", "Corrections", "Final delivery", "Completed"] as const;
export const TEAM = ["Unassigned", "Senior Graphic Designer 1", "Senior Graphic Designer 2", "Web Developer", "Client Service Manager", "Creative Director"];

export type FileStatus = "pending" | "changes" | "approved" | "final";
export type ProjectFile = { name: string; round: number; status: FileStatus; final?: boolean };
export type Message = { from: "client" | "studio"; text: string; t: string };
export type Brief = { goal: string; audience: string; content: string; refs: string; assets: string; date: string; files?: string[] };
export type Project = {
  id: string; orderId: string; sid: string; name: string; detail: string;
  client: string; company: string; email: string; phone?: string;
  created: string; due: string; stage: number; round: number; resource: string;
  total: number; paid: number; monthly?: boolean; quote?: boolean; example?: boolean;
  brief: Brief | null; files: ProjectFile[]; messages: Message[]; log: [string, string][];
};
export type Contact = { name: string; company: string; email: string; phone: string; gstin: string; city: string };
export type ProjectAction =
  | { type: "approve" }
  | { type: "changes"; text: string }
  | { type: "payBalance" }
  | { type: "complete" }
  | { type: "advance" }
  | { type: "brief"; brief: Brief }
  | { type: "message"; from: "client" | "studio"; text: string }
  | { type: "assign"; resource: string };

const iso = (d: Date) => d.toISOString();
const log = (p: Project, text: string): Project["log"] => [...p.log, [iso(new Date()), text]];
export const pendingFile = (p: Project) => p.files.find((f) => f.status === "pending");
export const balanceOf = (p: Project) => Math.max(0, p.total - p.paid);

export function fileName(p: Project, n: number | "Final") {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const clean = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
  const tail = n === "Final" ? "Final.zip" : `D${n}.pdf`;
  return `${mm}${d.getFullYear()}_${clean(p.company || p.client)}_${clean(p.name)}_SCA_${tail}`;
}

export function reduceProject(p: Project, a: ProjectAction): Project {
  const now = iso(new Date());
  const pending = pendingFile(p);
  const setPending = (status: FileStatus) => p.files.map((f) => (f === pending ? { ...f, status } : f));
  switch (a.type) {
    case "approve":
      if (!pending) return p;
      return { ...p, files: setPending("approved"), stage: 5, log: log(p, "Draft approved by client") };
    case "changes": {
      if (!pending || !a.text.trim()) return p;
      const round = p.round + 1;
      return {
        ...p, round, stage: 4, files: setPending("changes"),
        messages: [...p.messages, { from: "client", text: "Corrections: " + a.text.trim(), t: now }],
        log: log(p, `Corrections requested (round ${round} of ${ROUNDS})${round > ROUNDS ? ", extra round to be costed" : ""}`),
      };
    }
    case "payBalance":
      return { ...p, paid: p.total, log: log(p, "Balance paid") };
    case "complete":
      if (p.stage === 6) return p;
      return {
        ...p, stage: 6,
        files: [...p.files, { name: fileName(p, "Final"), round: p.round, status: "final", final: true }],
        log: log(p, "Final files delivered, project closed"),
      };
    case "brief": {
      const due = a.brief.date ? iso(new Date(a.brief.date)) : p.due;
      return { ...p, brief: a.brief, due, stage: 1, log: log(p, p.quote ? "Event details shared, discovery call to be scheduled" : "Brief submitted") };
    }
    case "message":
      if (!a.text.trim()) return p;
      return { ...p, messages: [...p.messages, { from: a.from, text: a.text.trim(), t: now }] };
    case "assign":
      return { ...p, resource: a.resource, log: log(p, `Assigned to ${a.resource}`) };
    case "advance": {
      const draft = (): ProjectFile[] => [...p.files, { name: fileName(p, p.files.length + 1), round: p.round, status: "pending" }];
      if (p.stage === 0 && p.quote) return { ...p, stage: 1, log: log(p, "Discovery call done, proposal sent") };
      if (p.stage === 1) return { ...p, stage: 2, log: log(p, `Production started (${p.resource})`) };
      if (p.stage === 2) return { ...p, stage: 3, files: draft(), log: log(p, "First cut shared for review") };
      if (p.stage === 4 && !pending) return { ...p, files: draft(), log: log(p, `Draft ${p.files.length + 1} shared for review`) };
      return p;
    }
  }
}

export function projectsFromCart(cart: CartItem[], c: Contact, full: boolean, method: string) {
  const now = new Date();
  const orderId = uid("ORD");
  const projects = cart.flatMap((it): Project[] => {
    const s = svc(it.sid);
    if (!s) return [];
    const g = priceOf(it).total * (1 + GST);
    const paid = s.unit === "month" || full ? g : g / 2;
    const express = it.addons.includes("express");
    const first = s.unit === "quote" ? "Quote request received" : s.unit === "free" ? "Free assessment booked" : `${paid >= g ? "Paid in full" : "50% advance paid"} via ${method}`;
    return [{
      id: uid("PRJ"), orderId, sid: s.id, name: s.name, detail: describe(it), client: c.name, company: c.company, email: c.email, phone: c.phone,
      created: iso(now), due: iso(addDays(now, express ? 3 : s.days || 7)), stage: 0, round: 0, resource: "Unassigned", total: g, paid,
      monthly: s.unit === "month", quote: s.unit === "quote", brief: null, files: [], messages: [], log: [[iso(now), first]],
    }];
  });
  return { orderId, projects };
}

export type Tone = "wait" | "work" | "review" | "done";
export function statusOf(p: Project): { label: string; tone: Tone } {
  if (p.stage === 0) return { label: p.quote ? "Discovery call" : "Brief needed", tone: "wait" };
  if (p.stage === 6) return { label: "Completed", tone: "done" };
  if (pendingFile(p)) return { label: "Awaiting your review", tone: "review" };
  if (p.stage === 5) return { label: p.paid < p.total - 1 ? "Balance due" : "Ready", tone: "review" };
  return { label: STAGES[p.stage], tone: "work" };
}

export function dueOf(p: Project, now = new Date()): { label: string; tone: "late" | "soon" | "fine" } | null {
  if (p.stage >= 6 || p.quote) return null;
  const days = Math.ceil((new Date(p.due).getTime() - now.getTime()) / 864e5);
  if (days < 0) return { label: `${Math.abs(days)} ${days === -1 ? "day" : "days"} late`, tone: "late" };
  if (days === 0) return { label: "Due today", tone: "soon" };
  const d = new Date(p.due).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return { label: "Due " + d, tone: days <= 2 ? "soon" : "fine" };
}

export function seedProjects(): Project[] {
  const t = new Date();
  const at = (n: number) => iso(addDays(t, n));
  return [
    {
      id: "PRJ-DEMO1", orderId: "ORD-DEMO1", sid: "social20", name: "Monthly Plan · Growth", detail: "December content", client: "Aarav Menon", company: "Greenleaf Organics", email: "aarav@example.com", created: at(-12), due: at(3), stage: 4, round: 1, resource: "Senior Graphic Designer 2", total: 53100, paid: 53100, monthly: true, example: true,
      brief: { goal: "Grow Instagram following ahead of the winter range launch", audience: "Urban families, 28 to 45", content: "Winter range, recipes, farm stories", refs: "@goodearth, @thewholetruthfoods", assets: "Have logo & guidelines", date: "" },
      files: [{ name: "Greenleaf_Dec_Calendar_SCA_D1.pdf", round: 0, status: "changes" }, { name: "Greenleaf_Dec_Posts_SCA_D2.pdf", round: 1, status: "pending" }],
      messages: [{ from: "studio", text: "Draft 2 is up with the recipe carousels reworked as you asked.", t: at(-1) }],
      log: [[at(-12), "Order paid in full"], [at(-11), "Brief submitted"], [at(-6), "First cut shared"], [at(-4), "Corrections requested (round 1 of 4)"], [at(-1), "Draft 2 shared for review"]],
    },
    {
      id: "PRJ-DEMO2", orderId: "ORD-DEMO2", sid: "logo", name: "Logo Design", detail: "Signature: 4 concepts + monogram + favicon", client: "Nisha Rao", company: "Kaapi Kottai Café", email: "nisha@example.com", created: at(-4), due: at(3), stage: 2, round: 0, resource: "Senior Graphic Designer 1", total: 41300, paid: 20650, example: true,
      brief: { goal: "Logo for a filter-coffee café in Indiranagar", audience: "Young professionals and students", content: "Name: Kaapi Kottai. Warm, South Indian, not kitsch", refs: "Brass tumblers, old Madras signage", assets: "Starting fresh", date: "" },
      files: [], messages: [], log: [[at(-4), "50% advance paid"], [at(-4), "Brief submitted"], [at(-3), "Kick-off call done"]],
    },
    {
      id: "PRJ-DEMO3", orderId: "ORD-DEMO3", sid: "v30", name: "30-Second Video", detail: "2D motion graphics · Professional voice-over (1 language)", client: "Dr. Suresh Pillai", company: "Pillai Dental Care", email: "suresh@example.com", created: at(-1), due: at(9), stage: 0, round: 0, resource: "Unassigned", total: 60180, paid: 30090, example: true,
      brief: null, files: [], messages: [], log: [[at(-1), "50% advance paid"]],
    },
  ];
}
