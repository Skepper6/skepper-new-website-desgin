import Link from "next/link";
import { Mark } from "@/components/Mark";

/** Two finished designs of the same site. Once one is chosen, it moves here. */
export default function Choose() {
  return (
    <main className="choose">
      <Mark />
      <h1>Two designs, one studio</h1>
      <p><Link href="/rooms/">1. Rooms of light</Link> Walk through nine rooms, each lit by one giant piece of the glass logo.</p>
      <p><Link href="/dial/">2. The dial</Link> Walk through the film inside the words, then turn the round logo to choose.</p>
    </main>
  );
}
