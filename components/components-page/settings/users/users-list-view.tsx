"use client";

import * as React from "react";
import { usersApi } from "@/api/users/users.api";
import { rolesApi } from "@/api/role/roles.api";
import UsersDataTable from "./data-table/data-table";
import type { UserTableRow } from "./data-table/columns";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./dialogs/user-form-dialog";
import { UserDeleteDialog } from "./dialogs/user-delete-dialog";
import { Card } from "@/components/ui/card";

type RoleOption = { id: string; name: string };

function buildRoleMap(roles: RoleOption[]) {
  return roles.reduce<Record<string, string>>((acc, role) => {
    acc[role.id] = role.name;
    return acc;
  }, {});
}

function pickItems<T>(res: any): T[] {
  return (res?.items ?? res?.data?.items ?? res?.data ?? []) as T[];
}

function toUserRows(users: any[], roleMap: Record<string, string>): UserTableRow[] {
  return users.map((u) => ({
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    email: u.email,
    role_id: u.role_id,
    roleName: roleMap[u.role_id] ?? "—",
    created_at: u.created_at ?? null,
    updated_at: u.updated_at ?? null,
  }));
}

export default function UsersListView() {
  const [rows, setRows] = React.useState<UserTableRow[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // dialogs state
  const [openForm, setOpenForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = React.useState<UserTableRow | null>(null);

  const [openDelete, setOpenDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.listUsersPaged({ page: 1, pageSize: 50 }),
        rolesApi.listRoles(),
      ]);

      const users = pickItems<any>(usersRes);
      const rolesItems = pickItems<RoleOption>(rolesRes);

      setRoles(rolesItems);

      const roleMap = buildRoleMap(rolesItems);
      setRows(toUserRows(users, roleMap));
    } catch (e: any) {
      setError(e?.message ?? "Error cargando usuarios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  function handleOpenCreate() {
    setFormMode("create");
    setSelectedUser(null);
    setOpenForm(true);
  }

  function handleOpenEdit(row: UserTableRow) {
    setFormMode("edit");
    setSelectedUser(row);
    setOpenForm(true);
  }

  function handleOpenDelete(row: UserTableRow) {
    setSelectedUser(row);
    setOpenDelete(true);
  }

  async function handleSubmitForm(payload: {
    username: string;
    fullName: string;
    email: string;
    roleId: string;
    password?: string;
    isActive: boolean;
  }) {
    if (formMode === "create") {
      await usersApi.createUser({
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        roleId: payload.roleId,
        password: payload.password ?? "",
        isActive: payload.isActive,
      });
    } else {
      if (!selectedUser?.id) throw new Error("No hay usuario seleccionado para editar.");

      await usersApi.updateUser(selectedUser.id, {
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        roleId: payload.roleId,
        password: payload.password, // opcional
        isActive: payload.isActive,
      });
    }

    await load();
  }

  async function handleConfirmDelete(id: string) {
    await usersApi.deleteUser(id);
    await load();
  }

  return (
    <div className="space-y-4">

      <Card>
        <div className="flex items-center justify-between p-5">
          <h1 className="text-xl font-semibold">Mantenedor de Usuarios</h1>
          <Button onClick={handleOpenCreate}>+ Crear Usuario</Button>
        </div>
      </Card>

      <Card className="p-5">
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        ) : null}

        <UsersDataTable
          data={rows}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />

        <UserFormDialog
          open={openForm}
          mode={formMode}
          roles={roles}
          initial={selectedUser}
          onOpenChange={setOpenForm}
          onSubmit={handleSubmitForm}
        />

        <UserDeleteDialog
          open={openDelete}
          user={selectedUser}
          onOpenChange={setOpenDelete}
          onConfirm={handleConfirmDelete}
        />

      </Card>
    </div>
  );
}