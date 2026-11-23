import { CATS, cat, priceText, svc, type CategoryId } from "@/lib/catalogue";
import { shard } from "@/lib/mark";
import { svcPic } from "@/lib/pics";
import { SLink } from "@/lib/site";
import { tint } from "@/lib/theme";
import { Order } from "../flow/Bits";
import { Icon } from "../Icon";
import { Closer } from "../show/Closer";
import { AboutBody, Depts, ServiceBody, ServicesOf } from "../show/Pages";
import { ServiceDial } from "./Dials";
import { FilmWords } from "./FilmWords";

export function RoomPage({ dept }: { dept: CategoryId }) {
  const c = cat(dept);
  const next = CATS[(CATS.findIndex((x) => x.id === dept) + 1) % CATS.length];
  return (
    <>
      <h1 className="sr">{c.name}</h1>
      <ServiceDial dept={dept} />
      <div className="in-room" style={{ ["--tint" as string]: tint(dept) }}>
        <div className="split-head room-head"><h2>{c.name}</h2><p>{c.blurb}</p></div>
        <ServicesOf dept={dept} />
        <Depts skip={dept} title={<>Next, <b>{next.name}</b></>} />
      </div>
      <Closer />
    </>
  );
}

export function ServicePage({ sid }: { sid: string }) {
  const s = svc(sid)!;
  const c = cat(s.cat);
  return (
    <div className="disc-page in-room" style={{ ["--c" as string]: shard(c.shard).color, ["--tint" as string]: tint(s.cat) }}>
      <header className="disc-top">
        <figure><img src={svcPic(sid)} alt="" width={820} height={840} /></figure>
        <div>
          <p><SLink className="pill" href={`/room/${c.id}/`}><Icon name="back" /> {c.name}</SLink></p>
          <h1>{s.name}</h1>
          <p className="t-lead">{s.desc}</p>
          <p className="dial-price num">{priceText(s)}</p>
          <Order sid={s.id} className="cta cta-arrow">{s.unit === "quote" ? "Request a quote" : "Set it up"} <i><Icon name="arrow" /></i></Order>
        </div>
      </header>
      <ServiceBody sid={sid} />
      <Closer />
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="about">
      <FilmWords words="WHY I BUILT SKEPPER">
        <p className="t-lead">Skepper isn’t an agency. It’s a studio, built to go deep, not wide.</p>
      </FilmWords>
      <section className="about-top">
        <div className="about-say">
          <h2>Binoy Sundhar <b>Parakat</b></h2>
          <p className="t-lead">I, Binoy, created Skepper not to chase volume, but to pursue value. In an industry where pitches are often louder than the purpose behind them, I wanted to create a space where every brand we touch becomes stronger, clearer, and more human.</p>
        </div>
        <div className="about-face"><img src="/brand/binoy.webp" alt="Binoy Sundhar Parakat, founder and CEO, with a mug in hand" width={1400} height={1750} loading="lazy" /></div>
      </section>
      <AboutBody />
    </div>
  );
}
