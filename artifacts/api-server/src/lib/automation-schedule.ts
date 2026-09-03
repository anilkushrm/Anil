export function localMinutesAt(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function parseClock(value: string): number {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

export function isQuietTime(date: Date, timezone: string, start: string, end: string): boolean {
  const current = localMinutesAt(date, timezone);
  const startMinutes = parseClock(start);
  const endMinutes = parseClock(end);
  if (startMinutes === endMinutes) return false;
  return startMinutes < endMinutes
    ? current >= startMinutes && current < endMinutes
    : current >= startMinutes || current < endMinutes;
}

export function nextAllowedTime(date: Date, timezone: string, start: string, end: string): Date {
  if (!isQuietTime(date, timezone, start, end)) return date;
  const candidate = new Date(date);
  for (let index = 0; index < 24 * 60 + 1; index += 1) {
    candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);
    if (!isQuietTime(candidate, timezone, start, end)) return candidate;
  }
  return new Date(date.getTime() + 60 * 60 * 1000);
}

export function validateTriggerConfig(triggerType: string, config: string): string | null {
  if (triggerType === "manual") return null;
  const value = config.trim();
  if (!value) return "Automatic sequences require a trigger condition.";
  if (triggerType === "no_reply" && (!Number.isFinite(Number(value)) || Number(value) < 1)) {
    return "No-reply trigger condition must be a delay in minutes.";
  }
  return null;
}

export function isValidTimeZone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}