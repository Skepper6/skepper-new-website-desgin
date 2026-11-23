"use client";
import { CATS } from "@/lib/catalogue";
import { COMPANY } from "@/lib/content";
import { NAV, SLink } from "@/lib/site";
import { Icon } from "../Icon";
import { Mark, Wordmark } from "../Mark";

export function End() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-call">
          <h2>Tell us what you are <b>building</b></h2>
          <a className="foot-mail" href={`mailto:${COMPANY.email}`}><span>{COMPANY.email}</span><i><Icon name="arrow" size={26} /></i></a>
        </div>
        <div className="foot-cols">
          <nav aria-label="Site"><h3>Studio</h3>{NAV.map(([h, l]) => <SLink key={h} href={h}>{l}</SLink>)}</nav>
          <nav aria-label="Departments" className="foot-two"><h3>Departments</h3><div>{CATS.map((c) => <SLink key={c.id} href={`/room/${c.id}/`}>{c.name}</SLink>)}</div></nav>
          <div className="foot-where">
            <h3>Visit</h3>
            <p>{COMPANY.name}<br /><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`} target="_blank" rel="noopener">{COMPANY.address}</a></p>
            <p><a href={`tel:${COMPANY.tel}`}>{COMPANY.phone}</a><br />{COMPANY.hours}</p>
            <p className="foot-soc">
              <a href="https://www.instagram.com/the_skepper/" target="_blank" rel="noopener">Instagram</a>
              <a href="https://www.linkedin.com/company/skeppercreative/" target="_blank" rel="noopener">LinkedIn</a>
            </p>
          </div>
        </div>
        <div className="foot-big" aria-hidden="true"><Wordmark /><Mark /></div>
        <div className="foot-legal">
          <p>GSTIN {COMPANY.gstin}</p>
          <p>Prototype store: payments are simulated and projects are saved in this browser only.</p>
          <p><SLink href="/terms/">Order terms</SLink><SLink href="/privacy/">Privacy</SLink></p>
        </div>
      </div>
    </footer>
  );
}
