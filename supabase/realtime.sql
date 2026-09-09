-- Rode no SQL Editor se a tela não atualizar ao vivo ao editar no banco
do $$
begin
  begin
    alter publication supabase_realtime add table loja_config;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table produtos;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table produto_variacoes;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table pedidos;
  exception when duplicate_object then null;
  end;
end $$;
