import type { ReactElement } from "react";
export interface ButtonProps {
    variant: "primary" | "secondary";
    size: "sm" | "md" | "lg";
    text?: string;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick?: () => void;
    fullWidth?: boolean;
    loading?: boolean;
}

const variantStyles = {
    "primary": "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_2px_10px_-3px_rgba(30,112,235,0.4)] active:scale-[0.98]",
    "secondary": "bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20 shadow-sm active:scale-[0.98]",
};

const sizeStyle = {
    "sm": "py-1.5 px-3 text-xs",
    "md": "py-2 px-5 text-sm",
    "lg": "py-2.5 px-6 text-sm",
};

const defaultStyle = "rounded-full flex items-center justify-center cursor-pointer font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/20";

export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.loading}
      className={`
        ${variantStyles[props.variant]}
        ${defaultStyle}
        ${props.fullWidth ? "w-full" : ""}
        ${sizeStyle[props.size]}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {props.startIcon && <span className="flex items-center justify-center w-4 h-4">{props.startIcon}</span>}
        {props.text && <span>{props.text}</span>}
        {props.endIcon && <span className="flex items-center justify-center w-4 h-4">{props.endIcon}</span>}
      </div>
    </button>
  );
};
