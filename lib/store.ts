"use client";
import { useSyncExternalStore } from "react";
import { svc } from "./catalogue";
import { payPlan, type CartItem } from "./pricing";
import { projectsFromCart, reduceProject, seedProjects, type Contact, type Project, type ProjectAction } from "./projects";

/** Same key as the original prototype, so existing carts and projects carry over. */
const KEY = "skepper-store-v1";

export type LastOrder = { orderId: string; ids: string[]; paid: number; email: string };
type State = {
  ready: boolean;
  cart: CartItem[];
  projects: Project[];
  lastOrder: LastOrder | null;
  /** The service being configured in the quick-order dialog. */
  editing: { sid: string; index: number | null } | null;
  cartOpen: boolean;
  say: string;
};
const initial: State = { ready: false, cart: [], projects: [], lastOrder: null, editing: null, cartOpen: false, say: "" };

let state = initial;
const subs = new Set<() => void>();

function set(patch: Partial<State>, persist = false) {
  state = { ...state, ...patch };
  if (persist) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ cart: state.cart, projects: state.projects, lastOrder: state.lastOrder }));
    } catch {
      /* private mode or full storage: the session still works in memory */
    }
  }
  subs.forEach((f) => f());
}

/** Drop anything that no longer matches the catalogue, and fill fields older carts lack. */
export function cleanCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((x): CartItem[] => {
    const s = x && typeof x.sid === "string" ? svc(x.sid) : undefined;
    if (!s) return [];
    return [{
      sid: s.id,
      qty: s.qty ? Math.max(s.qty.min, Number(x.qty) || s.qty.min) : 1,
      opts: (s.opts ?? []).map((g, i) => (g.choices[x.opts?.[i]] ? x.opts[i] : 0)),
      extras: (Array.isArray(x.extras) ? x.extras : []).filter((i: number) => s.extras?.[i]),
      addons: Array.isArray(x.addons) ? x.addons : [],
    }];
  });
}

function load() {
  if (state.ready) return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      set({ ready: true, cart: cleanCart(d.cart), projects: Array.isArray(d.projects) ? d.projects : [], lastOrder: d.lastOrder ?? null });
      return;
    }
  } catch {
    /* unreadable storage falls through to the examples */
  }
  set({ ready: true, projects: seedProjects() });
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY || !e.newValue) return;
  try {
    const d = JSON.parse(e.newValue);
    set({ cart: cleanCart(d.cart), projects: d.projects ?? [], lastOrder: d.lastOrder ?? null });
  } catch {
    /* ignore a half-written value */
  }
}

function subscribe(f: () => void) {
  if (subs.size === 0) window.addEventListener("storage", onStorage);
  subs.add(f);
  if (!state.ready) queueMicrotask(load);
  return () => {
    subs.delete(f);
    if (subs.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useStore<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => pick(state), () => pick(initial));
}

export const actions = {
  configure(sid: string, index: number | null = null) {
    set({ editing: { sid, index }, cartOpen: false });
  },
  closeConfigure() {
    set({ editing: null });
  },
  openCart() {
    set({ cartOpen: true, editing: null });
  },
  closeCart() {
    set({ cartOpen: false });
  },
  addToCart(item: CartItem, index: number | null = null) {
    const replace = index != null && state.cart[index];
    const cart = replace ? state.cart.map((x, i) => (i === index ? item : x)) : [...state.cart, item];
    const name = svc(item.sid)?.name ?? "Item";
    set({ cart, editing: null, cartOpen: true, say: replace ? `${name} updated in your order` : `${name} added to your order` }, true);
  },
  removeLine(i: number) {
    const name = svc(state.cart[i]?.sid ?? "")?.name ?? "Item";
    set({ cart: state.cart.filter((_, n) => n !== i), say: `${name} removed from your order` }, true);
  },
  placeOrder(contact: Contact, full: boolean, method: string) {
    const { orderId, projects } = projectsFromCart(state.cart, contact, full, method);
    const lastOrder = { orderId, ids: projects.map((p) => p.id), paid: payPlan(state.cart, full).now, email: contact.email };
    set({ projects: [...projects, ...state.projects], lastOrder, cart: [], cartOpen: false }, true);
  },
  project(id: string, a: ProjectAction) {
    set({ projects: state.projects.map((p) => (p.id === id ? reduceProject(p, a) : p)) }, true);
  },
  clearExamples() {
    set({ projects: state.projects.filter((p) => !p.example), say: "Example projects removed" }, true);
  },
};
