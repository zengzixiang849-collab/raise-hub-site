// Resolve related-content ids and fail the build on a typo, with the file,
// field and valid ids in the message (instead of silently dropping the link).
export function resolveRefs<T extends { id: string }>(
  ids: readonly string[],
  pool: readonly T[],
  file: string,
  field: string,
): T[] {
  return ids.map((id) => {
    const hit = pool.find((p) => p.id === id);
    if (!hit) {
      throw new Error(
        `${file}: ${field} contains unknown id "${id}". Valid ids: ${pool.map((p) => p.id).join(', ')}`,
      );
    }
    return hit;
  });
}
