-- Cole no SQL Editor e rode (corrige o erro 42501 de RLS)

-- Baixa de estoque no checkout (cliente anônimo precisa atualizar variação)
drop policy if exists "public update stock variacoes" on produto_variacoes;
create policy "public update stock variacoes"
  on produto_variacoes for update
  using (true)
  with check (true);

-- (Opcional MVP) Se quiser cadastrar produto SEM estar logado no Auth, descomente:
-- drop policy if exists "public write produtos mvp" on produtos;
-- create policy "public write produtos mvp" on produtos for all using (true) with check (true);
-- drop policy if exists "public write variacoes mvp" on produto_variacoes;
-- create policy "public write variacoes mvp" on produto_variacoes for all using (true) with check (true);
-- drop policy if exists "public write loja_config mvp" on loja_config;
-- create policy "public write loja_config mvp" on loja_config for all using (true) with check (true);
