// @ladle-only
import type * as React from "react";
import { HeroPanel } from "./HeroPanel";

export type HeroStatePanelProps = {
  title: string;
  text: string;
  state?: "empty" | "loading" | "error" | "success";
  action?: React.ReactNode;
};

export function HeroStatePanel({
  title,
  text,
  state = "empty",
  action,
}: HeroStatePanelProps) {
  return (
    <HeroPanel
      tone={
        state === "error" ? "white" : state === "success" ? "yellow" : "cream"
      }
      className="grid min-h-44 place-items-center text-center"
      shadow={false}
    >
      <div className="max-w-md space-y-4">
        <p className="font-display text-3xl font-black uppercase leading-none md:text-5xl">
          {title}
        </p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          {text}
        </p>
        {action}
      </div>
    </HeroPanel>
  );
}
