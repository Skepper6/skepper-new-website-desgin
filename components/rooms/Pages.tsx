import { CATS, cat, countIn, priceText, svc, timeText, type CategoryId } from "@/lib/catalogue";
import { SLink } from "@/lib/site";
import { tint } from "@/lib/theme";
import { Order } from "../flow/Bits";
import { Icon } from "../Icon";
import { Closer } from "../show/Closer";
import { AboutBody, Depts, ServiceBody, ServicesOf } from "../show/Pages";
import { GlassPiece } from "./GlassPiece";

export function RoomPage({ dept }: { dept: CategoryId }) {
  const c = cat(dept);
  const next = CATS[(CATS.findIndex((x) => x.id === dept) + 1) % CATS.length];
  return (
    <div className="in-room" style={{ ["--tint" as string]: tint(dept) }}>
      <header className="in-top">
        <GlassPiece dept={dept} />
        <span className="room-ghost" aria-hidden="true">{c.short}</span>
        <h1>{c.name}</h1>
        <p className="t-lead">{c.blurb}</p>
        <p className="in-count">{countIn(dept)} services</p>
      </header>
      <ServicesOf dept={dept} />
      <Depts skip={dept} title={<>Next room, <b>{next.name}</b></>} />
      <Closer />
    </div>
  );
}

export function ServicePage({ sid }: { sid: string }) {
  const s = svc(sid)!;
  const c = cat(s.cat);
  return (
    <div className="in-room" style={{ ["--tint" as string]: tint(s.cat) }}>
      <header className="in-top in-svc">
        <GlassPiece dept={s.cat} x={74} size={0.92} />
        <p><SLink className="pill" href={`/room/${c.id}/`}><Icon name="back" /> {c.name}</SLink></p>
        <h1>{s.name}</h1>
        <p className="t-lead">{s.desc}</p>
        <p className="in-price num">{priceText(s)}<small>{timeText(s)}</small></p>
        <Order sid={s.id} className="cta cta-arrow">{s.unit === "quote" ? "Request a quote" : "Set it up"} <i><Icon name="arrow" /></i></Order>
      </header>
      <ServiceBody sid={sid} />
      <Closer />
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="about">
      <header className="about-top">
        <div className="about-say">
          <h1>Why I built <b>Skepper</b></h1>
          <p className="t-lead">Skepper isn’t an agency. It’s a studio, built to go deep, not wide.</p>
          <p>I, Binoy, created Skepper not to chase volume, but to pursue value. In an industry where pitches are often louder than the purpose behind them, I wanted to create a space where every brand we touch becomes stronger, clearer, and more human.</p>
        </div>
        <div className="about-face"><img src="/brand/binoy.webp" alt="Binoy Sundhar Parakat, founder and CEO, with a mug in hand" width={1400} height={1750} /></div>
      </header>
      <AboutBody />
    </div>
  );
}
