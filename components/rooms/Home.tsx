import { Closer } from "../show/Closer";
import { Faq } from "../show/Faq";
import { Float } from "../show/Float";
import { Knob } from "../show/Knob";
import { Pods } from "../show/Pods";
import { Popular } from "../show/Popular";
import { Steps } from "../show/Steps";
import { Studio } from "../show/Studio";
import { Voices } from "../show/Voices";
import { Wheel } from "../show/Wheel";
import { Walk } from "./Walk";

export function RoomsHome() {
  return (
    <>
      <Walk />
      <Float />
      <Popular />
      <Steps />
      <Wheel limit={10} title={<>Fewer clients, <b>deeper impact</b></>} />
      <Knob />
      <Pods />
      <Studio />
      <Voices />
      <Faq />
      <Closer />
    </>
  );
}
