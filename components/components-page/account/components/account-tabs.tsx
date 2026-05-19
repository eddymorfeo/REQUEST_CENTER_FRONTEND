import { LockKeyhole, User2 } from "lucide-react";

import type { AccountTab } from "../types";

export function AccountTabs({
  value,
  onChange,
}: {
  value: AccountTab;
  onChange: (value: AccountTab) => void;
}) {
  const tabs = [
    { value: "data" as const, label: "Mis Datos", icon: User2 },
    { value: "security" as const, label: "Seguridad", icon: LockKeyhole },
  ];

  return (
    <div className="border-b">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={[
                "relative flex h-13 min-w-36 items-center justify-center gap-2 px-4 text-sm font-semibold transition",
                active ? "text-blue-600" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {tab.label}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

