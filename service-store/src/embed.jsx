// The store inside another website (Webflow). The page's own sections stay in Webflow; this fills the marked places.
// Every place is a shadow root, so neither side's styles can reach the other.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { Portal, Studio } from "./components/Boards";
import Cart from "./components/Cart";
import { Checkout, Thanks } from "./components/Checkout";
import { StoreBar } from "./components/Frame";
import Service from "./components/Service";
import { Marquee, ServiceMenu, Specials } from "./components/Shop";
import { StoreProvider, useStore } from "./lib/store";
import css from "./styles.css?inline";

const VIEW = { checkout: Checkout, thanks: Thanks, portal: Portal, studio: Studio };
const host = (n) => document.getElementById("skepper-store-" + n);

const OWN = `
:host { display: block; text-align: left; text-transform: none; letter-spacing: normal; }
:host([hidden]) { display: none; }
.filters { scroll-margin-top: var(--head); }
#results { scroll-margin-top: calc(var(--head) + 92px); }
.cathead { top: calc(var(--head) + 128px); }
.boot { min-height: 340px; color: inherit; }
.ticket.specials { min-height: 330px; }
`;
function sheet() {
  const s = new CSSStyleSheet();
  const own = css
    .replace(/:root\b/g, ":host")
    .replace(/^html\.locked \{[^}]*\}/m, "")
    .replace(/^html \{[^}]*\}/m, "")
    .replace(/^ {2}html \{[^}]*\}/m, "")
    .replace(/^body \{[^}]*\}/m, ':host { color: var(--ink); font: 400 var(--f16) / 1.75 "Poppins", sans-serif; -webkit-font-smoothing: antialiased; }');
  s.replaceSync(own + OWN);
  return s;
}

function open(styles) {
  const slots = {};
  for (const n of ["bar", "specials", "marquee", "menu", "view"]) {
    const el = host(n);
    if (!el) continue;
    const root = el.shadowRoot || el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [styles];
    slots[n] = document.createElement("div");
    root.replaceChildren(slots[n]);
  }
  return slots;
}

/** The site's header stays at the top, our bar sits under it, and everything sticky starts below both. */
function measure() {
  const nav = document.querySelector(".rt-navbar-v1");
  const pinned = nav && /fixed|sticky/.test(getComputedStyle(nav).position);
  const top = pinned ? Math.round(nav.getBoundingClientRect().height) : 0;
  const bar = host("bar");
  if (bar) bar.style.top = top + "px";
  const head = top + (bar ? bar.offsetHeight : 0);
  for (const n of ["specials", "marquee", "menu", "view"]) host(n)?.style.setProperty("--head", head + "px");
}

function Wait() {
  const { fail, load } = useStore();
  return <div className="boot">{fail ? <><p>{fail}</p><button type="button" className="btn" onClick={load}>Try again</button></> : <p role="status">Loading</p>}</div>;
}

function Embed({ slots }) {
  const { menu, view, layer, setLayer } = useStore();
  const shop = view === "shop";
  useEffect(() => {
    const el = host("shop");
    if (el) el.style.display = shop ? "" : "none";
    measure();
  }, [shop]);
  useEffect(() => {
    // Buttons that live in Webflow: data-store="menu" or data-store="open:bqa"
    const click = (e) => {
      const to = e.target.closest?.("[data-store]")?.dataset.store;
      if (!to || !menu) return;
      e.preventDefault();
      e.stopImmediatePropagation(); // Webflow has its own scrolling for # links
      if (to.startsWith("open:")) {
        if (menu.svc(to.slice(5))) setLayer({ type: "service", id: to.slice(5) });
      } else {
        const el = host("menu");
        const top = el.getBoundingClientRect().top + scrollY - parseFloat(el.style.getPropertyValue("--head"));
        scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [menu, setLayer, slots]);
  const View = VIEW[view];
  return (
    <>
      {slots.bar ? createPortal(<StoreBar />, slots.bar) : null}
      {menu && slots.specials ? createPortal(<Specials />, slots.specials) : null}
      {menu && slots.marquee ? createPortal(<Marquee />, slots.marquee) : null}
      {slots.menu ? createPortal(menu ? <ServiceMenu /> : <Wait />, slots.menu) : null}
      {View ? (menu ? <View /> : <Wait />) : null}
      {menu && layer?.type === "service" ? <Service key={layer.id + layer.edit} id={layer.id} edit={layer.edit} /> : null}
      {menu && layer?.type === "cart" ? <Cart /> : null}
    </>
  );
}

function start() {
  if (!host("view") || host("view").shadowRoot) return;
  const lock = document.createElement("style");
  lock.textContent = "html.locked{overflow:hidden;scrollbar-gutter:stable}";
  document.head.append(lock);
  const slots = open(sheet());
  createRoot(slots.view).render(<StoreProvider><Embed slots={slots} /></StoreProvider>);
  const watch = new ResizeObserver(measure);
  for (const el of [document.documentElement, host("bar"), document.querySelector(".rt-navbar-v1")]) if (el) watch.observe(el);
  measure();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
