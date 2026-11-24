import { useCallback, useEffect, useState } from "react";
import { get, post } from "../lib/api";
import { fmt } from "../lib/pricing";
import { useStore } from "../lib/store";
import { Cross, Field, Layer } from "./Bits";
import { PageHead } from "./Frame";
import Project, { DueChip, StateChip } from "./Project";

function useList(path) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => {
    setErr("");
    return get(path).then(setList).catch((e) => { setErr(e.message); setList(null); });
  }, [path]);
  useEffect(() => { load(); }, [load]);
  const put = (p) => setList((l) => l.map((x) => (x.id === p.id ? p : x)));
  return { list, setList, err, load, put };
}
const Wait = ({ err, retry }) => (err ? <div className="empty">{err} <button type="button" className="link" onClick={retry}>Try again</button></div> : <div className="empty" role="status">Loading</div>);

/** Clients open their projects with a code sent to the email they ordered with. */
function SignIn({ done }) {
  const { setSession } = useStore();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [dev, setDev] = useState("");
  const go = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      if (!step) {
        const r = await post("/auth/code", { email });
        setDev(r.devCode || "");
        setStep(1);
      } else {
        setSession(await post("/auth/verify", { email, code }));
        done();
      }
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="signin panel" onSubmit={go} noValidate>
      <h2>Already ordered?</h2>
      <p className="note">{step ? `If ${email} has an order, a 6-digit code is on its way. It works for 15 minutes.${dev ? ` Local preview code: ${dev}` : ""}` : "Sign in with the email you used at checkout. We will send a code."}</p>
      <div className="signin-row">
        {step ? <Field id="code" label="Code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} autoFocus /> : <Field id="semail" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        <button className="btn" disabled={busy}>{step ? "Open my projects" : "Send code"}</button>
      </div>
      <div className="err" role="alert">{err}</div>
      {step ? <button type="button" className="link" onClick={() => { setStep(0); setCode(""); }}>Use another email</button> : null}
    </form>
  );
}

export function Portal() {
  const { session, setSession, current, setCurrent } = useStore();
  const { list, err, load, put } = useList("/projects");
  const client = session?.user?.role === "client";
  const p = list?.find((x) => x.id === current) || list?.[0];
  const leave = async () => { setSession(await post("/auth/leave")); load(); };
  return (
    <>
      <PageHead title="My Projects" side={client ? <div className="who"><span>{session.user.email}</span><button type="button" className="btn plain" onClick={leave}>Sign out</button></div> : null}>Every order becomes a project. Share your brief, review drafts, request corrections and download final files here.</PageHead>
      <div className="paper page"><div className="wrap">
        {!list ? <Wait err={err} retry={load} /> : list.length ? (
          <div className="portal">
            <div className="plist">{list.map((x) => (
              <button key={x.id} type="button" className={"pitem" + (x.id === p.id ? " on" : "")} aria-pressed={x.id === p.id} onClick={() => setCurrent(x.id)}>
                <b>{x.name}</b><span className="s"><span>{x.company || x.client}</span><DueChip p={x} /></span>
                <span className="chips"><StateChip p={x} />{x.example ? <span className="chip ex">Example</span> : null}</span>
              </button>
            ))}</div>
            <Project key={p.id} p={p} role="client" onChange={put} />
          </div>
        ) : <div className="empty">No projects yet. <a href="#shop">Browse services</a> to start one.</div>}
        {client ? null : <SignIn done={load} />}
      </div></div>
    </>
  );
}

function StaffDoor() {
  const { setSession, menu } = useStore();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setErr("");
    try {
      setSession(await post("/auth/staff", { email: v.staff, password: v.password }));
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead title="Studio Board">Internal view for the Skepper team: assign resources, move work through stages and share drafts.</PageHead>
      <div className="paper page"><div className="wrap">
        <form className="signin panel" onSubmit={go} noValidate>
          <h2>Team sign in</h2>
          {menu.demo ? <p className="note">This page is for the Skepper team only.</p> : null}
          <Field id="staff" label="Email" type="email" autoComplete="username" />
          <Field id="password" label="Password" type="password" autoComplete="current-password" />
          <div className="err" role="alert">{err}</div>
          <button className="btn" disabled={busy}>Sign in</button>
        </form>
      </div></div>
    </>
  );
}

function Board() {
  const { menu, layer, setLayer, setSession } = useStore();
  const { list, setList, err, load, put } = useList("/studio/projects");
  const [note, setNote] = useState("");
  const ps = list || [];
  const active = ps.filter((p) => p.stage < 6);
  const late = active.filter((p) => !p.quote && new Date(p.due) < new Date()).length;
  const review = active.filter((p) => p.files.some((f) => f.status === "pending")).length;
  const balance = ps.reduce((a, p) => a + Math.max(0, p.total - p.paid), 0);
  const open = layer?.type === "project" ? ps.find((p) => p.id === layer.id) : null;
  const close = () => setLayer(null);
  const tell = (fn) => async (...a) => {
    setNote("");
    try { await fn(...a); } catch (e) { setNote(e.message); if (e.status === 401) setSession({ user: null, orders: 0 }); }
  };
  const assign = tell(async (p, who) => put(await post(`/studio/projects/${p.id}/assign`, { resource: who })));
  const clear = tell(async () => setList(await post("/studio/examples/clear")));
  const leave = tell(async () => setSession(await post("/auth/leave")));
  return (
    <>
      <PageHead title="Studio Board" side={<div className="who">{ps.some((p) => p.example) ? <button type="button" className="btn plain" onClick={clear}>Remove example projects</button> : null}<button type="button" className="btn plain" onClick={leave}>Sign out</button></div>}>Internal view for the Skepper team: assign resources, move work through stages and share drafts.</PageHead>
      <div className="paper page"><div className="wrap wide">
        {note ? <div className="err" role="alert">{note}</div> : null}
        {!list ? <Wait err={err} retry={load} /> : (
          <>
            <div className="kpis">
              <div><b className="num">{active.length}</b><span>Active projects</span></div>
              <div><b className="num">{review}</b><span>Waiting on client review</span></div>
              <div><b className={"num" + (late ? " bad" : "")}>{late}</b><span>Past due date</span></div>
              <div><b className="num">{fmt(balance)}</b><span>Balance to collect</span></div>
            </div>
            <div className="board" tabIndex={0} role="group" aria-label="Projects by stage">
              {menu.stages.map((st, i) => {
                const col = ps.filter((p) => p.stage === i);
                return (
                  <section className="col" key={st} aria-label={st}>
                    <h2><span>{st}</span><span className="num">{col.length}</span></h2>
                    {col.map((p) => (
                      <div className="kc" key={p.id}>
                        <div className="chips"><StateChip p={p} />{p.example ? <span className="chip ex">Ex</span> : null}</div>
                        <b>{p.name}</b><span className="note">{p.company || p.client}</span>
                        <DueChip p={p} />
                        <label htmlFor={"r-" + p.id}>Assigned to</label>
                        <select id={"r-" + p.id} value={p.resource} onChange={(e) => assign(p, e.target.value)}>{menu.team.map((t) => <option key={t}>{t}</option>)}</select>
                        <button type="button" className="btn plain" onClick={() => setLayer({ type: "project", id: p.id })}>Open</button>
                      </div>
                    ))}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div></div>
      {open ? <Layer className="scrim" label={open.name} onClose={close}><div className="modal plainm"><button type="button" className="x" onClick={close} aria-label="Close"><Cross /></button><Project p={open} role="studio" onChange={put} /></div></Layer> : null}
    </>
  );
}

export function Studio() {
  const { session } = useStore();
  return session?.user?.role === "studio" ? <Board /> : <StaffDoor />;
}
