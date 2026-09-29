This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Configuração do administrador e catálogo

O acesso administrativo usa o e-mail definido em `ADMIN_EMAIL` (no exemplo, `admin@admin.com`) e a senha privada definida em `ADMIN_PASSWORD`. Copie `.env.example` para `.env.local`, substitua os valores de exemplo e defina `ADMIN_SESSION_SECRET` com um segredo aleatório longo. Essas variáveis devem ficar somente no servidor.

O catálogo precisa do Supabase configurado em `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Em um banco novo, execute `database/schema.sql` no SQL Editor do Supabase. Se a tabela `products` já existir, execute `database/admin_catalog_migration.sql`.

Para habilitar o checkout de teste do AbacatePay, execute também `database/abacatepay_migration.sql` em bancos existentes e configure `ABACATEPAY_API_KEY` no `.env.local` (somente servidor). Configure o webhook `/api/webhooks/abacatepay` no painel AbacatePay com `checkout.completed` e o mesmo `ABACATEPAY_WEBHOOK_SECRET` do servidor. O webhook exige URL HTTPS pública; para desenvolvimento local, use um túnel HTTPS.

## Contas de clientes com Supabase Auth

O cadastro, login, confirmação de e-mail, recuperação de senha e sessão dos clientes usam Supabase Auth. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no `.env.local` e também nas variáveis da Netlify. A chave `SUPABASE_SERVICE_ROLE_KEY` continua restrita ao servidor.

No painel do Supabase, habilite o provedor de e-mail, ative a confirmação de e-mail e defina a URL do site como `https://lacis-commerce.netlify.app`. Na lista de redirecionamento, permita `http://localhost:3000/**`, `https://lacis-commerce.netlify.app/auth/callback**` e `https://lacis-commerce.netlify.app/reset-password**`. Configure SMTP próprio antes de depender dos e-mails em produção.

Em um banco já criado, execute `database/supabase_auth_migration.sql` depois de `database/schema.sql` para criar o perfil automaticamente ao cadastrar um usuário. Contas de demonstração antigas armazenadas no `localStorage` não são migradas; cada cliente deve criar sua conta Supabase. O acesso administrativo por `ADMIN_EMAIL` e `ADMIN_PASSWORD` permanece separado.

Depois de reiniciar a aplicação e entrar com o e-mail e a senha administrativos na tela de login normal, a aba `Admin` aparece na navegação. O painel permite criar, editar e excluir produtos; as alterações são persistidas no Supabase e aparecem na loja.
