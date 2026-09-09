-- Cole TUDO abaixo de uma vez no SQL Editor do Supabase e clique Run

create extension if not exists "pgcrypto";

create table if not exists public.financeiro_lancamentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  forma text not null check (forma in ('dinheiro', 'cartao', 'pix')),
  valor numeric(10,2) not null check (valor > 0),
  descricao text not null default '',
  pedido_id uuid null,
  pedido_codigo text null
);

-- FK opcional (só se a tabela pedidos já existir)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'pedidos'
  ) then
    begin
      alter table public.financeiro_lancamentos
        add constraint financeiro_lancamentos_pedido_id_fkey
        foreign key (pedido_id) references public.pedidos(id) on delete set null;
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

create index if not exists financeiro_lancamentos_criado_em_idx
  on public.financeiro_lancamentos (criado_em desc);

alter table public.financeiro_lancamentos enable row level security;

drop policy if exists "admin all financeiro" on public.financeiro_lancamentos;
create policy "admin all financeiro" on public.financeiro_lancamentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
