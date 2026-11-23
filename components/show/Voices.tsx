"use client";
import { useState } from "react";
import { CLIENTS, QUOTES } from "@/lib/content";
import { Icon } from "../Icon";

const TONE = ["#e6dcf6", "#d3e9fb", "#fbe7b4", "#fcd9d2", "#e9f0bd"];
const LOGO: Record<string, string> = { "SR Seating": "sr-seating", "Novo Nordisk India": "novo-nordisk" };

/** A deck of what clients said. Take the top card and it goes to the back. */
export function Voices() {
  const [top, setTop] = useState(0);
  const n = QUOTES.length;
  const go = (d: number) => setTop((top + d + n) % n);
  const row = (from: number, k: number) => (
    <ul key={k} aria-hidden={k > 0 || undefined}>
      {CLIENTS.slice(from, from + 14).map(([id, name]) => <li key={id}><img src={`/clients/${id}.svg`} alt={k ? "" : name} loading="lazy" /></li>)}
    </ul>
  );
  return (
    <section className="say-so" aria-labelledby="say-h">
      <div className="say-top">
        <div className="say-head">
          <h2 id="say-h">Clients, in <b>their words</b></h2>
          <div className="say-go">
            <button type="button" className="round" onClick={() => go(-1)} aria-label="Previous quote"><Icon name="back" /></button>
            <button type="button" className="round" onClick={() => go(1)} aria-label="Next quote"><Icon name="arrow" /></button>
          </div>
        </div>
        <ul className="deck" aria-live="polite">
          {QUOTES.map((q, i) => {
            const at = (i - top + n) % n;
            return (
              <li key={q.org} data-at={Math.min(at, 4)} aria-hidden={at > 0} style={{ ["--i" as string]: at, ["--bg" as string]: TONE[i], zIndex: n - at }}>
                <blockquote>
                  <p>{q.text}</p>
                  <footer>{LOGO[q.org] ? <img src={`/clients/${LOGO[q.org]}.svg`} alt="" loading="lazy" /> : null}<span><b>{q.org}</b>{q.who}</span></footer>
                </blockquote>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="logos" aria-label="Brands that trust us">
        <div>{[0, 1].map((k) => row(0, k))}</div>
        <div>{[0, 1].map((k) => row(14, k))}</div>
      </div>
    </section>
  );
}
