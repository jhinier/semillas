alter table public.miembro_club
  add column if not exists token_publico uuid;

update public.miembro_club
set token_publico = gen_random_uuid()
where token_publico is null;

alter table public.miembro_club
  alter column token_publico set default gen_random_uuid(),
  alter column token_publico set not null;

create unique index if not exists uq_miembro_club_token_publico
  on public.miembro_club (token_publico);
