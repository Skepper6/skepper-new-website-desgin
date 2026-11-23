import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomPage } from "@/components/dial/Pages";
import { CATS, countIn, type CategoryId } from "@/lib/catalogue";

type Params = { params: Promise<{ dept: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => CATS.map((c) => ({ dept: c.id }));
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { dept } = await params;
  const d = CATS.find((x) => x.id === dept);
  return d ? { title: d.name, description: `${d.blurb} ${countIn(d.id)} services with prices from Skepper, Bengaluru.` } : {};
}

export default async function Page({ params }: Params) {
  const { dept } = await params;
  if (!CATS.some((c) => c.id === dept)) notFound();
  return <RoomPage dept={dept as CategoryId} />;
}
