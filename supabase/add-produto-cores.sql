-- Cores nos produtos
-- Cole no SQL Editor e rode

alter table public.produtos
  add column if not exists cores jsonb not null default '[]'::jsonb;
