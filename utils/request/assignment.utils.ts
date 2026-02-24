type AssignmentItem = {
  id: string;
  request_id: string;
  assigned_to: string | null;
  assigned_at: string;
  unassigned_at: string | null;
  is_active: boolean;
};

function pickCurrentAssigneeId(assignments: AssignmentItem[]): string | null {
  const active = assignments.filter(
    (a) => a.is_active && (a.unassigned_at === null || a.unassigned_at === undefined)
  );
  if (active.length === 0) return null;

  active.sort(
    (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
  );
  return active[0].assigned_to ?? null;
}