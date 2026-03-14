import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";

const uuidSchema = z.string().uuid();
const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { id } = await params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return error(400, "validation_error", "Invalid appointment id");
  }

  const { data: appointment, error: appointmentError } = await context.supabase
    .from("appointments")
    .select("id, starts_at, patient_id, provider_id")
    .eq("organization_id", context.organizationId)
    .eq("id", parsedId.data)
    .single();

  if (appointmentError || !appointment) {
    return error(404, "not_found", "Appointment not found");
  }

  const { data: patient } = await context.supabase
    .from("patients")
    .select("id, user_id")
    .eq("organization_id", context.organizationId)
    .eq("id", appointment.patient_id)
    .single();

  const { data: provider } = await context.supabase
    .from("providers")
    .select("id, user_id")
    .eq("organization_id", context.organizationId)
    .eq("id", appointment.provider_id)
    .single();

  const recipients = [patient?.user_id, provider?.user_id].filter(
    (value): value is string => typeof value === "string"
  );

  if (recipients.length === 0) {
    return error(400, "recipient_missing", "No reminder recipients found for this appointment");
  }

  const reminderBody = `Appointment reminder for ${new Date(appointment.starts_at).toLocaleString()}`;

  const rows = recipients.map((userId) => ({
    organization_id: context.organizationId,
    user_id: userId,
    channel: "in_app",
    title: "Appointment Reminder",
    body: reminderBody,
    delivery_status: "pending"
  }));

  const { data: notifications, error: notificationError } = await context.supabase
    .from("notifications")
    .insert(rows)
    .select("id, user_id, created_at");

  if (notificationError) {
    return error(500, "insert_failed", notificationError.message);
  }

  return ok({ appointment_id: appointment.id, reminders_created: notifications?.length ?? 0, notifications });
}

