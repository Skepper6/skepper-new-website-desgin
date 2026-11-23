import { CATS, cat, countIn, isOneTime, priceText, ROUNDS, SERVICES, svc, timeText, type CategoryId } from "@/lib/catalogue";
import { FOUR_D, VALUES, work } from "@/lib/content";
import { deptPic, svcPic } from "@/lib/pics";
import { SLink } from "@/lib/site";
import { tint } from "@/lib/theme";
import { Order } from "../flow/Bits";
import { Pane } from "../flow/Find";
import { Icon } from "../Icon";
import { Closer } from "./Closer";
import { Count, Film } from "./Studio";

/** The other departments, as a row of pictures. */
export function Depts({ skip, title }: { skip?: CategoryId; title: React.ReactNode }) {
  return (
    <section className="depts" aria-labelledby="depts-h">
      <div className="split-head"><h2 id="depts-h">{title}</h2></div>
      <ul>
        {CATS.filter((c) => c.id !== skip).map((c) => (
          <li key={c.id} style={{ ["--tint" as string]: tint(c.id) }}>
            <SLink href={`/room/${c.id}/`}>
              <img src={deptPic(c.id).src} alt="" width={820} height={840} loading="lazy" />
              <span><b>{c.name}</b>{countIn(c.id)} services</span>
            </SLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServicesOf({ dept }: { dept: CategoryId }) {
  return <ul className="panes">{SERVICES.filter((s) => s.cat === dept).map((s) => <Pane key={s.id} s={s} />)}</ul>;
}

/** Everything one service includes, beside a picture of our work and the price. */
export function ServiceBody({ sid }: { sid: string }) {
  const s = svc(sid)!;
  const c = cat(s.cat);
  const inc = [...s.inc];
  if (isOneTime(s)) inc.push(`Up to ${ROUNDS} rounds of corrections`, "Project tracking in your client portal");
  if (s.unit === "month") inc.push("Billed monthly in advance, cancel with 30 days’ notice");
  const pay = s.unit === "free" || s.unit === "quote" ? "Nothing to pay now." : s.unit === "month" ? "Paid monthly, in advance." : "Start with a 50% advance.";
  const when = s.unit === "month" ? "Work runs on a monthly cycle." : s.days ? `Typical delivery is ${s.days} working days after your brief.` : "Timeline agreed after the discovery call.";
  const more = SERVICES.filter((x) => x.cat === s.cat && x.id !== s.id);
  return (
    <>
      <section className="get" aria-labelledby="what-h">
        <figure className="get-pic"><img src={svcPic(sid)} alt="" width={820} height={840} loading="lazy" /><figcaption className="num">{priceText(s)}<small>{timeText(s)}</small></figcaption></figure>
        <div className="get-say">
          <h2 id="what-h">What <b>you get</b></h2>
          <ul>{inc.map((x) => <li key={x}><i><Icon name="check" size={18} /></i>{x}</li>)}</ul>
          <p>{when} {pay} Prices exclude 18% GST.</p>
          <Order sid={s.id} className="cta cta-arrow">{s.unit === "quote" ? "Request a quote" : "Set it up"} <i><Icon name="arrow" /></i></Order>
        </div>
      </section>
      <section className="more" aria-labelledby="more-h">
        <div className="split-head"><h2 id="more-h">Also in <b>{c.short}</b></h2><SLink className="pill" href={`/room/${c.id}/`}>All {countIn(c.id)} services <Icon name="arrow" /></SLink></div>
        <ul className="panes panes-run">{more.map((x) => <Pane key={x.id} s={x} />)}</ul>
      </section>
    </>
  );
}

const STORY = [
  "My story begins in a small design studio in the 90s, the kind with the smell of ink, the hum of printers, and the quiet intensity of handwork. I was just a teenager then, spending weekends in my uncle’s studio surrounded by airbrushes, layout boards, and stacks of Letraset sheets. That space was my first creative classroom.",
  "It wasn’t just about learning design. It was about witnessing dedication. My uncle didn’t clock in and out. He lived his art. And that made something click in me: creativity is not a department. It’s a calling.",
  "Years later, after working in design, advertising, and branding across industries, I felt a recurring frustration. Most agencies were machines. Projects came in, ideas went out, and no one remembered the why. That’s when I decided to start Skepper. Not to become the biggest, but to stay the most honest.",
  "I wanted to build a place where ideas are brewed, not bought. Where no two brands look alike, because no two stories are the same.",
];
const D_PIC = ["healthium", "land-optimizer", "umc", "lalumar"];
const D_BG = ["#e6dcf6", "#d3e9fb", "#fbe7b4", "#fcd9d2"];
const V_PIC = ["fischer", "argitektur", "sitagliptin", "cicaderm", "saugella"];

export function AboutBody() {
  return (
    <>
      <section className="tale" aria-labelledby="tale-h">
        <div className="tale-pics">
          <img src="/film/crew-1.webp" alt="A shoot being set up" width={1280} height={720} loading="lazy" />
          <img src="/film/crew-2.webp" alt="Setting the lights for a shoot" width={1280} height={720} loading="lazy" />
          <img src="/work/argitektur.webp" alt={work("argitektur").alt} width={820} height={840} loading="lazy" />
        </div>
        <div className="tale-say">
          <h2 id="tale-h">Where it <b>all began</b></h2>
          {STORY.map((t) => <p key={t}>{t}</p>)}
        </div>
      </section>
      <section className="reel-wide"><Film /></section>
      <section className="four" aria-labelledby="four-h">
        <div className="split-head"><h2 id="four-h">The <b>4D process</b></h2><p>We don’t believe in jumping to the brief. We believe in first uncovering the truth.</p></div>
        <ol>
          {FOUR_D.map(([n, t], i) => (
            <li key={n} data-rise style={{ ["--bg" as string]: D_BG[i] }}><img src={`/work/${D_PIC[i]}.webp`} alt="" width={820} height={840} loading="lazy" /><h3>{n}</h3><p>{t}</p></li>
          ))}
        </ol>
      </section>
      <section className="vals" aria-labelledby="vals-h">
        <h2 id="vals-h">What we <b>believe</b></h2>
        <ul>
          {VALUES.map(([n, t], i) => (
            <li key={n}><h3>{n}</h3><p>{t}</p><img src={`/work/${V_PIC[i]}.webp`} alt="" width={820} height={840} loading="lazy" /></li>
          ))}
        </ul>
      </section>
      <section className="won" aria-labelledby="won-h">
        <div className="won-n"><b><Count to={49} /></b><h2 id="won-h">awards and <b>counting</b></h2></div>
        <ul>
          <li><b><Count to={28} /></b><h3>Rx Club Show</h3><p>International awards for excellence in healthcare advertising and creative communication.</p></li>
          <li><b><Count to={21} /></b><h3>The Advertising Club, Bangalore</h3><p>National awards across advertising, healthcare communication, campaigns, video, digital, and brand communication.</p></li>
          <li><h3>LinkedIn Culture of Learning</h3><p>Recognised for a strong culture of continuous learning, professional development, and employee growth.</p></li>
        </ul>
      </section>
      <Closer title={<>We stay small <b>to go deep</b></>} />
    </>
  );
}
