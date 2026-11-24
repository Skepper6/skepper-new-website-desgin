import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { Cross, Layer } from "./Bits";

const SITE = "https://www.theskepper.com";
// The same menu as the main site, so the store feels like one of its pages.
const MENU = [
  ["About Us", SITE + "/about-us"],
  ["Services", [["Brand Strategy", SITE + "/brand-strategy-service"], ["Design And Identity", SITE + "/design-and-identity-service"], ["Digital Brand Building", SITE + "/digital-brand-building-service"], ["Video And Content", SITE + "/video-and-content-service"], ["Pharma & Healthcare", SITE + "/pharma-healthcare-service"]]],
  ["Subscription Services", [["Pharma Creative", SITE + "/pharma-creative-pods"], ["Branded Stationery", SITE + "/brand-stationery-subscription"], ["Design Support", SITE + "/design-support-pods"], ["Video And Content Subscription", SITE + "/video-and-content-subscription-pods"], ["Website Maintenance", SITE + "/website-maintenance-service"]]],
  ["Membership & Community", [["MasterClasses", SITE + "/masterclasses"], ["Bootcamp", SITE + "/bootcamp-mentorship"], ["Events & Retreat", SITE + "/retreat"], ["Mentorship", SITE + "/mentorship"]]],
  ["Work & Insights", [["AI at Skepper", SITE + "/ai-at-service"], ["Blogs", "https://blog.theskepper.com"], ["Portfolio", "https://portfolio.theskepper.com/"]]],
  ["Awards", "https://skepper.in/awards"],
  ["Case Studies", "https://portfolio.theskepper.com/"],
  ["Contact Us", SITE + "/contact-us"],
];
export const TABS = [["shop", "Services"], ["portal", "My Projects"], ["studio", "Studio Board"]];

function Tabs() {
  const { view } = useStore();
  return (
    <nav className="tabs" aria-label="Store">
      {TABS.map(([v, l]) => <a key={v} href={"#" + v} className={view === v ? "on" : ""} aria-current={view === v ? "page" : undefined}>{l}</a>)}
    </nav>
  );
}

function SiteMenu({ onClose }) {
  const [open, setOpen] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const close = () => setLeaving(true);
  // The panel rolls back up before it is taken away.
  useEffect(() => {
    if (!leaving) return undefined;
    const t = setTimeout(onClose, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700);
    return () => clearTimeout(t);
  }, [leaving, onClose]);
  return (
    <Layer className={"sitemenu" + (leaving ? " leaving" : "")} label="Menu" onClose={close}>
      <div className="bar">
        <a className="logo" href={SITE} aria-label="Skepper, main site"><img src="./logo.svg" alt="Skepper" width="151" height="42" /></a>
        <span className="spacer" />
        <div className="links">
          <a href="https://www.linkedin.com/company/skeppercreative/" target="_blank" rel="noopener">Linkedin</a>
          <a href="https://www.instagram.com/the_skepper/" target="_blank" rel="noopener">Instagram</a>
        </div>
        <button type="button" className="menubtn" onClick={close}><span>Menu</span><i><Cross /></i></button>
      </div>
      <div className="sitemenu-in">
        <ul>
          {MENU.map(([l, to], i) => (
            <li key={l} style={{ "--i": i }}>
              {Array.isArray(to) ? (
                <>
                  <button type="button" aria-expanded={open === l} aria-controls={"sm" + i} onClick={() => setOpen(open === l ? null : l)}>{l}<b aria-hidden="true" /></button>
                  <div className="fold" id={"sm" + i} data-open={open === l}><ul>{to.map(([x, h]) => <li key={x}><a href={h}>{x}</a></li>)}</ul></div>
                </>
              ) : (
                <a href={to}>{l}</a>
              )}
            </li>
          ))}
          <li className="only-phone" style={{ "--i": MENU.length }}><a href="https://brewyourbrand.in/brandselfauditkit">Get a Quick Brand Assessment</a></li>
        </ul>
        <div className="touch">
          <h2>Get In Touch</h2>
          <div className="reach"><i><img src="./icons/call.svg" alt="" width="25" height="25" /></i><p><span>Call Us</span><a href="tel:+918150002200">+91 8150 00 22 00</a></p></div>
          <div className="reach"><i><img src="./icons/mail.svg" alt="" width="29" height="21" /></i><p><span>Email Us</span><a href="mailto:binu@theskepper.com">binu@theskepper.com</a></p></div>
          <div className="reach"><i><img src="./icons/pin.svg" alt="" width="40" height="28" /></i><p><span>Find Us</span><b>S003, Devin Indira Paradise, Chokkanahalli, Bengaluru 560063</b></p></div>
        </div>
      </div>
    </Layer>
  );
}

export function Header() {
  const { cart, layer, setLayer } = useStore();
  const shut = useCallback(() => setLayer(null), [setLayer]);
  const btn = useRef(null);
  const n = useRef(cart.length);
  useEffect(() => {
    if (cart.length > n.current && btn.current) {
      btn.current.classList.remove("bump");
      void btn.current.offsetWidth;
      btn.current.classList.add("bump");
    }
    n.current = cart.length;
  }, [cart.length]);
  return (
    <>
      <header>
        <div className="bar">
          <a className="logo" href={SITE} aria-label="Skepper, main site"><img src="./logo.svg" alt="Skepper" width="151" height="42" /></a>
          <a className="logo-name" href="#shop">Service Store</a>
          <Tabs />
          <span className="spacer" />
          <div className="links">
            <a href="https://www.linkedin.com/company/skeppercreative/" target="_blank" rel="noopener">Linkedin</a>
            <a href="https://www.instagram.com/the_skepper/" target="_blank" rel="noopener">Instagram</a>
          </div>
          <button type="button" ref={btn} className="cartbtn" onClick={() => setLayer({ type: "cart" })} aria-label={`Open cart, ${cart.length} ${cart.length === 1 ? "item" : "items"}`}><span className="lbl">Cart</span><span className="count num">{cart.length}</span></button>
          <button type="button" className="menubtn" onClick={() => setLayer({ type: "menu" })} aria-expanded={layer?.type === "menu"}><span>Menu</span><i><svg width="18" height="14" viewBox="0 0 18 14" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M0 1h18M0 7h18M0 13h18" /></svg></i></button>
        </div>
      </header>
      {layer?.type === "menu" ? <SiteMenu onClose={shut} /> : null}
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="foot-grid">
        <div>
          <img src="./logo.svg" alt="Skepper" width="145" height="40" />
          <p>Skepper Creative Agency Pvt Ltd<br />S003, Devin Indira Paradise, Chokkanahalli, Bengaluru 560063<br />GSTIN 29AAXCS6226J1ZI</p>
        </div>
        <nav aria-label="Service store">
          <h2>Service store</h2>
          {TABS.map(([v, l]) => <a key={v} href={"#" + v}>{l}</a>)}
        </nav>
        <div>
          <h2>Get in touch</h2>
          <a href="mailto:binu@theskepper.com">binu@theskepper.com</a>
          <a href="tel:+918150002200">+91 8150 00 22 00</a>
          <span>Mon to Sat, 10 am to 7 pm</span>
        </div>
      </div>
      <div className="foot-end">
        <span>© {new Date().getFullYear()} Skepper Creative. All rights reserved.</span>
        <span><a href={SITE + "/privacy-policy"}>Privacy Policy</a><i>|</i><a href={SITE + "/agreement"}>Terms Condition</a></span>
      </div>
    </footer>
  );
}

/** The dark top of every inner page, with the site’s blue light behind it. */
export const PageHead = ({ title, children, side }) => (
  <section className="pagehead"><div className="wrap"><div><h1>{title}</h1>{children ? <p>{children}</p> : null}</div>{side}</div></section>
);
