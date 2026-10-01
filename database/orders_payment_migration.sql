-- Execute no SQL Editor do Supabase para habilitar pedidos com referência ao provedor de pagamento.
-- Pedidos podem pertencer a perfis Supabase (user_id preenchido) ou às contas locais atuais.
alter table orders alter column user_id drop not null;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists payment_provider text;
alter table orders add column if not exists payment_reference text;

-- Mantém os dados antigos compatíveis com a nova coluna obrigatória no schema.
update orders o
set customer_email = p.email
from profiles p
where o.user_id = p.id and o.customer_email is null;

update orders set customer_email = 'desconhecido@lacis.local' where customer_email is null;
alter table orders alter column customer_email set not null;
