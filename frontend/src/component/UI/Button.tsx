import type { ReactElement } from "react";
export interface ButtonProps {
    variant:"primary" | "secondary";
    size: "sm" | "md" | "lg";
    text?:string;
    startIcon?: ReactElement;
    endIcon?:ReactElement;
    onClick?:() => void;
    fullWidth?:boolean;
    loading?:boolean;
}
const variantStyles ={
        "primary":"bg-blue-700 text-white",
        "secondary": "bg-blue-400 text-purple",
}
const sizeStyle={
    "sm":"py-1 px-2 rounded",
    "md":"py-2 px-1 rounded",
    "lg":"p-6",
}
const defaultStyle ="px-2 py-2 rounded-md flex font-light mr-2 inline items-center cursor-pointer";
export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.loading}
      className={`
        ${variantStyles[props.variant]} 
        ${defaultStyle} 
        ${props.loading ? "opacity-45" : ""} 
        ${props.fullWidth ? "w-full" : ""} 
        ${sizeStyle[props.size]}
      `}
    >
      <div className="flex items-center justify-center w-full">
        {props.startIcon && <span className="pr-2">{props.startIcon}</span>}
        <span className="px-1">{props.text}</span>
        {props.endIcon && <span className="pl-2">{props.endIcon}</span>}
      </div>
    </button>
  );
};

