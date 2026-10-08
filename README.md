# Terelina — SDR digital

Web app mobile-first (React + Vite + Supabase) que qualifica o lead, calcula a pontuação, mostra o catálogo por caixa, fecha o pedido via WhatsApp e entrega tudo para o time no admin.

Fluxo: Quiz SDR → Resultado → Catálogo → Checkout → Pedido recebido.

## Como rodar

1. `npm install`
2. Crie um projeto no [Supabase](https://supabase.com) e rode `supabase/schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. `npm run dev` (desenvolvimento) ou `npm run build` (produção, pasta `dist/`).
5. `npm test` valida a pontuação (máx. 24) e a classificação.

## Admin (`/#/admin`)

O login usa o **Supabase Auth** (e-mail + senha). Crie o usuário do time em *Authentication → Users → Add user* (marque "Auto Confirm"). As regras RLS do `schema.sql` deixam o público apenas **criar** leads/pedidos; só usuários logados leem e atualizam. Assim não há senha embutida no código.

## Onde editar

- Produtos, preços, fotos (`image`) e regras comerciais: `src/data/products.ts`
- Perguntas e pontos do quiz: `src/data/quiz.ts`
- Pontuação, status SDR e próxima ação: `src/lib/scoring.ts`
- Mensagens de WhatsApp: `src/lib/whatsapp.ts`
