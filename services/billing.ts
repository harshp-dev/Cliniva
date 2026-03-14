export function generateInvoiceNumber(organizationId: string, paymentId: string) {
  return `INV-${organizationId.slice(0, 8).toUpperCase()}-${paymentId.slice(0, 8).toUpperCase()}`;
}

export function nextClaimReminderDate(submittedAt: Date) {
  const next = new Date(submittedAt);
  next.setDate(next.getDate() + 14);
  return next;
}
