import { DECIDE, ESTRUTURA, INICIO, MOMENTO, PERFIL, VOLUME, type Opt } from '../data/quiz';

export type Classe = 'QUENTE' | 'MORNO' | 'FRIO';

export interface Answers {
  uf: string;
  cidade: string;
  perfil: string;
  momento: string;
  volume: string;
  estrutura: string;
  inicio: string;
  decide: string;
  pessoasDia?: string;
  vendePizza?: string;
  nome: string;
  whatsapp: string;
  negocio: string;
}

export interface Scored {
  score: number;
  classe: Classe;
  statusSdr: string;
  verificarEntrega: boolean;
  proximaAcao: string;
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

export const isTeresina = (uf: string, cidade: string) =>
  uf === 'PI' && norm(cidade) === 'teresina';

const pts = (opts: Opt[], id: string) => opts.find((o) => o.id === id)?.pts ?? 0;

export function classify(score: number): Classe {
  if (score >= 17) return 'QUENTE';
  if (score >= 10) return 'MORNO';
  return 'FRIO';
}

export const STATUS_SDR: Record<Classe, string> = {
  QUENTE: 'Cliente ideal',
  MORNO: 'Cliente em potencial, nutrir',
  FRIO: 'Ainda não é cliente',
};

export const PROXIMA_ACAO: Record<Classe, string> = {
  QUENTE: 'Chamar agora no WhatsApp e fechar o primeiro pedido.',
  MORNO: 'Enviar catálogo e tabela, e retornar em 3 dias.',
  FRIO: 'Colocar na lista de transmissão e nutrir com novidades.',
};

export const ACAO_SUPERMERCADO =
  'Apresentar a mentoria Aumente o fluxo da sua padaria com pizza.';

export function score(a: Answers): Scored {
  const total =
    pts(PERFIL, a.perfil) +
    pts(MOMENTO, a.momento) +
    pts(VOLUME, a.volume) +
    pts(ESTRUTURA, a.estrutura) +
    pts(INICIO, a.inicio) +
    pts(DECIDE, a.decide) +
    (isTeresina(a.uf, a.cidade) ? 2 : 0);
  const classe = classify(total);
  const proximaAcao = a.perfil === 'supermercado' ? ACAO_SUPERMERCADO : PROXIMA_ACAO[classe];
  return {
    score: total,
    classe,
    statusSdr: STATUS_SDR[classe],
    verificarEntrega: !isTeresina(a.uf, a.cidade),
    proximaAcao,
  };
}
