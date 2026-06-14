import type { ReactNode } from "react";

export type SectionVariant = "default" | "surface" | "dark";

export interface SectionProps {
  /** Anchor id used by the nav (e.g. "produkty"). */
  id?: string;
  children: ReactNode;
  className?: string;
  /** Inner container className overrides (max-width / padding). */
  containerClassName?: string;
  /**
   * Small uppercase label rendered above the content.
   * Pass a string to show it; omit for no eyebrow.
   */
  eyebrow?: string;
  /** Background treatment for atmospheric depth. */
  variant?: SectionVariant;
  /** Constrain content width. Defaults to true. */
  contained?: boolean;
  as?: "section" | "div" | "footer";
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const variants: Record<SectionVariant, string> = {
  default: "",
  surface: "border-y border-hairline bg-surface/30 backdrop-blur-[2px]",
  dark: "border-y border-hairline bg-black/30 backdrop-blur-[2px]",
};

/**
 * Semantic, vertically-rhythmic section wrapper.
 * Provides consistent vertical padding, a centered max-width container,
 * an optional eyebrow label, and an optional surface background for depth.
 */
export function Section({
  id,
  children,
  className,
  containerClassName,
  eyebrow,
  variant = "default",
  contained = true,
  as: Tag = "section",
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cx(
        "relative scroll-mt-24 py-section",
        variants[variant],
        className,
      )}
    >
      <div
        className={cx(
          contained
            ? "mx-auto w-full max-w-container px-6 sm:px-8 lg:px-10"
            : undefined,
          containerClassName,
        )}
      >
        {eyebrow ? (
          <div className="mb-10 flex items-center gap-3">
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-r from-tp-red to-transparent"
            />
            <span className="text-eyebrow font-medium uppercase text-tp-red">
              {eyebrow}
            </span>
          </div>
        ) : null}
        {children}
      </div>
    </Tag>
  );
}

export default Section;
