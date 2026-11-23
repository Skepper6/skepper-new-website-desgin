"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATS, countIn } from "@/lib/catalogue";
import { COMPANY } from "@/lib/content";
import { deptPic } from "@/lib/pics";
import { NAV, SLink } from "@/lib/site";
import { actions, useStore } from "@/lib/store";
import { tint } from "@/lib/theme";
import { Dialog } from "../Dialog";
import { Icon } from "../Icon";
import { Mark, Wordmark } from "../Mark";

/** A floating bar. It steps aside while you read and comes back when you look for it. */
export function Top() {
  const [open, setOpen] = useState(false);
  const [far, setFar] = useState(false);
  const [away, setAway] = useState(false);
  const n = useStore((s) => s.cart.length);
  const path = usePathname();
  const close = () => setOpen(false);
  useEffect(() => {
    let last = scrollY;
    const see = () => {
      const y = scrollY;
      setFar(y > 40);
      if (Math.abs(y - last) < 8) return;
      setAway(y > last && y > 320);
      last = y;
    };
    see();
    addEventListener("scroll", see, { passive: true });
    return () => removeEventListener("scroll", see);
  }, [path]);
  const on = (h: string) => (path.includes(h) ? "page" : undefined);
  return (
    <header className="nav" data-far={far} data-away={away}>
      <div className="nav-in">
        <SLink href="/" className="nav-logo" aria-label="Skepper, home"><Wordmark /><Mark /></SLink>
        <nav className="nav-links" aria-label="Main">
          {NAV.map(([h, l]) =>
            h === "/services/" ? (
              <div key={h} className="nav-drop">
                <SLink href={h} aria-current={on(h)}>{l}</SLink>
                <div className="mega">
                  {CATS.map((c) => (
                    <SLink key={c.id} href={`/room/${c.id}/`} style={{ ["--tint" as string]: tint(c.id) }}>
                      <img src={deptPic(c.id).src} alt="" width={120} height={120} loading="lazy" />
                      <span><b>{c.name}</b>{countIn(c.id)} services</span>
                    </SLink>
                  ))}
                </div>
              </div>
            ) : (
              <SLink key={h} href={h} aria-current={on(h)}>{l}</SLink>
            ),
          )}
        </nav>
        <div className="nav-act">
          <button type="button" className="nav-cart" onClick={actions.openCart} aria-label={`Your order, ${n} ${n === 1 ? "service" : "services"}`}>
            <Icon name="bag" size={22} />
            {n ? <span className="num">{n}</span> : null}
          </button>
          <button type="button" className="nav-cta" onClick={() => actions.configure("bqa")}>Free brand assessment</button>
          <button type="button" className="nav-menu" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Menu"><Icon name="menu" size={24} /></button>
        </div>
      </div>
      <Dialog open={open} onClose={close} className="sheet" label="Menu">
        <div className="sheet-top">
          <span className="nav-logo"><Wordmark /><Mark /></span>
          <button type="button" className="round" onClick={close} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <div className="sheet-in">
          <nav className="sheet-nav" aria-label="Main">
            {NAV.map(([h, l]) => <SLink key={h} href={h} onClick={close}>{l}</SLink>)}
          </nav>
          <ul className="sheet-depts">
            {CATS.map((c) => (
              <li key={c.id}>
                <SLink href={`/room/${c.id}/`} onClick={close}><img src={deptPic(c.id).src} alt="" width={300} height={300} loading="lazy" /><span>{c.short}</span></SLink>
              </li>
            ))}
          </ul>
          <p className="sheet-foot"><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><a href={`tel:${COMPANY.tel}`}>{COMPANY.phone}</a></p>
        </div>
      </Dialog>
    </header>
  );
}
