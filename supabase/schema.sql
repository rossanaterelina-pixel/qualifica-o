-- Terelina SDR — rode no SQL Editor do Supabase.

create table if not exists public.leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  negocio text not null,
  uf text not null,
  cidade text not null,
  perfil text not null,
  momento text not null,
  volume text not null,
  estrutura text not null,
  inicio text not null,
  decide text not null,
  pessoas_dia text,
  vende_pizza text,
  pontuacao int not null check (pontuacao between 0 and 24),
  classificacao text not null check (classificacao in ('QUENTE','MORNO','FRIO')),
  status_sdr text not null,
  verificar_entrega boolean not null default false,
  proxima_acao text not null
);

create table if not exists public.orders (
  id uuid primary key,
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  nome text not null,
  whatsapp text not null,
  negocio text not null,
  uf text not null,
  cidade text not null,
  tipo text not null check (tipo in ('entrega','retirada')),
  pagamento text not null check (pagamento in ('pix','especie')), -- sem cartão
  endereco jsonb,
  retirada_data date,
  retirada_horario text,
  itens jsonb not null,
  total_centavos int not null check (total_centavos >= 30000), -- pedido mínimo
  status text not null default 'novo'
    check (status in ('novo','aguardando_pagamento','pago','entregue_retirado'))
);

create index if not exists leads_pontuacao_idx on public.leads (pontuacao desc, created_at desc);
create index if not exists orders_lead_idx on public.orders (lead_id);

alter table public.leads enable row level security;
alter table public.orders enable row level security;

-- Visitantes (anon) só podem CRIAR. Não conseguem ler nada.
create policy "anon insere leads" on public.leads for insert to anon with check (true);
create policy "anon insere pedidos" on public.orders for insert to anon with check (status = 'novo');

-- Time (usuário autenticado no Supabase Auth) lê e atualiza.
create policy "time le leads" on public.leads for select to authenticated using (true);
create policy "time le pedidos" on public.orders for select to authenticated using (true);
create policy "time atualiza pedidos" on public.orders for update to authenticated using (true) with check (true);
