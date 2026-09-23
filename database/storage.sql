-- Cria o bucket usado pelas imagens do catalogo.
-- O servidor escreve usando a service role key e a loja le a URL publica.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;
