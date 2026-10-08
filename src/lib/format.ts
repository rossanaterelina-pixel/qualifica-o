export const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const digits = (s: string) => s.replace(/\D/g, '');

/** Aceita DDD + 8/9 dígitos, com ou sem +55. Retorna só dígitos com 55 na frente, ou null. */
export function normalizePhone(s: string): string | null {
  let d = digits(s);
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  if (d.length === 11 && d[2] !== '9') return null;
  return '55' + d;
}

export function maskPhone(s: string): string {
  const d = digits(s).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCep(s: string): string {
  const d = digits(s).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export const fmtDateBR = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
