const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateLabel(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTimeLabel(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTimeRangeLabel(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);

  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

export function formatRelativeDateLabel(value: string) {
  const target = new Date(value);
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayDiff = Math.round((targetStart - todayStart) / 86400000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";
  if (dayDiff === -1) return "Yesterday";

  return formatDateLabel(value);
}

export function formatWeekdayLabel(dayOfWeek: number) {
  const baseDate = new Date(Date.UTC(2026, 0, 4 + dayOfWeek));
  return weekdayFormatter.format(baseDate);
}

export function formatClockLabel(value: string) {
  const [hours, minutes] = value.split(":");
  const date = new Date(Date.UTC(2026, 0, 1, Number(hours), Number(minutes)));

  return timeFormatter.format(date);
}

export function getCurrentIsoTimestamp() {
  return new Date().toISOString();
}
