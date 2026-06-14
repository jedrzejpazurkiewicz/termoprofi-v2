import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    /** Presence of href renders an <a>. */
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 rounded-pill font-inter font-medium tracking-tight transition-all duration-300 ease-calm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-tp-red to-tp-red-dark text-white shadow-[0_10px_30px_-12px_rgba(207,46,46,0.7)] hover:shadow-[0_16px_44px_-14px_rgba(207,46,46,0.85)] hover:-translate-y-0.5 active:translate-y-0",
  ghost:
    "border border-hairline bg-white/[0.02] text-ink hover:border-white/25 hover:bg-white/[0.05]",
};

/**
 * Primary (tp-red gradient pill) or ghost (hairline) button.
 * Renders an <a> automatically when `href` is provided, otherwise a <button>.
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cx(base, sizes[size], variants[variant], className);

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
