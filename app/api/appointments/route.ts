import { createCrudHandlers } from "@/lib/api/crud";
import { appointmentCreateSchema } from "@/lib/validators/appointment";

export const { GET, POST } = createCrudHandlers({
  table: "appointments",
  schema: appointmentCreateSchema,
  allowedRoles: ["admin", "provider", "staff", "patient"]
});
