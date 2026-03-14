import { createCrudHandlers } from "@/lib/api/crud";
import { medicalRecordCreateSchema } from "@/lib/validators/medical-record";

export const { GET, POST } = createCrudHandlers({
  table: "medical_records",
  schema: medicalRecordCreateSchema,
  allowedRoles: ["admin", "provider", "staff"]
});
