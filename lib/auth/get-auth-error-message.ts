export function getAuthErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes("database error querying schema")) {
    return "Supabase Auth is misconfigured for this environment. The 0007 hosted demo bootstrap only seeds app tables and does not repair auth users. Recreate the demo users in Supabase Authentication or run npm run demo:bootstrap, then try again.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "This email address has not been confirmed yet.";
  }

  return message;
}
