# Agent Workflow Notes

## Code Standards

- Use strict TypeScript and Zod input validation.
- Keep API response shape consistent.
- Avoid logging PHI and redact sensitive fields.

## Safety Practices

- Validate tenant context at middleware and DB policy layers.
- Enforce least privilege for roles and service keys.
- Keep secrets only in environment variables.

## Operational Checklist

1. Run `npm run lint && npm run test` before merge.
2. Review RLS policies for every new table.
3. Add audit log events for privileged actions.
4. Include migration and rollback notes in PR.
