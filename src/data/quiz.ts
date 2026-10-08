export interface Opt {
  id: string;
  label: string;
  pts: number;
}

export const PERFIL: Opt[] = [
  { id: 'comecar', label: 'Quero começar um negócio', pts: 2 },
  { id: 'incrementar', label: 'Já tenho e quero incrementar', pts: 3 },
  { id: 'lanchonete', label: 'Tenho lanchonete e quero incluir pizza', pts: 4 },
  { id: 'casa', label: 'Quero produzir e vender em casa', pts: 3 },
  { id: 'supermercado', label: 'Sou supermercado e quero aumentar o fluxo da padaria', pts: 4 },
];

export const MOMENTO: Opt[] = [
  { id: 'pesquisando', label: 'Só pesquisando, sem pressa', pts: 0 },
  { id: 'organizando', label: 'Já decidi e estou me organizando', pts: 2 },
  { id: 'comprar', label: 'Já tenho o ponto e quero comprar agora', pts: 4 },
  { id: 'trocar', label: 'Já vendo pizza e quero trocar de fornecedor', pts: 4 },
];

export const VOLUME: Opt[] = [
  { id: 'v20', label: 'Até 20 pizzas por semana', pts: 1 },
  { id: 'v50', label: '21 a 50 pizzas por semana', pts: 2 },
  { id: 'v100', label: '51 a 100 pizzas por semana', pts: 3 },
  { id: 'v100p', label: 'Mais de 100 pizzas por semana', pts: 4 },
];

export const ESTRUTURA: Opt[] = [
  { id: 'tudo', label: 'Tenho tudo (forno, balcão e freezer)', pts: 3 },
  { id: 'parte', label: 'Tenho parte da estrutura', pts: 2 },
  { id: 'orientacao', label: 'Preciso de orientação', pts: 1 },
];

export const INICIO: Opt[] = [
  { id: 'semana', label: 'Essa semana', pts: 4 },
  { id: '15dias', label: 'Em 15 dias', pts: 2 },
  { id: 'depois', label: 'Mais pra frente', pts: 0 },
];

export const DECIDE: Opt[] = [
  { id: 'sim', label: 'Sim, decido sozinho(a)', pts: 3 },
  { id: 'socio', label: 'Preciso falar com sócio', pts: 1 },
];

// Perguntas extras (apenas supermercado) — não pontuam
export const PESSOAS_DIA: Opt[] = [
  { id: 'p300', label: 'Até 300 pessoas por dia', pts: 0 },
  { id: 'p800', label: '300 a 800 pessoas por dia', pts: 0 },
  { id: 'p1500', label: '800 a 1.500 pessoas por dia', pts: 0 },
  { id: 'p1500p', label: 'Mais de 1.500 pessoas por dia', pts: 0 },
];

export const VENDE_PIZZA: Opt[] = [
  { id: 'sim', label: 'Sim, já vendo pizza', pts: 0 },
  { id: 'nao', label: 'Não, ainda não vendo', pts: 0 },
];

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const label = (opts: Opt[], id: string) => opts.find((o) => o.id === id)?.label ?? id;
