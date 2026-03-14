import { createCrudHandlers } from "@/lib/api/crud";
import { claimCreateSchema } from "@/lib/validators/claim";

export const { GET, POST } = createCrudHandlers({
  table: "claims",
  schema: claimCreateSchema,
  allowedRoles: ["admin", "staff"]
});
