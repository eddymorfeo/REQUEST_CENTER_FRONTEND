import type * as React from "react";

export function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b p-4 opacity-70 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full transition",
          disabled ? "cursor-not-allowed opacity-70" : "",
          checked ? "bg-blue-600" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 size-4 rounded-full bg-background shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

