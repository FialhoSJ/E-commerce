# Evolução do e-commerce

## O que foi implementado

### Banco de dados

- Criado [`database/schema.sql`](database/schema.sql) com modelo PostgreSQL/Supabase.
- O modelo cobre usuários, perfis, categorias, produtos, estoque, endereços, pedidos, itens do pedido e pagamento.
- Adicionados índices e políticas iniciais de Row Level Security para dados privados do cliente.
- Criado [`.env.example`](.env.example) com as variáveis necessárias para conectar banco, frete e pagamento.
- Criado [`lib/server/supabase.ts`](lib/server/supabase.ts) para chamadas server-only à API REST do Supabase.
- `POST /api/orders` persiste pedido e itens no Supabase quando as variáveis do banco estão configuradas; sem elas, usa modo de desenvolvimento.

### Frete

- Criada a camada tipada em [`lib/shipping.ts`](lib/shipping.ts).
- Criada a API `POST /api/shipping/quote`.
- O checkout agora coleta CEP e endereço completo.
- O usuário escolhe entre entrega padrão e expressa.
- Subtotal, frete e total são exibidos separadamente.
- O modo atual usa uma tabela regional de desenvolvimento e frete grátis acima de R$ 250.
- O ponto de integração server-side com Melhor Envio/Frenet está preparado sem expor token ao navegador.

### Checkout e pedidos

- Criada a API `POST /api/orders`.
- O pedido valida usuário, itens, endereço, CEP, quantidade e opção de frete.
- O pedido agora nasce com status `pending_payment`.
- O resumo guarda subtotal, frete, total, endereço e método de envio.
- A página de sucesso exibe frete e status do pedido.
- O carrinho é limpo somente depois que a criação do pedido retorna sucesso.

## Como ativar o banco

1. Crie um projeto PostgreSQL/Supabase.
2. Execute [`database/schema.sql`](database/schema.sql) no SQL Editor.
3. Copie `.env.example` para `.env.local`.
4. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` somente no servidor.
5. Crie os usuários via Supabase Auth e mantenha um registro correspondente em `profiles`, incluindo o e-mail.

O endpoint mantém o modo `development` para permitir demonstração local sem credenciais externas. Quando o Supabase está configurado, ele grava `orders` e `order_items`. Antes do lançamento, essa gravação deve ser movida para uma função SQL transacional que também recalcule preços e estoque a partir do banco, sem confiar no preço enviado pelo navegador.

## Integrações que ainda precisam de credenciais

- Melhor Envio ou Frenet para cotação real, etiqueta e rastreamento.
- Serviço de e-mail para confirmação, recuperação de senha e atualização de rastreio.

### Asaas

- O checkout hospedado do Asaas aceita Pix e cartão de crédito.
- Configure `ASAAS_ENVIRONMENT` como `sandbox` ou `production` e preencha `ASAAS_API_KEY` somente no servidor.
- Configure `ASAAS_WEBHOOK_TOKEN` com um token aleatório de 32 a 255 caracteres. O mesmo token deve ser cadastrado no campo **Auth Token** do webhook Asaas.
- Para bancos já criados, execute `database/asaas_migration.sql` no SQL Editor do Supabase.
- Configure `https://SEU-DOMINIO/api/webhooks/asaas` no painel Asaas, API version 3, envio sequencial, evento `CHECKOUT_PAID`.
- O endpoint confere o header `asaas-access-token`, o ID do checkout e a referência do pedido antes de atualizar o status para `paid`. Eventos repetidos não alteram pedidos já pagos.
- A página de retorno mostra o pedido como pendente até que o webhook confirme o pagamento.

## Pontos de segurança antes de publicar

- Migrar autenticação do `localStorage` para Supabase Auth ou sessão HttpOnly.
- Remover o armazenamento local de senhas e OTP.
- Recalcular preço, estoque e frete no servidor.
- Validar disponibilidade de estoque dentro da mesma transação do pedido.
- Adicionar rate limit, logs e validação de assinatura dos webhooks.
- Restringir o uso da service role key a código server-only.

## Observação de validação

Não foi possível executar `npm run lint` ou `npm run build` neste ambiente porque o Node disponível está sendo executado através de WSL 1, que retorna `WSL 1 is not supported`. A validação deve ser executada em WSL 2, PowerShell ou CI.
