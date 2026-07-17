/** Escape user-authored text for safe React text rendering (no HTML injection). */
export function sanitizeUserText(input: string, maxLength = 2000): string {
  if (!input) return "";
  // Normalize + strip control chars; React text nodes already escape HTML —
  // this layer also removes script-like patterns and enforces length.
  const cleaned = input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
  return cleaned.slice(0, maxLength);
}

export function validateImageFile(file: File): { ok: true } | { ok: false; reason: string } {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { ok: false, reason: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, reason: "Image must be 5 MB or smaller." };
  }
  return { ok: true };
}
