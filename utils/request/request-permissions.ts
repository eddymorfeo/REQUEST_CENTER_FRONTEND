import type { RequestItem } from "@/types/requests/request.types";
import type { AuthUser } from "@/types/auth/auth.types";

function extractAssigneeId(request: RequestItem): string | null {
  const anyReq = request as any;

  return (
    anyReq.assigned_to_user_id ??
    anyReq.assignee_user_id ??
    anyReq.assigneeId ??
    anyReq.assignedToUserId ??
    anyReq.assigned_to ??
    anyReq.assignee?.id ??
    anyReq.assigned_to_user?.id ??
    null
  );
}

export function canEditOrMoveRequest(request: RequestItem, user: AuthUser | null) {
  if (!user) return false;

  // ✅ admins pueden todo (si quieres esto, déjalo; si no, elimínalo)
  if (user.roleCode === "ADMIN") return true;

  const assigneeId = extractAssigneeId(request);
  if (!assigneeId) return false;

  return assigneeId === user.id;
}
