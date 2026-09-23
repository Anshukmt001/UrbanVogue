import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, mono, className = "", id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-transparent border-0 border-b border-border px-0 py-3 text-foreground placeholder:text-muted-foreground/40 text-base focus:outline-none focus:border-primary transition-colors ${
            mono ? "font-mono" : ""
          } ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";