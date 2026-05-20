import md5 from "md5";

/**
 * Returns a Gravatar URL for the given email address.
 * Falls back to "mp" (mystery person silhouette) when no Gravatar is set.
 */
export function gravatarUrl(email: string, size = 80): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}
