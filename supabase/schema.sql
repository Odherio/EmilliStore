-- EmilliStore — rode no SQL Editor do Supabase (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- Configuração da loja (1 linha)
create table if not exists loja_config (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'emilli',
  nome text not null default 'EmilliStore',
  whatsapp text not null default '',
  endereco_loja text not null default 'Rua Eugênio Armando Godoy, Quadra X2, Lote 13 — Vila Concórdia, Goiânia/GO — CEP 74770-320',
  lat double precision not null default -16.66098,
  lng double precision not null default -49.18812,
  capa_url text not null default '',
  hero_eyebrow text not null default '',
  hero_titulo text not null default '',
  hero_titulo_destaque text not null default '',
  hero_subtitulo text not null default '',
  banner_slides jsonb not null default '[]'::jsonb,
  banner_interval_ms integer not null default 5000,
  frete jsonb not null default '{"taxaBase":8,"precoPorKm":2.5,"raioMaxKm":15,"freteGratisAcima":250}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Produtos
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null default '',
  marca text not null default 'Emilli',
  categoria text not null default 'Geral',
  preco numeric(10,2) not null default 0,
  imagem text not null default '',
  ativo boolean not null default true,
  destaque boolean not null default false,
  promocao boolean not null default false,
  lancamento boolean not null default false,
  created_at timestamptz not null default now()
);

-- Variações (tamanhos)
create table if not exists produto_variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  nome text not null,
  estoque integer not null default 0
);

-- Pedidos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  criado_em timestamptz not null default now(),
  cliente_nome text not null,
  cliente_whatsapp text not null,
  cliente_email text not null default '',
  observacoes text not null default '',
  tipo_entrega text not null check (tipo_entrega in ('retirada', 'entrega')),
  endereco jsonb,
  distancia_km double precision,
  taxa_entrega numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'pendente'
    check (status in ('pendente','confirmado','em_entrega','retirado','cancelado'))
);

create table if not exists pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id text,
  variacao_id text,
  nome text not null,
  variacao text not null default '',
  imagem text not null default '',
  preco numeric(10,2) not null,
  quantidade integer not null
);

-- Seed config
insert into loja_config (slug, nome, whatsapp)
values ('emilli', 'EmilliStore', '11999999999')
on conflict (slug) do nothing;

-- Storage para fotos de produtos
insert into storage.buckets (id, name, public)
values ('produto-imagens', 'produto-imagens', true)
on conflict (id) do nothing;

-- RLS
alter table loja_config enable row level security;
alter table produtos enable row level security;
alter table produto_variacoes enable row level security;
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;

-- Público: ler loja e catálogo
drop policy if exists "public read loja_config" on loja_config;
create policy "public read loja_config" on loja_config for select using (true);

drop policy if exists "public read produtos" on produtos;
create policy "public read produtos" on produtos for select using (true);

drop policy if exists "public read variacoes" on produto_variacoes;
create policy "public read variacoes" on produto_variacoes for select using (true);

-- Público: criar pedido (checkout)
drop policy if exists "public insert pedidos" on pedidos;
create policy "public insert pedidos" on pedidos for insert with check (true);

drop policy if exists "public insert pedido_itens" on pedido_itens;
create policy "public insert pedido_itens" on pedido_itens for insert with check (true);

drop policy if exists "public read pedidos" on pedidos;
create policy "public read pedidos" on pedidos for select using (true);

drop policy if exists "public read pedido_itens" on pedido_itens;
create policy "public read pedido_itens" on pedido_itens for select using (true);

-- Checkout: permitir baixar estoque sem login
drop policy if exists "public update stock variacoes" on produto_variacoes;
create policy "public update stock variacoes"
  on produto_variacoes for update
  using (true)
  with check (true);

-- Admin autenticado: escrever tudo
drop policy if exists "admin write loja_config" on loja_config;
create policy "admin write loja_config" on loja_config for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write produtos" on produtos;
create policy "admin write produtos" on produtos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write variacoes" on produto_variacoes;
create policy "admin write variacoes" on produto_variacoes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin update pedidos" on pedidos;
create policy "admin update pedidos" on pedidos for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage público leitura / autenticado upload
drop policy if exists "public read produto imagens" on storage.objects;
create policy "public read produto imagens" on storage.objects
  for select using (bucket_id = 'produto-imagens');

drop policy if exists "admin upload produto imagens" on storage.objects;
create policy "admin upload produto imagens" on storage.objects
  for insert with check (bucket_id = 'produto-imagens' and auth.role() = 'authenticated');

drop policy if exists "admin update produto imagens" on storage.objects;
create policy "admin update produto imagens" on storage.objects
  for update using (bucket_id = 'produto-imagens' and auth.role() = 'authenticated');

drop policy if exists "admin delete produto imagens" on storage.objects;
create policy "admin delete produto imagens" on storage.objects
  for delete using (bucket_id = 'produto-imagens' and auth.role() = 'authenticated');

-- Realtime: para a tela atualizar quando editar no Table Editor
alter publication supabase_realtime add table loja_config;
alter publication supabase_realtime add table produtos;
alter publication supabase_realtime add table produto_variacoes;
alter publication supabase_realtime add table pedidos;
