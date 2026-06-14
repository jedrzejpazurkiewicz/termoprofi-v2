import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const fieldBase =
  "w-full rounded-xl border border-hairline bg-white/[0.02] px-4 py-3.5 font-inter text-[0.95rem] text-ink placeholder:text-ink-2/60 transition-colors duration-300 ease-calm focus:border-tp-red/60 focus:bg-white/[0.04] focus:outline-none disabled:opacity-50";

const labelBase = "mb-2 block font-inter text-sm font-medium text-ink-2";
const errorBase = "mt-1.5 text-sm text-tp-red";

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Form field id (also used for label htmlFor). */
  id: string;
  label: string;
  error?: string;
  className?: string;
}

/**
 * Labelled text input with hairline styling and inline error slot.
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput({ id, label, error, className, ...rest }, ref) {
    return (
      <div className={className}>
        <label htmlFor={id} className={labelBase}>
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cx(fieldBase, error && "border-tp-red/70")}
          {...rest}
        />
        {error ? (
          <p id={`${id}-error`} className={errorBase} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  className?: string;
}

/**
 * Labelled textarea sibling of FormInput, same styling language.
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  function FormTextarea({ id, label, error, className, rows = 5, ...rest }, ref) {
    return (
      <div className={className}>
        <label htmlFor={id} className={labelBase}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cx(fieldBase, "resize-none", error && "border-tp-red/70")}
          {...rest}
        />
        {error ? (
          <p id={`${id}-error`} className={errorBase} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export default FormInput;
