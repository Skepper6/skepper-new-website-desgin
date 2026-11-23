"use client";
import { dueOf, statusOf, type Project } from "@/lib/projects";
import type { ShardId } from "@/lib/mark";
import { actions } from "@/lib/store";
import { STAGE_SHARDS } from "@/lib/theme";

/** Opens the order conversation for one service. */
export function Order({ sid, className, children, label }: { sid: string; className?: string; children: React.ReactNode; label?: string }) {
  return (
    <button type="button" className={className} aria-label={label} onClick={() => actions.configure(sid)}>
      {children}
    </button>
  );
}

export const earned = (p: Project): ReadonlySet<ShardId> => new Set(STAGE_SHARDS.slice(0, p.stage + 1).flat());

export function Status({ p }: { p: Project }) {
  const s = statusOf(p);
  const d = dueOf(p);
  return (
    <span className="status">
      <b className={"dot dot-" + s.tone}>{s.label}</b>
      {d ? <span className={"due-" + d.tone}>{d.label}</span> : null}
      {p.example ? <span>Example</span> : null}
    </span>
  );
}
