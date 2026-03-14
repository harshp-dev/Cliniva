interface MessageTemplateParams {
  patientFirstName: string;
  appointmentTime: string;
}

export function appointmentReminderTemplate(params: MessageTemplateParams) {
  return `Reminder: ${params.patientFirstName}, your virtual visit is scheduled for ${params.appointmentTime}.`;
}

export function sanitizeOutboundMessage(input: string) {
  return input.replace(/[\r\n]+/g, " ").trim();
}
