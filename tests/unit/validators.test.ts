import { describe, expect, test } from "vitest";
import { appointmentCreateSchema } from "@/lib/validators/appointment";
import { messageCreateSchema, messageListQuerySchema } from "@/lib/validators/message";
import { notificationCreateSchema } from "@/lib/validators/notification";
import { patientCreateSchema } from "@/lib/validators/patient";

describe("validators", () => {
  test("patient schema accepts onboarding payload", () => {
    const result = patientCreateSchema.safeParse({
      mrn: "MRN-1001",
      date_of_birth: "1990-06-10",
      phone: "+1-555-0110",
      emergency_contact: {
        name: "John Doe",
        phone: "+1-555-0111"
      }
    });

    expect(result.success).toBe(true);
  });

  test("appointment schema enforces time range", () => {
    const result = appointmentCreateSchema.safeParse({
      patient_id: "00000000-0000-0000-0000-000000000000",
      provider_id: "00000000-0000-0000-0000-000000000001",
      starts_at: "2026-04-01T10:00:00.000Z",
      ends_at: "2026-04-01T09:00:00.000Z"
    });

    expect(result.success).toBe(false);
  });

  test("message schema requires recipient and content", () => {
    const result = messageCreateSchema.safeParse({
      recipient_id: "00000000-0000-0000-0000-000000000001",
      content: "Follow-up on your treatment plan."
    });

    expect(result.success).toBe(true);
  });

  test("message query schema validates UUID conversation id", () => {
    const result = messageListQuerySchema.safeParse({
      conversation_with: "invalid-value",
      limit: "20",
      offset: "0"
    });

    expect(result.success).toBe(false);
  });

  test("notification schema enforces channel values", () => {
    const result = notificationCreateSchema.safeParse({
      user_id: "00000000-0000-0000-0000-000000000002",
      channel: "fax",
      title: "Reminder",
      body: "Please complete intake forms."
    });

    expect(result.success).toBe(false);
  });
});
