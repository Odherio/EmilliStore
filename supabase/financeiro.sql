-- Financeiro EmilliStore — rode no SQL Editor do Supabase

create table if not exists financeiro_lancamentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  forma text not null check (forma in ('dinheiro', 'cartao', 'pix')),
  valor numeric(10,2) not null check (valor > 0),
  descricao text not null default '',
  pedido_id uuid references pedidos(id) on delete set null,
  pedido_codigo text
);

create index if not exists financeiro_lancamentos_criado_em_idx
  on financeiro_lancamentos (criado_em desc);

alter table financeiro_lancamentos enable row level security;

-- Só admin autenticado lê/escreve/exclui
drop policy if exists "admin all financeiro" on financeiro_lancamentos;
create policy "admin all financeiro" on financeiro_lancamentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Realtime opcional
do $$
begin
  alter publication supabase_realtime add table financeiro_lancamentos;
exception
  when duplicate_object then null;
end $$;
