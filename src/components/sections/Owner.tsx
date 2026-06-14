"use client";

import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { OWNER } from "@/lib/constants";

/**
 * Owner — placeholder shell. The "about us" / founder's-word section. The copy
 * here is final (the owner's quote from constants); what's still a placeholder
 * is the surrounding portrait and company timeline, which arrive in a later
 * pass. Rendered as a single, generous editorial pull-quote.
 */
export default function Owner() {
  return (
    <Section id="o-nas" eyebrow="O nas">
      <ScrollReveal>
        <figure className="mx-auto max-w-4xl">
          <span
            aria-hidden
            className="block font-jost text-6xl leading-none text-tp-red/60"
          >
            &ldquo;
          </span>
          <blockquote className="mt-2 text-balance font-jost text-[clamp(1.5rem,3.4vw,2.5rem)] font-medium leading-snug text-ink">
            {OWNER.quote}
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span
              className="h-12 w-12 shrink-0 rounded-full border border-hairline bg-surface"
              aria-hidden
            />
            <span className="flex flex-col">
              <span className="font-jost text-base font-medium text-ink">
                {OWNER.author}
              </span>
              <span className="text-sm text-ink-2">{OWNER.role}</span>
            </span>
          </figcaption>
        </figure>
      </ScrollReveal>
    </Section>
  );
}
