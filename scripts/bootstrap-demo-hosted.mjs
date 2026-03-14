import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = "ClinivaDemo!23";

const DEMO_USERS = {
  admin: {
    email: "ava.thompson@cliniva.com",
    fullName: "Ava Thompson",
    role: "admin",
    phone: "+1-415-555-0130",
  },
  ethan: {
    email: "ethan.parker@cliniva.com",
    fullName: "Dr. Ethan Parker",
    role: "provider",
    phone: "+1-212-555-0174",
    specialty: "Primary Care",
    licenseNumber: "CA-PCM-34821",
    yearsExperience: 12,
    bio: "Board-certified primary care physician focused on preventive medicine and chronic care.",
  },
  maya: {
    email: "maya.collins@cliniva.com",
    fullName: "Dr. Maya Collins",
    role: "provider",
    phone: "+1-617-555-0182",
    specialty: "Mental Health",
    licenseNumber: "MA-MH-55910",
    yearsExperience: 9,
    bio: "Licensed mental health provider specializing in anxiety, depression, and stress management.",
  },
  olivia: {
    email: "olivia.carter@cliniva.com",
    fullName: "Olivia Carter",
    role: "patient",
    phone: "+1-312-555-0191",
    dateOfBirth: "1991-04-12",
    gender: "female",
    address: "1841 Market St, San Francisco, CA",
    emergencyContact: {
      name: "Daniel Carter",
      phone: "+1-415-555-0101",
      relationship: "spouse",
    },
  },
  noah: {
    email: "noah.bennett@cliniva.com",
    fullName: "Noah Bennett",
    role: "patient",
    phone: "+1-206-555-0146",
    dateOfBirth: "1987-11-02",
    gender: "male",
    address: "420 Pine St, Seattle, WA",
    emergencyContact: {
      name: "Claire Bennett",
      phone: "+1-206-555-0123",
      relationship: "spouse",
    },
  },
  sophia: {
    email: "sophia.reed@cliniva.com",
    fullName: "Sophia Reed",
    role: "patient",
    phone: "+1-646-555-0168",
    dateOfBirth: "1995-08-23",
    gender: "female",
    address: "88 Madison Ave, New York, NY",
    emergencyContact: {
      name: "Robert Reed",
      phone: "+1-212-555-0108",
      relationship: "father",
    },
  },
};

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['\"]|['\"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function addDays(date, days, hours, minutes) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  next.setUTCHours(hours, minutes, 0, 0);
  return next;
}

async function findProfileUserIdByEmail(adminClient, email) {
  const { data, error } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function ensureAuthUser(adminClient, input) {
  const existingUserId = await findProfileUserIdByEmail(adminClient, input.email);

  if (existingUserId) {
    const { data, error } = await adminClient.auth.admin.updateUserById(existingUserId, {
      email: input.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role: input.role,
        phone: input.phone,
      },
    });

    if (!error) {
      return data.user;
    }

    console.warn("[demo-bootstrap] update by profile id failed, falling back to createUser", {
      email: input.email,
      code: error.code,
      message: error.message,
    });
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      role: input.role,
      phone: input.phone,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function ensureExactRow(client, table, match, insertPayload) {
  let query = client.from(table).select("id").limit(1);
  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  if ((data ?? []).length > 0) {
    return data[0];
  }

  const { data: inserted, error: insertError } = await client
    .from(table)
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return inserted;
}

async function upsertProfiles(client, ids) {
  const profileRows = Object.values(DEMO_USERS).map((user) => ({
    id: ids[user.email],
    role: user.role,
    full_name: user.fullName,
    email: user.email,
    phone: user.phone,
  }));

  const { error } = await client.from("profiles").upsert(profileRows, { onConflict: "id" });
  if (error) {
    throw error;
  }
}

async function upsertProviderProfiles(client, ids) {
  const providers = [DEMO_USERS.ethan, DEMO_USERS.maya].map((provider) => ({
    user_id: ids[provider.email],
    specialty: provider.specialty,
    license_number: provider.licenseNumber,
    years_experience: provider.yearsExperience,
    bio: provider.bio,
  }));

  const { error } = await client.from("provider_profiles").upsert(providers, { onConflict: "user_id" });
  if (error) {
    throw error;
  }
}

async function upsertPatientProfiles(client, ids) {
  const patients = [DEMO_USERS.olivia, DEMO_USERS.noah, DEMO_USERS.sophia].map((patient) => ({
    user_id: ids[patient.email],
    date_of_birth: patient.dateOfBirth,
    gender: patient.gender,
    address: patient.address,
    emergency_contact: patient.emergencyContact,
  }));

  const { error } = await client.from("patient_profiles").upsert(patients, { onConflict: "user_id" });
  if (error) {
    throw error;
  }
}

async function ensureAvailability(client, providerUserId, dayOfWeek, startTime, endTime, timezone) {
  await ensureExactRow(
    client,
    "provider_availability",
    {
      provider_user_id: providerUserId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      timezone,
    },
    {
      provider_user_id: providerUserId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      timezone,
    }
  );
}

async function ensureAppointment(client, payload) {
  const { data, error } = await client
    .from("appointments")
    .select("id, status")
    .eq("patient_user_id", payload.patient_user_id)
    .eq("provider_user_id", payload.provider_user_id)
    .eq("start_at", payload.start_at)
    .eq("end_at", payload.end_at)
    .limit(1);

  if (error) {
    throw error;
  }

  if ((data ?? []).length > 0) {
    const existing = data[0];
    const { error: updateError } = await client
      .from("appointments")
      .update({
        status: payload.status,
        reason: payload.reason,
        notes: payload.notes,
      })
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    return existing.id;
  }

  const { data: inserted, error: insertError } = await client
    .from("appointments")
    .insert(payload)
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return inserted.id;
}

async function ensureConsultationSession(client, payload) {
  const { data, error } = await client
    .from("consultation_sessions")
    .select("id")
    .eq("appointment_id", payload.appointment_id)
    .limit(1);

  if (error) {
    throw error;
  }

  if ((data ?? []).length > 0) {
    const { error: updateError } = await client
      .from("consultation_sessions")
      .update(payload)
      .eq("id", data[0].id);

    if (updateError) {
      throw updateError;
    }

    return data[0].id;
  }

  const { error: insertError } = await client.from("consultation_sessions").insert(payload);
  if (insertError) {
    throw insertError;
  }

  return null;
}

async function ensureSoapNote(client, payload) {
  const { data, error } = await client
    .from("soap_notes")
    .select("id")
    .eq("appointment_id", payload.appointment_id)
    .limit(1);

  if (error) {
    throw error;
  }

  if ((data ?? []).length > 0) {
    const { error: updateError } = await client
      .from("soap_notes")
      .update(payload)
      .eq("id", data[0].id);

    if (updateError) {
      throw updateError;
    }

    return data[0].id;
  }

  const { error: insertError } = await client.from("soap_notes").insert(payload);
  if (insertError) {
    throw insertError;
  }

  return null;
}

async function ensureNotification(client, payload) {
  await ensureExactRow(
    client,
    "notifications",
    {
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
    },
    payload
  );
}

async function ensureAuditLog(client, payload) {
  const { data, error } = await client
    .from("audit_logs")
    .select("id")
    .eq("actor_user_id", payload.actor_user_id)
    .eq("action", payload.action)
    .eq("entity_type", payload.entity_type)
    .limit(1);

  if (error) {
    throw error;
  }

  if ((data ?? []).length > 0) {
    return data[0].id;
  }

  const { error: insertError } = await client.from("audit_logs").insert(payload);
  if (insertError) {
    throw insertError;
  }

  return null;
}

async function main() {
  loadEnvFile();

  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("[demo-bootstrap] ensuring auth users");
  const ids = {};
  for (const user of Object.values(DEMO_USERS)) {
    const authUser = await ensureAuthUser(adminClient, user);
    ids[user.email] = authUser.id;
  }

  console.log("[demo-bootstrap] ensuring profiles");
  await upsertProfiles(adminClient, ids);
  await upsertProviderProfiles(adminClient, ids);
  await upsertPatientProfiles(adminClient, ids);

  console.log("[demo-bootstrap] ensuring availability");
  await ensureAvailability(adminClient, ids[DEMO_USERS.ethan.email], 1, "09:00", "12:00", "America/Los_Angeles");
  await ensureAvailability(adminClient, ids[DEMO_USERS.ethan.email], 3, "13:00", "17:00", "America/Los_Angeles");
  await ensureAvailability(adminClient, ids[DEMO_USERS.maya.email], 2, "10:00", "14:00", "America/New_York");
  await ensureAvailability(adminClient, ids[DEMO_USERS.maya.email], 4, "09:00", "12:00", "America/New_York");

  const now = new Date();
  const requestedStart = addDays(now, 2, 15, 0);
  const requestedEnd = addDays(now, 2, 15, 30);
  const confirmedStart = addDays(now, 5, 17, 0);
  const confirmedEnd = addDays(now, 5, 17, 30);
  const completedStart = addDays(now, -7, 18, 0);
  const completedEnd = addDays(now, -7, 18, 45);

  console.log("[demo-bootstrap] ensuring appointments");
  const requestedAppointmentId = await ensureAppointment(adminClient, {
    patient_user_id: ids[DEMO_USERS.olivia.email],
    provider_user_id: ids[DEMO_USERS.ethan.email],
    status: "requested",
    start_at: requestedStart.toISOString(),
    end_at: requestedEnd.toISOString(),
    reason: "Seasonal allergies consultation",
    notes: "Patient would like guidance on symptoms and medication options.",
  });

  const confirmedAppointmentId = await ensureAppointment(adminClient, {
    patient_user_id: ids[DEMO_USERS.sophia.email],
    provider_user_id: ids[DEMO_USERS.ethan.email],
    status: "confirmed",
    start_at: confirmedStart.toISOString(),
    end_at: confirmedEnd.toISOString(),
    reason: "Annual wellness visit",
    notes: "Discuss preventive care and routine labs.",
  });

  const completedAppointmentId = await ensureAppointment(adminClient, {
    patient_user_id: ids[DEMO_USERS.noah.email],
    provider_user_id: ids[DEMO_USERS.maya.email],
    status: "completed",
    start_at: completedStart.toISOString(),
    end_at: completedEnd.toISOString(),
    reason: "Follow-up for anxiety management",
    notes: "Review progress and adjust coping plan.",
  });

  console.log("[demo-bootstrap] ensuring consultation and notes");
  await ensureConsultationSession(adminClient, {
    appointment_id: completedAppointmentId,
    patient_user_id: ids[DEMO_USERS.noah.email],
    provider_user_id: ids[DEMO_USERS.maya.email],
    status: "completed",
    room_id: `demo-room-${completedAppointmentId}`,
    room_url: `/consultations/${completedAppointmentId}`,
    started_at: completedStart.toISOString(),
    ended_at: completedEnd.toISOString(),
  });

  await ensureSoapNote(adminClient, {
    appointment_id: completedAppointmentId,
    patient_user_id: ids[DEMO_USERS.noah.email],
    provider_user_id: ids[DEMO_USERS.maya.email],
    subjective: "Patient reports improved sleep and reduced daytime anxiety over the last two weeks.",
    objective: "Affect stable, normal speech, no acute distress noted.",
    assessment: "Generalized anxiety disorder, improving with current plan.",
    plan: "Continue current techniques, add 10-minute daily mindfulness practice, follow up in 4 weeks.",
    is_shared_with_patient: true,
  });

  console.log("[demo-bootstrap] ensuring notifications");
  await ensureNotification(adminClient, {
    user_id: ids[DEMO_USERS.olivia.email],
    type: "appointment",
    title: "Appointment request received",
    body: "Your appointment request has been sent to the provider and is awaiting review.",
  });
  await ensureNotification(adminClient, {
    user_id: ids[DEMO_USERS.sophia.email],
    type: "appointment",
    title: "Appointment confirmed",
    body: "Your upcoming wellness visit is confirmed and visible in your dashboard.",
  });
  await ensureNotification(adminClient, {
    user_id: ids[DEMO_USERS.noah.email],
    type: "note",
    title: "Consultation summary available",
    body: "Your provider shared a SOAP note from the completed follow-up visit.",
  });
  await ensureNotification(adminClient, {
    user_id: ids[DEMO_USERS.ethan.email],
    type: "appointment",
    title: "New appointment request",
    body: "A patient has requested a seasonal allergies consultation and is waiting for provider review.",
  });
  await ensureNotification(adminClient, {
    user_id: ids[DEMO_USERS.maya.email],
    type: "consultation",
    title: "Completed visit documented",
    body: "A completed mental-health follow-up with a shared SOAP note is available in your recent activity.",
  });
  await ensureNotification(adminClient, {
    user_id: ids[DEMO_USERS.admin.email],
    type: "system",
    title: "Demo environment ready",
    body: "Hosted demo accounts, appointments, notes, and audit events have been refreshed.",
  });

  console.log("[demo-bootstrap] ensuring audit logs");
  await ensureAuditLog(adminClient, {
    actor_user_id: ids[DEMO_USERS.admin.email],
    action: "seed.created",
    entity_type: "system",
    entity_id: null,
    metadata: { source: "bootstrap-demo-hosted" },
  });
  await ensureAuditLog(adminClient, {
    actor_user_id: ids[DEMO_USERS.admin.email],
    action: "provider.reviewed",
    entity_type: "provider_profile",
    entity_id: ids[DEMO_USERS.ethan.email],
    metadata: { note: "Seeded provider roster review" },
  });
  await ensureAuditLog(adminClient, {
    actor_user_id: ids[DEMO_USERS.admin.email],
    action: "appointment.monitored",
    entity_type: "appointment",
    entity_id: requestedAppointmentId,
    metadata: { source: "bootstrap-demo-hosted", scope: "admin_dashboard" },
  });
  await ensureAuditLog(adminClient, {
    actor_user_id: ids[DEMO_USERS.admin.email],
    action: "appointment.monitored",
    entity_type: "appointment",
    entity_id: confirmedAppointmentId,
    metadata: { source: "bootstrap-demo-hosted", scope: "admin_dashboard" },
  });

  console.log("[demo-bootstrap] complete");
  console.log(`Admin: ${DEMO_USERS.admin.email}`);
  console.log(`Providers: ${DEMO_USERS.ethan.email}, ${DEMO_USERS.maya.email}`);
  console.log(`Patients: ${DEMO_USERS.olivia.email}, ${DEMO_USERS.noah.email}, ${DEMO_USERS.sophia.email}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error("[demo-bootstrap] failed", error);

  if (error?.code === "unexpected_failure") {
    console.error(
      "[demo-bootstrap] Supabase Auth has inconsistent demo-user rows. Run supabase/migrations/0008_demo_auth_repair.sql in the SQL Editor, then rerun npm run demo:bootstrap."
    );
  }

  process.exitCode = 1;
});


