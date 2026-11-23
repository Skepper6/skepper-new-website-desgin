import { SHARDS, SHARD_BOX, shard, type ShardId } from "@/lib/mark";
import { WORDMARK } from "@/lib/wordmark";

/** The round Skepper mark. Pass `lit` to colour only some shards; the rest wait in grey. */
export function Mark({ lit, className, title }: { lit?: ReadonlySet<ShardId>; className?: string; title?: string }) {
  return (
    <svg className={"mark " + (className ?? "")} viewBox="0 0 111 125" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {SHARDS.map((s) => (
        <g key={s.id} className={"shard" + (!lit || lit.has(s.id) ? " is-lit" : "")} style={{ ["--c" as string]: s.color }}>
          {s.paths.map((p, i) => (
            <path key={i} d={p.d} transform={`translate(${p.x} ${p.y})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** One shard on its own, cropped to its own box. */
export function ShardShape({ id, color, className }: { id: ShardId; color?: string; className?: string }) {
  const [x, y, w, h] = SHARD_BOX[id];
  const s = shard(id);
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} aria-hidden="true" fill={color ?? s.color}>
      {s.paths.map((p, i) => (
        <path key={i} d={p.d} transform={`translate(${p.x} ${p.y})`} />
      ))}
    </svg>
  );
}

/** The wordmark letters in the current text colour. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 27 328 55" aria-hidden="true" fill="currentColor">
      {WORDMARK.map((p, i) => (
        <path key={i} d={p.d} transform={`translate(${p.x} ${p.y})`} />
      ))}
    </svg>
  );
}
