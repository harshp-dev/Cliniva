-- 005_medication_catalog_and_interactions.sql
create table if not exists public.medication_interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  medication_id_1 uuid not null references public.medications(id) on delete cascade,
  medication_id_2 uuid not null references public.medications(id) on delete cascade,
  severity text not null check (severity in ('low','medium','high')),
  message text not null,
  recommendation text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (medication_id_1 <> medication_id_2)
);

create unique index if not exists uq_medications_org_name on public.medications(organization_id, lower(name));
create unique index if not exists uq_medication_interactions_pair
on public.medication_interactions (
  organization_id,
  least(medication_id_1, medication_id_2),
  greatest(medication_id_1, medication_id_2)
);

drop trigger if exists medication_interactions_set_updated_at on public.medication_interactions;
create trigger medication_interactions_set_updated_at
before update on public.medication_interactions
for each row execute function public.set_updated_at();

alter table public.medication_interactions enable row level security;

drop policy if exists medication_interactions_select on public.medication_interactions;
create policy medication_interactions_select on public.medication_interactions
for select
using (organization_id = public.current_org_id());

drop policy if exists medication_interactions_insert on public.medication_interactions;
create policy medication_interactions_insert on public.medication_interactions
for insert
with check (
  organization_id = public.current_org_id()
  and public.has_any_role(array['admin'::public.app_role, 'provider'::public.app_role, 'staff'::public.app_role])
);

drop policy if exists medication_interactions_update on public.medication_interactions;
create policy medication_interactions_update on public.medication_interactions
for update
using (
  organization_id = public.current_org_id()
  and public.has_any_role(array['admin'::public.app_role, 'provider'::public.app_role, 'staff'::public.app_role])
)
with check (organization_id = public.current_org_id());

drop policy if exists medication_interactions_delete on public.medication_interactions;
create policy medication_interactions_delete on public.medication_interactions
for delete
using (
  organization_id = public.current_org_id()
  and public.has_any_role(array['admin'::public.app_role, 'provider'::public.app_role, 'staff'::public.app_role])
);

with seed_medications(name, rxnorm_code, description) as (
  values
    ('Warfarin', '11289', 'Anticoagulant used to prevent blood clots.'),
    ('Aspirin', '1191', 'Antiplatelet and anti-inflammatory medication.'),
    ('Lisinopril', '29046', 'ACE inhibitor for hypertension and heart failure.'),
    ('Spironolactone', '9997', 'Potassium-sparing diuretic and aldosterone antagonist.'),
    ('Metformin', '6809', 'First-line oral medication for type 2 diabetes.'),
    ('Atorvastatin', '83367', 'Statin used to lower LDL cholesterol.'),
    ('Amoxicillin', '723', 'Beta-lactam antibiotic for bacterial infections.'),
    ('Albuterol', '435', 'Short-acting bronchodilator for asthma symptoms.')
)
insert into public.medications (organization_id, name, rxnorm_code, description)
select o.id, m.name, m.rxnorm_code, m.description
from public.organizations o
cross join seed_medications m
on conflict do nothing;

with interaction_seed(med_a, med_b, severity, message, recommendation) as (
  values
    ('Warfarin', 'Aspirin', 'high', 'Concomitant use increases bleeding risk.', 'Use only with close INR monitoring and clear indication.'),
    ('Lisinopril', 'Spironolactone', 'medium', 'Combined use can increase potassium levels.', 'Check renal function and serum potassium regularly.'),
    ('Metformin', 'Atorvastatin', 'low', 'No major direct interaction, monitor glycemic control changes.', 'Continue routine glucose monitoring.')
)
insert into public.medication_interactions (
  organization_id,
  medication_id_1,
  medication_id_2,
  severity,
  message,
  recommendation
)
select
  o.id,
  m1.id,
  m2.id,
  i.severity,
  i.message,
  i.recommendation
from public.organizations o
join interaction_seed i on true
join public.medications m1 on m1.organization_id = o.id and lower(m1.name) = lower(i.med_a)
join public.medications m2 on m2.organization_id = o.id and lower(m2.name) = lower(i.med_b)
on conflict do nothing;
