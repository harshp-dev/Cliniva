import { createCrudHandlers } from "@/lib/api/crud";
import { notificationCreateSchema } from "@/lib/validators/notification";

export const { GET, POST } = createCrudHandlers({
  table: "notifications",
  schema: notificationCreateSchema,
  allowedRoles: ["admin", "provider", "staff", "patient"]
});
