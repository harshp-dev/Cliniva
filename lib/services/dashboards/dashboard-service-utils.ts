export function buildNameMap(
  rows: Array<{ id: string; full_name: string | null }> | null | undefined,
  fallbackLabel: string
) {
  return new Map(
    (rows ?? []).map((row) => [row.id, row.full_name ?? fallbackLabel])
  );
}

export function safeCount(count: number | null) {
  return count ?? 0;
}

