
import { brl, fmtDateBR } from './format';
import type { LeadRow, OrderRow } from './supabase';

const CLASSE_TXT = { QUENTE: 'Quente', MORNO: 'Morno', FRIO: 'Frio' } as const;

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export const openWhatsApp = (phone: string, text: string) => {
  window.open(waLink(phone, text), '_blank', 'noopener');
};

export function leadMessage(l: LeadRow): string {
  return [
    'Olá, time Terelina! 🍕',
    `Nome: ${l.nome}`,
    `Negócio: ${l.negocio}`,
    `Cidade/UF: ${l.cidade}/${l.uf}`,
    `Momento: ${l.momento}`,
    `Próxima ação recomendada: ${l.proxima_acao}`,
  ].join('\n');
}

export function mentoriaMessage(l: LeadRow): string {
  return [
    'Olá! Quero saber mais sobre a mentoria "Aumente o fluxo da sua padaria com pizza". 🍕',
    `Nome: ${l.nome}`,
    `Negócio: ${l.negocio}`,
    `Cidade/UF: ${l.cidade}/${l.uf}`,
  ].join('\n');
}

export function orderMessage(o: OrderRow, lead: LeadRow | null): string {
  const itens = o.itens.map((i) => `• ${i.caixas}x ${i.nome}${i.categoria !== 'Massas' ? ` (${i.categoria})` : ''} — ${brl(i.caixas * i.preco_caixa)}`);
  const e = o.endereco;
  const destino =
    o.tipo === 'retirada'
      ? `Retirada: ${e?.endereco ?? ''}\nDia: ${fmtDateBR(o.retirada_data ?? '')} — ${o.retirada_horario}`
      : `Entrega: ${e?.rua}, ${e?.numero} - ${e?.bairro}, ${e?.cidade}${e?.cep ? ` - CEP ${e.cep}` : ''}\nReferência: ${e?.referencia}`;
  return [
    'Novo pedido Terelina! 🍕',
    `Nome: ${o.nome}`,
    `Negócio: ${o.negocio}`,
    `Cidade/UF: ${o.cidade}/${o.uf}`,
    lead ? `Momento: ${lead.momento}` : null,
    lead ? `Classificação do lead: ${CLASSE_TXT[lead.classificacao]}` : null,
    '',
    'Itens:',
    ...itens,
    '',
    `Total: ${brl(o.total_centavos)}`,
    destino,
    '',
    `Pagamento: ${o.pagamento === 'pix' ? 'Pix' : 'Espécie'} - aguardando finalização com o time.`,
  ]
    .filter((x) => x !== null)
    .join('\n');
}
