"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cat, ROUNDS, svc } from "@/lib/catalogue";
import { dstr, fmt } from "@/lib/format";
import { balanceOf, pendingFile, STAGES, TEAM, type Project } from "@/lib/projects";
import { SLink } from "@/lib/site";
import { actions, useStore } from "@/lib/store";
import { tint } from "@/lib/theme";
import { Icon } from "../Icon";
import { Mark } from "../Mark";
import { earned, Status } from "./Bits";

type Role = "client" | "studio";
const tintOf = (p: Project) => {
  const s = svc(p.sid);
  return s ? tint(cat(s.cat).id) : "#fff";
};

function BriefForm({ p }: { p: Project }) {
  const [err, setErr] = useState("");
  return (
    <form
      className="brief"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const v = (k: string) => String(d.get(k) ?? "").trim();
        if (!v("goal")) {
          setErr("Tell us what the work should achieve so we can start.");
          e.currentTarget.querySelector<HTMLTextAreaElement>("[name=goal]")?.focus();
          return;
        }
        const files = d.getAll("files").flatMap((f) => (f instanceof File && f.name ? [f.name] : []));
        actions.project(p.id, { type: "brief", brief: { goal: v("goal"), audience: v("audience"), content: v("content"), refs: v("refs"), assets: v("assets"), date: v("date"), files } });
      }}
    >
      <div className="ask-field wide">
        <label htmlFor="b-goal">What should this {p.quote ? "event" : "work"} achieve?</label>
        <textarea id="b-goal" name="goal" required aria-invalid={!!err} aria-describedby={err ? "b-err" : undefined} placeholder="e.g. Launch our new range and get 200 enquiries in the first month" />
        {err ? <p className="err" id="b-err" role="alert">{err}</p> : null}
      </div>
      <div className="ask-field"><label htmlFor="b-aud">Who is it for?</label><input id="b-aud" name="audience" placeholder="Audience, age, city, role" /></div>
      <div className="ask-field"><label htmlFor="b-date">Deadline you are working to</label><input id="b-date" name="date" type="date" /></div>
      <div className="ask-field wide"><label htmlFor="b-con">Key message and content</label><textarea id="b-con" name="content" placeholder="Copy, product details, offers. Content is supplied by you unless the service includes writing." /></div>
      <div className="ask-field wide"><label htmlFor="b-refs">References you like</label><input id="b-refs" name="refs" placeholder="Links, brands or Instagram handles" /></div>
      <div className="ask-field"><label htmlFor="b-as">Brand assets</label><select id="b-as" name="assets"><option>Have logo & guidelines</option><option>Have logo only</option><option>Starting fresh</option></select></div>
      <div className="ask-field"><label htmlFor="b-files">Attach files</label><input id="b-files" name="files" type="file" multiple /></div>
      <button className="cta" type="submit">Submit brief</button>
    </form>
  );
}

/** The one thing this project needs next, from whoever is looking. */
function NextMove({ p, role }: { p: Project; role: Role }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const pending = pendingFile(p);
  const bal = balanceOf(p);
  const act = (type: "approve" | "payBalance" | "complete" | "advance") => actions.project(p.id, { type });
  let title = "";
  let body: React.ReactNode = null;

  if (role === "client") {
    if (p.stage === 0) {
      title = p.quote ? "Tell us about your event" : "Share your brief";
      body = <BriefForm key={p.id} p={p} />;
    } else if (pending) {
      title = "A draft is ready for you";
      body = (
        <>
          <p className="t-lead">{pending.name}</p>
          <p>You have used {p.round} of {ROUNDS} included correction rounds.</p>
          <div className="ask-field wide">
            <label htmlFor="corr">Corrections, if any, one per line</label>
            <textarea id="corr" ref={box} value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} aria-invalid={!!err} aria-describedby={err ? "corr-err" : undefined} />
            {err ? <p className="err" id="corr-err" role="alert">{err}</p> : null}
          </div>
          <div className="talk-go">
            <button type="button" className="cta" onClick={() => act("approve")}>Approve draft</button>
            <button
              type="button"
              className="link"
              onClick={() => {
                if (!text.trim()) {
                  setErr("List the corrections before sending.");
                  box.current?.focus();
                  return;
                }
                actions.project(p.id, { type: "changes", text });
                setText("");
              }}
            >
              Request corrections
            </button>
          </div>
          {p.round >= ROUNDS ? <p>All {ROUNDS} included rounds are used. Further corrections will be costed by our accounts team before work continues.</p> : null}
        </>
      );
    } else if (p.stage === 5 && bal > 1) {
      title = "Release your files";
      body = (<><p className="t-lead">Your work is approved. Pay the balance of {fmt(bal)} to release the final files.</p><button type="button" className="cta" onClick={() => act("payBalance")}>Pay {fmt(bal)}</button></>);
    } else if (p.stage === 5) {
      title = "Your files are ready";
      body = <button type="button" className="cta" onClick={() => act("complete")}>Download final files and close</button>;
    } else if (p.stage === 6) {
      title = "All done";
      body = <p className="t-lead">The mark is complete, and so is your project.</p>;
    } else {
      title = "The studio is on it";
      body = <p className="t-lead">Drafts will appear here as soon as the studio shares the {p.stage === 4 ? "next one" : "first cut"}.</p>;
    }
  } else {
    const next = ({ 1: "Start production", 2: "Share first cut", 4: "Share revised draft" } as Record<number, string>)[p.stage];
    if (p.stage === 0 && p.quote) {
      title = "Discovery call";
      body = <button type="button" className="cta" onClick={() => act("advance")}>Discovery call done, send proposal</button>;
    } else if (next && !(p.stage === 4 && pending)) {
      title = "Move it on";
      body = <button type="button" className="cta" onClick={() => act("advance")}>{next}</button>;
    } else if (p.stage === 5 && bal <= 1) {
      title = "Hand it over";
      body = <button type="button" className="cta" onClick={() => act("complete")}>Mark completed</button>;
    } else {
      title = "Waiting on the client";
      body = <p className="t-lead">{p.stage === 0 ? "They have not shared a brief yet." : p.stage === 5 ? `They owe ${fmt(bal)}.` : p.stage === 6 ? "Closed." : "They are reviewing the draft."}</p>;
    }
    if (p.stage === 6) title = "Completed";
  }
  return (
    <section className="move">
      <h3>{title}</h3>
      {body}
    </section>
  );
}

type Event = { t: string; who: string; text: string; kind: "log" | "client" | "studio" };

export function ProjectView({ p, role }: { p: Project; role: Role }) {
  const bal = balanceOf(p);
  // Messages and milestones share one line of time, newest last.
  const events: Event[] = [
    ...p.log.map(([t, text]): Event => ({ t, text, who: "", kind: "log" })),
    ...p.messages.map((m): Event => ({ t: m.t, text: m.text, who: m.from === "client" ? p.client : "Skepper studio", kind: m.from })),
  ].sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
  const b = p.brief;
  const facts = [
    `${p.client}${p.company ? ", " + p.company : ""}`,
    `Order ${p.orderId}`,
    p.resource === "Unassigned" ? "No one assigned yet" : p.resource,
    `${p.round} of ${ROUNDS} correction rounds used`,
    p.quote ? "Priced after a discovery call" : `${fmt(p.total)}${p.monthly ? " a month" : ""} with GST, ${fmt(p.paid)} paid${bal > 1 ? `, ${fmt(bal)} to pay` : ""}`,
  ];
  return (
    <div className="pv" style={{ ["--tint" as string]: tintOf(p) }}>
      <header className="pv-head">
        <Mark lit={earned(p)} className="pv-mark" title={`Stage ${p.stage + 1} of ${STAGES.length}: ${STAGES[p.stage]}`} />
        <div>
          <h2>{p.name}</h2>
          <p>{p.detail.replaceAll(" · ", ", ") || "Standard scope"}</p>
          <Status p={p} />
          <p className="pv-stage">{STAGES[p.stage]}. Stage {p.stage + 1} of {STAGES.length}.</p>
        </div>
      </header>
      <NextMove key={p.id + p.stage + p.round} p={p} role={role} />
      <div className="pv-cols">
        <section>
          <h3>The story so far</h3>
          <ol className="stream">
            {events.map((e, i) => (
              <li key={i} className={"ev-" + e.kind}>
                <time className="num" dateTime={e.t}>{dstr(e.t)}</time>
                <p>{e.who ? <b>{e.who}</b> : null}{e.text}</p>
              </li>
            ))}
          </ol>
          <form
            className="say"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("text") as HTMLInputElement;
              actions.project(p.id, { type: "message", from: role, text: input.value });
              input.value = "";
            }}
          >
            <input name="text" placeholder="Write a message" aria-label="Message" autoComplete="off" />
            <button className="cta" type="submit">Send</button>
          </form>
        </section>
        <section className="pv-side">
          <h3>Details</h3>
          <p>{facts.join(". ")}.</p>
          <p className="num">{p.id}</p>
          <h3>Files</h3>
          {p.files.length ? (
            <ul className="pv-files">
              {p.files.map((f, i) => (
                <li key={f.name + i}><b>{f.name}</b> {f.final ? "Final delivery. Delivered" : `Draft ${i + 1}, round ${f.round} of ${ROUNDS}. ${f.status === "pending" ? "Waiting for review" : f.status === "changes" ? "Corrections requested" : "Approved"}`}</li>
              ))}
            </ul>
          ) : (
            <p>No drafts shared yet.</p>
          )}
          <h3>Brief</h3>
          {b ? <p>{[b.goal, b.audience && `For ${b.audience}`, b.content, b.refs && `References: ${b.refs}`, b.assets, b.files?.length ? `Files: ${b.files.join(", ")}` : ""].filter(Boolean).join(". ")}.</p> : <p>{role === "studio" ? "Waiting for the client to submit the brief." : "Not shared yet."}</p>}
        </section>
      </div>
    </div>
  );
}

/** Your projects as a shelf of marks, each filled as far as the work has come. */
export function Projects() {
  const ready = useStore((s) => s.ready);
  const list = useStore((s) => s.projects);
  const linked = useSearchParams().get("id");
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const id = picked === undefined ? linked : picked;
  const p = list.find((x) => x.id === id);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (picked !== undefined) top.current?.scrollIntoView({ block: "start" });
  }, [picked]);
  const pick = (x: string | null) => {
    setPicked(x);
    history.replaceState(null, "", x ? `?id=${x}` : location.pathname);
  };
  return (
    <div className="desk" ref={top}>
      {p ? (
        <>
          <button type="button" className="link back" onClick={() => pick(null)}>All projects</button>
          <h1 className="sr">My Projects</h1>
          <ProjectView p={p} role="client" />
        </>
      ) : (
        <>
          <h1>My Projects</h1>
          <p className="t-lead">Every order becomes a project. Share your brief, review drafts, request corrections and download final files here.</p>
          {!ready ? <p role="status">Loading your projects</p> : null}
          {ready && list.length === 0 ? <SLink className="cta" href="/services/">Explore services</SLink> : null}
          <ul className="shelf">
            {list.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => pick(x.id)}>
                  <Mark lit={earned(x)} />
                  <b>{x.name}</b>
                  <span>{x.company || x.client}</span>
                  <Status p={x} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const GROUPS: [string, string, (p: Project) => boolean][] = [
  ["us", "Waiting on us", (p) => p.stage < 6 && !pendingFile(p) && ((p.stage === 0 && !!p.quote) || (p.stage >= 1 && p.stage <= 4) || (p.stage === 5 && balanceOf(p) <= 1))],
  ["client", "Waiting on the client", (p) => p.stage < 6 && ((p.stage === 0 && !p.quote) || !!pendingFile(p))],
  ["money", "Waiting on payment", (p) => p.stage === 5 && balanceOf(p) > 1],
  ["done", "Completed", (p) => p.stage === 6],
];

/** The studio’s day, sorted by who has to act next. */
export function StudioBoard() {
  const ready = useStore((s) => s.ready);
  const ps = useStore((s) => s.projects);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = ps.find((p) => p.id === openId);
  const active = ps.filter((p) => p.stage < 6);
  const late = active.filter((p) => !p.quote && daysLeft(p) < 0).length;
  const review = active.filter(pendingFile).length;
  const owed = ps.reduce((a, p) => a + balanceOf(p), 0);
  if (open)
    return (
      <div className="desk">
        <button type="button" className="link back" onClick={() => setOpenId(null)}>Studio Board</button>
        <h1 className="sr">Studio Board</h1>
        <ProjectView p={open} role="studio" />
      </div>
    );
  return (
    <div className="desk">
      <h1>Studio Board</h1>
      <p className="t-lead">
        {ready ? <><b className="num">{active.length}</b> active {active.length === 1 ? "project" : "projects"}, <b className="num">{review}</b> waiting on client review, <b className="num">{late}</b> past the due date, <b className="num">{fmt(owed)}</b> to collect.</> : "Loading the board."}
      </p>
      <p>Internal view for the Skepper team: assign resources, move work through stages and share drafts.</p>
      {ps.some((p) => p.example) ? <button type="button" className="link" onClick={actions.clearExamples}>Remove example projects</button> : null}
      {GROUPS.map(([id, label, test]) => {
        const list = ps.filter(test);
        return (
          <section key={id} className="duty">
            <h2>{label} <span className="num">{list.length}</span></h2>
            {list.length ? (
              <ul>
                {list.map((p) => (
                  <li key={p.id} style={{ ["--tint" as string]: tintOf(p) }}>
                    <Mark lit={earned(p)} />
                    <div className="duty-what"><b>{p.name}</b><span>{p.company || p.client}. {STAGES[p.stage]}.</span><Status p={p} /></div>
                    <label><span>Assigned to</span>
                      <select value={p.resource} onChange={(e) => actions.project(p.id, { type: "assign", resource: e.target.value })}>{TEAM.map((t) => <option key={t}>{t}</option>)}</select>
                    </label>
                    <button type="button" className="round" onClick={() => setOpenId(p.id)} aria-label={`Open ${p.name}, ${p.company || p.client}`}><Icon name="arrow" /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nothing here.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
function daysLeft(p: Project) {
  return Math.ceil((new Date(p.due).getTime() - Date.now()) / 864e5);
}
