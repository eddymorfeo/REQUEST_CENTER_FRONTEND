import type { RequestItem } from "@/types/requests/request.types";
import type { AuthUser } from "@/types/auth/auth.types";

function extractAssigneeId(request: RequestItem): string | null {
  const req = request as RequestItem & {
    assigned_to_user_id?: string | null;
    assignee_user_id?: string | null;
    assigneeId?: string | null;
    assignedToUserId?: string | null;
    assigned_to?: string | null;
    assignee?: { id?: string | null } | null;
    assigned_to_user?: { id?: string | null } | null;
  };

  return (
    req.assigned_to_user_id ??
    req.assignee_user_id ??
    req.assigneeId ??
    req.assignedToUserId ??
    req.assigned_to ??
    req.assignee?.id ??
    req.assigned_to_user?.id ??
    null
  );
}

export function canEditOrMoveRequest(request: RequestItem, user: AuthUser | null) {
  if (!user) return false;
  if (user.capabilities?.canChangeAnyRequestStatus) return true;

  const assigneeId = extractAssigneeId(request);
  if (!assigneeId) return false;

  return Boolean(user.capabilities?.canChangeAssignedRequestStatus && assigneeId === user.id);
}
