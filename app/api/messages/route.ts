import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";
import { messageCreateSchema, messageListQuerySchema } from "@/lib/validators/message";

const CARE_TEAM_ROLES = ["admin", "provider", "staff"] as const;

function isCareTeamRole(role: string) {
  return CARE_TEAM_ROLES.includes(role as (typeof CARE_TEAM_ROLES)[number]);
}

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  const parsedQuery = messageListQuerySchema.safeParse({
    conversation_with: request.nextUrl.searchParams.get("conversation_with") ?? undefined,
    appointment_id: request.nextUrl.searchParams.get("appointment_id") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    offset: request.nextUrl.searchParams.get("offset") ?? undefined
  });

  if (!parsedQuery.success) {
    return error(400, "validation_error", "Invalid query params", parsedQuery.error.flatten());
  }

  const { conversation_with, appointment_id, limit, offset } = parsedQuery.data;

  let query = context.supabase
    .from("messages")
    .select("id, sender_id, recipient_id, appointment_id, content, read_at, created_at, updated_at", {
      count: "exact"
    })
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (conversation_with) {
    query = query.or(
      `and(sender_id.eq.${context.userId},recipient_id.eq.${conversation_with}),and(sender_id.eq.${conversation_with},recipient_id.eq.${context.userId})`
    );
  } else if (context.role === "patient") {
    query = query.or(`sender_id.eq.${context.userId},recipient_id.eq.${context.userId}`);
  }

  if (appointment_id) {
    query = query.eq("appointment_id", appointment_id);
  }

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return error(500, "query_failed", queryError.message);
  }

  return ok(data ?? [], { count: count ?? 0, limit, offset });
}

export async function POST(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = messageCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  if (parsed.data.recipient_id === context.userId) {
    return error(400, "invalid_recipient", "Cannot message yourself");
  }

  const { data: recipient, error: recipientError } = await context.supabase
    .from("users")
    .select("id, role, is_active")
    .eq("organization_id", context.organizationId)
    .eq("id", parsed.data.recipient_id)
    .single();

  if (recipientError || !recipient) {
    return error(404, "not_found", "Recipient not found");
  }

  if (!recipient.is_active) {
    return error(400, "recipient_inactive", "Recipient is inactive");
  }

  if (context.role === "patient" && recipient.role === "patient") {
    return error(403, "forbidden", "Patients can only message care team members");
  }

  if (parsed.data.appointment_id) {
    const { data: appointment, error: appointmentError } = await context.supabase
      .from("appointments")
      .select("id, patient_id, provider_id")
      .eq("organization_id", context.organizationId)
      .eq("id", parsed.data.appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return error(404, "not_found", "Appointment not found");
    }

    if (context.role === "patient") {
      const { data: patient } = await context.supabase
        .from("patients")
        .select("user_id")
        .eq("organization_id", context.organizationId)
        .eq("id", appointment.patient_id)
        .single();

      if (!patient || patient.user_id !== context.userId) {
        return error(403, "forbidden", "You cannot message for this appointment");
      }
    }

    if (context.role === "provider") {
      const { data: provider } = await context.supabase
        .from("providers")
        .select("user_id")
        .eq("organization_id", context.organizationId)
        .eq("id", appointment.provider_id)
        .single();

      if (!provider || provider.user_id !== context.userId) {
        return error(403, "forbidden", "You cannot message for this appointment");
      }
    }
  }

  const { data: message, error: insertError } = await context.supabase
    .from("messages")
    .insert({
      organization_id: context.organizationId,
      sender_id: context.userId,
      recipient_id: parsed.data.recipient_id,
      appointment_id: parsed.data.appointment_id,
      content: parsed.data.content
    })
    .select("id, sender_id, recipient_id, appointment_id, content, read_at, created_at, updated_at")
    .single();

  if (insertError || !message) {
    return error(500, "insert_failed", insertError?.message ?? "Unable to create message");
  }

  if (recipient.role === "patient" || isCareTeamRole(recipient.role)) {
    await context.supabase.from("notifications").insert({
      organization_id: context.organizationId,
      user_id: recipient.id,
      channel: "in_app",
      title: "New secure message",
      body: "You have a new secure message in your care portal.",
      delivery_status: "pending"
    });
  }

  return created(message);
}
