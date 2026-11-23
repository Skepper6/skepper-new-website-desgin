import Link from "next/link";
import { Mark } from "@/components/Mark";
import type { ShardId } from "@/lib/mark";

export default function NotFound() {
  return (
    <main className="choose">
      <Mark lit={new Set<ShardId>(["redTop", "orange"])} />
      <h1>A piece is missing</h1>
      <p>We could not find this page. It may have moved, or the link has a typo.</p>
      <p><Link href="/">Go home</Link></p>
    </main>
  );
}
