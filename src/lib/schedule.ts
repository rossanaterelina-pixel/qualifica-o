import { FAIXAS_RETIRADA, FIM_FAIXA } from '../data/products';

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const WEEK = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export const isBusinessDay = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return w >= 1 && w <= 5;
};

export const dayLabel = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WEEK[dt.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
};

/** Próximos dias úteis (hoje só se ainda houver faixa disponível). */
export function pickupDays(now = new Date(), count = 8): string[] {
  const out: string[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (out.length < count) {
    const key = iso(d);
    if (isBusinessDay(key) && (key !== iso(now) || pickupSlots(key, now).length > 0)) out.push(key);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function pickupSlots(isoDate: string, now = new Date()): string[] {
  if (!isBusinessDay(isoDate)) return [];
  if (isoDate !== iso(now)) return FAIXAS_RETIRADA;
  const mins = now.getHours() * 60 + now.getMinutes();
  return FAIXAS_RETIRADA.filter((f) => FIM_FAIXA[f] > mins);
}
