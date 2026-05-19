import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getInitials } from "../account.helpers";
import type { AccountFormState, AccountTab } from "../types";
import { AccountTabs } from "./account-tabs";

export function AccountHeader({
  form,
  avatarSrc,
  activeTab,
  onTabChange,
}: {
  form: AccountFormState;
  avatarSrc?: string | null;
  activeTab: AccountTab;
  onTabChange: (value: AccountTab) => void;
}) {
  const initials = getInitials(form.fullName || form.username);

  return (
    <section className="space-y-7">
      <div className="flex items-center gap-5">
        <Avatar className="size-18 bg-blue-100 text-blue-700">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} alt={form.fullName || form.username} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-blue-100 text-2xl font-bold text-blue-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            Hola, {form.fullName || form.username}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra tu informacion personal y la seguridad de tu cuenta.
          </p>
        </div>
      </div>
      <AccountTabs value={activeTab} onChange={onTabChange} />
    </section>
  );
}

