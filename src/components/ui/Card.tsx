import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a soft hover lift + warm hairline highlight. */
  interactive?: boolean;
  as?: "div" | "article" | "li";
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Atmospheric surface card: inner-lit gradient, hairline border,
 * generous radius. Not flat — reads with depth on the dark page.
 */
export function Card({
  children,
  className,
  interactive = false,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cx(
        "relative overflow-hidden rounded-2xl border border-hairline surface-card p-7 shadow-ambient",
        // top hairline sheen
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-hairline-top",
        interactive &&
          "transition-all duration-500 ease-calm hover:-translate-y-1 hover:border-tp-red/30 hover:shadow-[0_40px_90px_-50px_rgba(207,46,46,0.5)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Card;
