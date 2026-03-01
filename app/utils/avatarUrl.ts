/**
 * Returns a consistent avatar image URL for a given person name.
 * Uses i.pravatar.cc which generates a deterministic photo from the seed.
 */
export function avatarUrl(name: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`
}
