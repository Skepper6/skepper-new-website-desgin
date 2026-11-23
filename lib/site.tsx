"use client";
import Link from "next/link";
import { createContext, useContext, type ComponentProps } from "react";

export type SiteName = "rooms" | "dial";
const Ctx = createContext<SiteName>("rooms");

/** Two sites share one store. Everything inside knows which one it is in. */
export function SiteProvider({ name, children }: { name: SiteName; children: React.ReactNode }) {
  return <Ctx.Provider value={name}>{children}</Ctx.Provider>;
}
export const useSite = () => {
  const name = useContext(Ctx);
  return { name, to: (path: string) => `/${name}${path}` };
};
/** A link inside the current site. */
export function SLink({ href, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { to } = useSite();
  return <Link href={to(href)} {...rest} />;
}

export const NAV: [string, string][] = [
  ["/services/", "Services"],
  ["/work/", "Work"],
  ["/about/", "About"],
  ["/projects/", "My Projects"],
  ["/studio/", "Studio Board"],
  ["/contact/", "Contact"],
];
