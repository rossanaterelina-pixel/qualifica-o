// Catálogo Terelina — vendido sempre por CAIXA.
// Para trocar a foto de um produto, edite o campo `image` (URL ou arquivo em /public).
export interface Product {
  id: string;
  categoria: string;
  nome: string;
  peso?: string;
  unidadesCaixa: number;
  unidadeLabel: 'un' | 'pct';
  precoCaixa: number; // centavos
  image: string;
}

const IMG = '/produto.svg';

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function linha(
  categoria: string,
  peso: string,
  unidadesCaixa: number,
  precoCaixa: number,
  sabores: string[],
  unidadeLabel: 'un' | 'pct' = 'un',
): Product[] {
  return sabores.map((s) => ({
    id: `${slug(categoria)}-${slug(s)}`,
    categoria,
    nome: s,
    peso,
    unidadesCaixa,
    unidadeLabel,
    precoCaixa,
    image: IMG,
  }));
}

const massa = (id: string, nome: string, peso: string | undefined, un: number, preco: number, label: 'un' | 'pct' = 'un'): Product => ({
  id, categoria: 'Massas', nome, peso, unidadesCaixa: un, unidadeLabel: label, precoCaixa: preco, image: IMG,
});

const PIZZA_SABORES = ['Calabresa', 'Frango', 'Calabresa/Apresuntado', 'Calabresa/Frango', 'Presunto/Frango'];

export const CATEGORIAS = [
  'Todos', 'Massas', 'Pizza Média', 'Pizza Grande', 'Brotinho Isopor', 'Mini Pizza', 'Crostini',
] as const;

export const PRODUCTS: Product[] = [
  massa('massa-brotinho', 'Massa Brotinho 15cm', '70g', 72, 9000),
  massa('massa-p', 'Massa P 25cm', '160g', 30, 9000),
  massa('massa-m', 'Massa M 30cm', '205g', 30, 10800),
  massa('massa-g', 'Massa G 35cm', '265g', 30, 12000),
  massa('massa-gg', 'Massa GG 40cm', undefined, 30, 13800),
  massa('massa-semipronta', 'Massa Semipronta 400g', '400g', 15, 10800, 'pct'),
  ...linha('Pizza Média', '450g', 10, 13500, PIZZA_SABORES),
  ...linha('Pizza Grande', '600g', 10, 18000, PIZZA_SABORES),
  ...linha('Brotinho Isopor', '120g', 20, 9000, ['Frango', 'Presunto', 'Calabresa']),
  ...linha('Mini Pizza', '300g', 12, 13800, ['Calabresa', 'Frango', '3 Sabores', 'Mussarela']),
  ...linha('Crostini', '100g', 12, 11400, ['Lemon Pepper', 'Parmesão', 'Tradicional', 'Alho', 'Ervas Finas']),
];

export const unitPrice = (p: Product) => p.precoCaixa / p.unidadesCaixa; // centavos
export const unitLabel = (p: Product) => (p.unidadeLabel === 'pct' ? 'pacotes' : 'unidades');

// Regras comerciais
export const MIN_CAIXAS = 2;
export const MIN_VALOR = 30000; // centavos
export const WHATSAPP_TIME = '5586994973035';
export const ENDERECO_RETIRADA = 'Av. Dep. Paulo Ferraz, 810 - Tancredo Neves, Teresina - PI, 64076-005';
export const FAIXAS_RETIRADA = [
  '08:30 às 09:30', '09:30 às 10:30', '10:30 às 11:30',
  '14:00 às 15:00', '15:00 às 16:00', '16:00 às 16:30',
];
// fim de cada faixa em minutos desde 00:00 (para esconder faixas que já passaram hoje)
export const FIM_FAIXA: Record<string, number> = {
  '08:30 às 09:30': 570, '09:30 às 10:30': 630, '10:30 às 11:30': 690,
  '14:00 às 15:00': 900, '15:00 às 16:00': 960, '16:00 às 16:30': 990,
};

export interface CartTotals { caixas: number; total: number; faltaValor: number; faltaCaixas: number; ok: boolean }
export function cartTotals(cart: Record<string, number>): CartTotals {
  let caixas = 0, total = 0;
  for (const p of PRODUCTS) {
    const q = cart[p.id] ?? 0;
    caixas += q;
    total += q * p.precoCaixa;
  }
  const faltaValor = Math.max(0, MIN_VALOR - total);
  const faltaCaixas = Math.max(0, MIN_CAIXAS - caixas);
  return { caixas, total, faltaValor, faltaCaixas, ok: faltaValor === 0 && faltaCaixas === 0 };
}
