-- Permite admin excluir pedidos (e itens em cascade)
-- Cole no SQL Editor e rode

drop policy if exists "admin delete pedidos" on public.pedidos;
create policy "admin delete pedidos" on public.pedidos for delete
  using (auth.role() = 'authenticated');

drop policy if exists "admin delete pedido_itens" on public.pedido_itens;
create policy "admin delete pedido_itens" on public.pedido_itens for delete
  using (auth.role() = 'authenticated');
