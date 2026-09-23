import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "inverse" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "clip-notch bg-primary text-primary-foreground hover:bg-[#b7964e]",
  inverse:
    "clip-notch bg-bone text-background hover:bg-[#c9a86a]",
  outline:
    "border border-border text-muted-foreground hover:text-foreground hover:border-silver",
  ghost: "text-muted-foreground hover:text-foreground",
  danger:
    "clip-notch bg-transparent border border-destructive/40 text-destructive hover:bg-destructive/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-[10px]",
  md: "px-6 py-3 text-xs",
  lg: "px-8 py-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, className = "", children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-bold tracking-[0.22em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";