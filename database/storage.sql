-- Execute este arquivo no SQL Editor do Supabase para criar o bucket publico
-- usado pelas imagens do catalogo. O nome deve corresponder a
-- SUPABASE_STORAGE_BUCKET (products por padrao).
-- O servidor escreve usando a service role key e a loja le a URL publica.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;
