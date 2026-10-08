import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;

export interface LeadRow {
  id: string;
  created_at?: string;
  nome: string;
  whatsapp: string;
  negocio: string;
  uf: string;
  cidade: string;
  perfil: string;
  momento: string;
  volume: string;
  estrutura: string;
  inicio: string;
  decide: string;
  pessoas_dia: string | null;
  vende_pizza: string | null;
  pontuacao: number;
  classificacao: 'QUENTE' | 'MORNO' | 'FRIO';
  status_sdr: string;
  verificar_entrega: boolean;
  proxima_acao: string;
}

export interface OrderItem { id: string; nome: string; categoria: string; caixas: number; unidades: number; preco_caixa: number }

export interface OrderRow {
  id: string;
  created_at?: string;
  lead_id: string | null;
  nome: string;
  whatsapp: string;
  negocio: string;
  uf: string;
  cidade: string;
  tipo: 'entrega' | 'retirada';
  pagamento: 'pix' | 'especie';
  endereco: Record<string, string> | null;
  retirada_data: string | null;
  retirada_horario: string | null;
  itens: OrderItem[];
  total_centavos: number;
  status: 'novo' | 'aguardando_pagamento' | 'pago' | 'entregue_retirado';
}

export async function saveLead(row: LeadRow): Promise<boolean> {
  if (!supabase) { console.warn('Supabase não configurado: lead não salvo.'); return false; }
  const { error } = await supabase.from('leads').insert(row);
  if (error) console.warn('Erro ao salvar lead', error.message);
  return !error;
}

export async function saveOrder(row: OrderRow): Promise<boolean> {
  if (!supabase) { console.warn('Supabase não configurado: pedido não salvo.'); return false; }
  const { error } = await supabase.from('orders').insert(row);
  if (error) console.warn('Erro ao salvar pedido', error.message);
  return !error;
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
