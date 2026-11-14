export function formatDateTime(date: string): string;
export function formatDateTime(date: null): null;
export function formatDateTime(date: string | null): string | null;
export function formatDateTime(date: string | null) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDate(date: string): string;
export function formatDate(date: null): null;
export function formatDate(date: string | null): string | null;
export function formatDate(date: string | null) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}