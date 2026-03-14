import { createCrudHandlers } from "@/lib/api/crud";
import { messageCreateSchema } from "@/lib/validators/message";

export const { GET, POST } = createCrudHandlers({
  table: "messages",
  schema: messageCreateSchema,
  allowedRoles: ["admin", "provider", "staff", "patient"]
});
