import type { ReactElement } from "react";

interface SidebarItemProps {
  text: string;
  icon: ReactElement;
  onClick?: () => void;
  selected?: boolean;
}

export function SidebarItem(props: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
        props.selected
          ? "bg-surface text-brand-ink shadow-[0_10px_24px_-22px_rgba(0,0,0,0.5)] ring-1 ring-border"
          : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
          props.selected
            ? "bg-primary/10 text-primary"
            : "bg-transparent text-muted-foreground group-hover:text-foreground"
        }`}
      >
        {props.icon}
      </span>
      <span className="flex-1 tracking-[-0.02em]">{props.text}</span>
    </button>
  );
}
