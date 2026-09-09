-- Adiciona galeria de mídias (fotos + vídeo) nos produtos
-- Cole no SQL Editor do Supabase e rode

alter table produtos
  add column if not exists midias jsonb not null default '[]'::jsonb;

-- Preenche midias a partir da imagem única existente
update produtos
set midias = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'tipo', 'imagem',
    'url', imagem
  )
)
where coalesce(imagem, '') <> ''
  and (midias is null or midias = '[]'::jsonb);
