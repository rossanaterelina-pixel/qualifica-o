import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, Header } from '../components';
import { UFS } from '../data/quiz';
import { brl, fmtDateBR } from '../lib/format';
import { supabase, type LeadRow, type OrderRow } from '../lib/supabase';
import { waLink } from '../lib/whatsapp';

const STATUS: Record<OrderRow['status'], string> = {
  novo: 'Novo',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  entregue_retirado: 'Entregue/Retirado',
};
const CLASSE_LABEL = { QUENTE: 'Quente', MORNO: 'Morno', FRIO: 'Frio' } as const;

function Login({ onOk }: { onOk: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  if (!supabase) {
    return <p className="notice">Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>;
  }
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErro('');
    const { error } = await supabase!.auth.signInWithPassword({ email, password: senha });
    setBusy(false);
    if (error) setErro('E-mail ou senha incorretos.'); else onOk();
  };
  return (
    <form className="panel" onSubmit={entrar}>
      <h1 className="h1">Área do time</h1>
      <Field label="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></Field>
      <Field label="Senha" error={erro}><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required /></Field>
      <button className="btn primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}

export default function Admin() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tab, setTab] = useState<'leads' | 'pedidos'>('leads');
  const [fClasse, setFClasse] = useState('');
  const [fUf, setFUf] = useState('');
  const [fPerfil, setFPerfil] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!supabase) { setLogged(false); return; }
    supabase.auth.getSession().then(({ data }) => setLogged(!!data.session));
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [l, o] = await Promise.all([
      supabase.from('leads').select('*').order('pontuacao', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);
    if (l.error || o.error) setMsg('Erro ao carregar dados: ' + (l.error?.message ?? o.error?.message));
    else setMsg('');
    setLeads((l.data ?? []) as LeadRow[]);
    setOrders((o.data ?? []) as OrderRow[]);
  }, []);
  useEffect(() => { if (logged) void load(); }, [logged, load]);

  const comprou = useMemo(() => new Set(orders.map((o) => o.lead_id).filter(Boolean)), [orders]);
  const perfis = useMemo(() => [...new Set(leads.map((l) => l.perfil))], [leads]);
  const shown = leads.filter((l) =>
    (!fClasse || l.classificacao === fClasse) && (!fUf || l.uf === fUf) && (!fPerfil || l.perfil === fPerfil));

  const setStatus = async (id: string, status: OrderRow['status']) => {
    const { error } = await supabase!.from('orders').update({ status }).eq('id', id);
    if (error) setMsg('Erro ao atualizar: ' + error.message);
    else setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="screen">
      <Header right={logged ? <button className="btn link inline" onClick={async () => { await supabase!.auth.signOut(); setLogged(false); }}>Sair</button> : undefined} />
      <main className="content admin">
        {logged === null ? <p>Carregando…</p> : !logged ? <Login onOk={() => setLogged(true)} /> : (
          <>
            <div className="seg">
              <button className={tab === 'leads' ? 'on' : ''} onClick={() => setTab('leads')}>Leads ({leads.length})</button>
              <button className={tab === 'pedidos' ? 'on' : ''} onClick={() => setTab('pedidos')}>Pedidos ({orders.length})</button>
            </div>
            {msg && <p className="field-error">{msg}</p>}
            <button className="btn link inline" onClick={load}>↻ Atualizar</button>

            {tab === 'leads' ? (
              <>
                <div className="filters">
                  <select value={fClasse} onChange={(e) => setFClasse(e.target.value)} aria-label="Classificação">
                    <option value="">Todas as classificações</option>
                    <option value="QUENTE">Quente</option><option value="MORNO">Morno</option><option value="FRIO">Frio</option>
                  </select>
                  <select value={fUf} onChange={(e) => setFUf(e.target.value)} aria-label="Estado">
                    <option value="">Todos os estados</option>
                    {UFS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                  <select value={fPerfil} onChange={(e) => setFPerfil(e.target.value)} aria-label="Perfil">
                    <option value="">Todos os perfis</option>
                    {perfis.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                {shown.length === 0 && <p className="muted">Nenhum lead encontrado.</p>}
                {shown.map((l) => (
                  <article className={`lead ${l.classificacao.toLowerCase()}`} key={l.id}>
                    <div className="lead-head">
                      <div>
                        <b>{l.nome}</b> <span className="muted">· {l.negocio}</span>
                        <div className="small muted">{l.cidade}/{l.uf} · {l.created_at ? new Date(l.created_at).toLocaleDateString('pt-BR') : ''}</div>
                      </div>
                      <div className="score"><b>{l.pontuacao}</b>/24<span>{CLASSE_LABEL[l.classificacao]}</span></div>
                    </div>
                    <p className="small"><b>Perfil:</b> {l.perfil}<br /><b>Momento:</b> {l.momento}<br />
                      <b>Volume:</b> {l.volume} · <b>Estrutura:</b> {l.estrutura}<br />
                      <b>Início:</b> {l.inicio} · <b>Decide:</b> {l.decide}
                      {l.pessoas_dia && <><br /><b>Padaria:</b> {l.pessoas_dia} · já vende pizza: {l.vende_pizza}</>}
                    </p>
                    <div className="tags">
                      <span className="tag">{l.status_sdr}</span>
                      {l.verificar_entrega && <span className="tag warn">Verificar entrega</span>}
                      <span className={`tag ${comprou.has(l.id) ? 'ok' : ''}`}>{comprou.has(l.id) ? 'Já virou pedido' : 'Sem pedido'}</span>
                    </div>
                    <p className="action"><b>Próxima ação:</b> {l.proxima_acao}</p>
                    <a className="btn whats sm" href={waLink(l.whatsapp, `Olá, ${l.nome.split(' ')[0]}! Aqui é da Terelina 🍕`)} target="_blank" rel="noopener noreferrer">
                      WhatsApp {l.whatsapp.replace(/^55/, '')}
                    </a>
                  </article>
                ))}
              </>
            ) : (
              <>
                {orders.length === 0 && <p className="muted">Nenhum pedido ainda.</p>}
                {orders.map((o) => (
                  <article className="lead" key={o.id}>
                    <div className="lead-head">
                      <div>
                        <b>{o.nome}</b> <span className="muted">· {o.negocio}</span>
                        <div className="small muted">{o.cidade}/{o.uf} · {o.created_at ? new Date(o.created_at).toLocaleString('pt-BR') : ''}</div>
                      </div>
                      <b className="price">{brl(o.total_centavos)}</b>
                    </div>
                    <ul className="small items">
                      {o.itens.map((i) => <li key={i.id}>{i.caixas}x {i.nome} <span className="muted">({i.categoria})</span></li>)}
                    </ul>
                    <p className="small">
                      {o.tipo === 'retirada'
                        ? <>Retirada {o.retirada_data && fmtDateBR(o.retirada_data)} · {o.retirada_horario}</>
                        : <>Entrega: {o.endereco?.rua}, {o.endereco?.numero} - {o.endereco?.bairro}, {o.endereco?.cidade} ({o.endereco?.referencia})</>}
                      <br />Pagamento: {o.pagamento === 'pix' ? 'Pix' : 'Espécie'}
                    </p>
                    <Field label="Status">
                      <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderRow['status'])}>
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </Field>
                    <a className="btn whats sm" href={waLink(o.whatsapp, `Olá, ${o.nome.split(' ')[0]}! Sobre seu pedido Terelina 🍕`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  </article>
                ))}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
