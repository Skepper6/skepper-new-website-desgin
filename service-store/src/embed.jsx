// The whole store inside another website (Webflow): one place on the page, the same screens as the store's own site.
// It lives in a shadow root, so neither side's styles reach the other. Whatever the page has in that place
// (the still version drawn in Webflow) is covered while the store runs, and shows again if the store cannot load.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Portal, Studio } from "./components/Boards";
import Cart from "./components/Cart";
import { Checkout, Thanks } from "./components/Checkout";
import { StoreBar } from "./components/Frame";
import Service from "./components/Service";
import Shop from "./components/Shop";
import { StoreProvider, useStore, VIEWS } from "./lib/store";
import css from "./styles.css?inline";

const VIEW = { shop: Shop, checkout: Checkout, thanks: Thanks, portal: Portal, studio: Studio };
const place = () => document.getElementById("skepper-store");

const OWN = `
.app { all: initial; display: block; background: #000; color: var(--ink); font: 400 var(--f16) / 1.75 "Poppins", sans-serif; color-scheme: light; -webkit-font-smoothing: antialiased; }
.barline { position: sticky; top: var(--nav, 0px); z-index: 40; }
.app { --head: calc(var(--nav, 0px) + var(--barh, 66px)); }
.filters { scroll-margin-top: var(--head); }
#results { scroll-margin-top: calc(var(--head) + 92px); }
.cathead { top: calc(var(--head) + 128px); }
main { outline: none; }
`;
function sheet() {
  const s = new CSSStyleSheet();
  s.replaceSync(
    css
      .replace(/:root\b/g, ":host")
      .replace(/^html\.locked \{[^}]*\}/m, "")
      .replace(/^html \{[^}]*\}/m, "")
      .replace(/^ {2}html \{[^}]*\}/m, "")
      .replace(/^body {[^}]*}/m, "") + OWN,
  );
  return s;
}

let live = null;

/** The website's header stays at the top. Our bar sits under it, and everything sticky starts below both. */
function measure() {
  if (!live) return;
  const nav = document.querySelector(".rt-navbar-v1");
  const pinned = nav && /fixed|sticky/.test(getComputedStyle(nav).position);
  live.app.style.setProperty("--nav", (pinned ? Math.round(nav.getBoundingClientRect().height) : 0) + "px");
  live.app.style.setProperty("--barh", (live.app.querySelector(".barline")?.offsetHeight || 66) + "px");
}

function Embed() {
  const { menu, fail, load, view, layer } = useStore();
  const View = VIEW[view];
  useEffect(measure, [menu, view]);
  return (
    <>
      <div className="barline"><StoreBar /></div>
      <main tabIndex={-1}>
        {menu ? <View /> : <div className="boot">{fail ? <><p>{fail}</p><button type="button" className="btn" onClick={load}>Try again</button></> : <p role="status">Loading</p>}</div>}
      </main>
      {menu && layer?.type === "service" ? <Service key={layer.id + layer.edit} id={layer.id} edit={layer.edit} /> : null}
      {menu && layer?.type === "cart" ? <Cart /> : null}
    </>
  );
}

/** "#portal" and the like are our own screens, not places on the page around us. */
function links(e) {
  const a = e.target.closest?.('a[href^="#"]');
  const v = a?.getAttribute("href").slice(1);
  if (!a || !VIEWS.includes(v)) return;
  e.preventDefault();
  dispatchEvent(new CustomEvent("skepper-go", { detail: v }));
}

/** Puts the store on the page, and again whenever the page around it is redrawn (Webflow's preview draws late, and redraws). */
function sync() {
  const el = place();
  if (live && (el !== live.el || !el.isConnected)) {
    live.root.unmount();
    live.watch.disconnect();
    live = null;
  }
  if (live || !el) return;
  let shadow = el.shadowRoot;
  if (!shadow) {
    shadow = el.attachShadow({ mode: "open" });
    shadow.addEventListener("click", links);
  }
  shadow.adoptedStyleSheets = [sheet()];
  const app = document.createElement("div");
  app.className = "app";
  shadow.replaceChildren(app);
  const root = createRoot(app);
  const watch = new ResizeObserver(measure);
  live = { el, app, root, watch };
  root.render(<StoreProvider><Embed /></StoreProvider>);
  for (const x of [document.documentElement, document.querySelector(".rt-navbar-v1")]) if (x) watch.observe(x);
  document.documentElement.classList.remove("sks-wait");
  measure();
}

if (!window.__skepperStore) {
  window.__skepperStore = true;
  const lock = document.createElement("style");
  lock.textContent = "html.locked{overflow:hidden;scrollbar-gutter:stable}";
  document.head.append(lock);
  let due = false;
  const look = () => {
    if (due) return;
    due = true;
    setTimeout(() => {
      due = false;
      sync();
    }, 60);
  };
  new MutationObserver(look).observe(document.documentElement, { childList: true, subtree: true });
  sync();
}
