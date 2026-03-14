const REDACTED_KEYS = ["password", "token", "authorization", "medical_record", "diagnosis", "note"];

function sanitize(payload: Record<string, unknown>) {
  const next = { ...payload };
  for (const key of Object.keys(next)) {
    if (REDACTED_KEYS.some((redacted) => key.toLowerCase().includes(redacted))) {
      next[key] = "[REDACTED]";
    }
  }
  return next;
}

export const logger = {
  info(event: string, payload: Record<string, unknown> = {}) {
    console.info(event, sanitize(payload));
  },
  warn(event: string, payload: Record<string, unknown> = {}) {
    console.warn(event, sanitize(payload));
  },
  error(event: string, payload: Record<string, unknown> = {}) {
    console.error(event, sanitize(payload));
  }
};
