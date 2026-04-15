export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  if (diffMs < minuteMs) return "just now";

  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(diffMs / hourMs);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(diffMs / dayMs);
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(diffMs / weekMs);
  if (days < 30) return `${weeks} weeks ago`;

  const months = Math.floor(diffMs / monthMs);
  if (months < 12) return `${months} months ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
