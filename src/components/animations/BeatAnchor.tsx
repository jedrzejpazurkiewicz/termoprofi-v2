"use client";

/**
 * BeatAnchor — a zero-height DOM probe that reports its viewport progress to
 * the scroll-store under a beat number.
 *
 * Drop one inside a section; as it travels from entering the bottom of the
 * viewport (progress 0) to leaving the top (progress 1), it writes that 0..1
 * into `scroll.beats[beat]`. SceneController reads those beats every frame to
 * drive the 3D choreography. The element is `aria-hidden` and carries no
 * content — it exists purely to measure scroll.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setBeat } from "@/lib/scroll-store";

export interface BeatAnchorProps {
  /** The beat number this anchor reports to (read via getBeat(beat)). */
  beat: number;
  className?: string;
}

export default function BeatAnchor({ beat, className }: BeatAnchorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => setBeat(beat, self.progress),
    });

    return () => {
      trigger.kill();
    };
  }, [beat]);

  return <div ref={ref} data-beat={beat} className={className} aria-hidden />;
}
