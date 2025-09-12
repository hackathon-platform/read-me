export default function formatJPDateLocal(s?: string | null) {
  if (!s) return null;
  try {
    return new Date(s).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour12: false,
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}
