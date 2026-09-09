-- Atualiza endereço e coordenadas da loja (retirada)
-- Cole no SQL Editor do Supabase e rode

update loja_config
set
  endereco_loja = 'Rua Eugênio Armando Godoy, Quadra X2, Lote 13 — Vila Concórdia, Goiânia/GO — CEP 74770-320',
  lat = -16.66098,
  lng = -49.18812,
  updated_at = now()
where slug = 'emilli';
