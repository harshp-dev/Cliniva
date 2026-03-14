import { describe, expect, test } from "vitest";
import { created, error, ok } from "@/lib/api/response";

describe("api response helper", () => {
  test("ok creates success response", async () => {
    const response = ok({ ping: "pong" });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.ping).toBe("pong");
  });

  test("error creates failure response", async () => {
    const response = error(400, "validation_error", "Invalid payload");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("validation_error");
  });

  test("created returns 201", async () => {
    const response = created({ id: "abc" });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("abc");
  });
});
