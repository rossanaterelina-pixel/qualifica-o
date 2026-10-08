import { useMemo, useState } from 'react';
import { Field, Header, RulesCard } from '../components';
import { ENDERECO_RETIRADA, PRODUCTS, WHATSAPP_TIME, cartTotals, unitLabel } from '../data/products';
import { brl, maskCep, maskPhone, normalizePhone, digits } from '../lib/format';
import { dayLabel, pickupDays, pickupSlots } from '../lib/schedule';
import { newId, saveOrder, type LeadRow, type OrderRow } from '../lib/supabase';
import { openWhatsApp, orderMessage } from '../lib/whatsapp';
import { Stepper } from './Catalog';

interface Props {
  lead: LeadRow | null;
  cart: Record<string, number>;
  setQty: (id: string, q: number) => void;
  onBack: () => void;
  onDone: () => void;
}

export default function Checkout({ lead, cart, setQty, onBack, onDone }: Props) {
  const [f, setF] = useState({
    nome: lead?.nome ?? '',
    whatsapp: lead ? maskPhone(lead.whatsapp.replace(/^55/, '')) : '',
    negocio: lead?.negocio ?? '',
    tipo: 'entrega' as 'entrega' | 'retirada',
    pagamento: '' as '' | 'pix' | 'especie',
    rua: '', numero: '', bairro: '', cidade: lead?.cidade ?? '', referencia: '', cep: '',
    dia: '', faixa: '',
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const t = cartTotals(cart);
  const dias = useMemo(() => pickupDays(), []);
  const faixas = f.dia ? pickupSlots(f.dia) : [];
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const items = PRODUCTS.filter((p) => cart[p.id]);

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!t.ok) e.cart = 'Pedido abaixo do mínimo (2 caixas e R$ 300,00).';
    if (f.nome.trim().length < 2) e.nome = 'Informe seu nome.';
    const phone = normalizePhone(f.whatsapp);
    if (!phone) e.whatsapp = 'Informe um WhatsApp válido com DDD.';
    if (f.negocio.trim().length < 2) e.negocio = 'Informe o nome do negócio.';
    if (!f.pagamento) e.pagamento = 'Escolha Pix ou Espécie.';
    if (f.tipo === 'entrega') {
      if (!f.rua.trim()) e.rua = 'Informe a rua.';
      if (!f.numero.trim()) e.numero = 'Informe o número.';
      if (!f.bairro.trim()) e.bairro = 'Informe o bairro.';
      if (!f.cidade.trim()) e.cidade = 'Informe a cidade.';
      if (!f.referencia.trim()) e.referencia = 'Informe um ponto de referência.';
      if (f.cep && digits(f.cep).length !== 8) e.cep = 'CEP deve ter 8 dígitos.';
    } else {
      if (!f.dia) e.dia = 'Escolha o dia da retirada.';
      else if (!f.faixa || !faixas.includes(f.faixa)) e.faixa = 'Escolha um horário.';
    }
    setErr(e);
    if (Object.keys(e).length || !phone || !f.pagamento) return;

    const order: OrderRow = {
      id: newId(),
      lead_id: lead?.id ?? null,
      nome: f.nome.trim(),
      whatsapp: phone,
      negocio: f.negocio.trim(),
      uf: lead?.uf ?? 'PI',
      cidade: lead?.cidade ?? f.cidade.trim(),
      tipo: f.tipo,
      pagamento: f.pagamento,
      endereco:
        f.tipo === 'entrega'
          ? { rua: f.rua.trim(), numero: f.numero.trim(), bairro: f.bairro.trim(), cidade: f.cidade.trim(), referencia: f.referencia.trim(), cep: f.cep }
          : { endereco: ENDERECO_RETIRADA },
      retirada_data: f.tipo === 'retirada' ? f.dia : null,
      retirada_horario: f.tipo === 'retirada' ? f.faixa : null,
      itens: items.map((p) => ({
        id: p.id, nome: p.nome, categoria: p.categoria, caixas: cart[p.id],
        unidades: cart[p.id] * p.unidadesCaixa, preco_caixa: p.precoCaixa,
      })),
      total_centavos: t.total,
      status: 'novo',
    };
    // abre o WhatsApp no mesmo clique (evita bloqueio de pop-up) e salva em paralelo
    openWhatsApp(WHATSAPP_TIME, orderMessage(order, lead));
    setBusy(true);
    await saveOrder(order);
    onDone();
  };

  return (
    <div className="screen">
      <Header right={<button className="btn link inline" onClick={onBack}>← Catálogo</button>} />
      <main className="content">
        <h1 className="h1">Finalizar pedido</h1>
        <RulesCard />

        <section className="panel">
          <h2 className="h2">Seu carrinho</h2>
          {items.map((p) => (
            <div className="line" key={p.id}>
              <div>
                <b>{p.nome}</b>
                <div className="muted small">{p.categoria} · cx {p.unidadesCaixa} {unitLabel(p)} · {brl(p.precoCaixa)}</div>
              </div>
              <Stepper qty={cart[p.id]} onChange={(q) => setQty(p.id, q)} />
            </div>
          ))}
          <div className="line total"><span>Total ({t.caixas} caixas)</span><strong className="price">{brl(t.total)}</strong></div>
          {!t.ok && (
            <p className="notice">
              {t.faltaValor > 0 ? `Faltam ${brl(t.faltaValor)} para o pedido mínimo.` : `Faltam ${t.faltaCaixas} caixa(s) para o pedido mínimo.`}{' '}
              <button className="btn link inline" onClick={onBack}>Voltar ao catálogo</button>
            </p>
          )}
        </section>

        <section className="panel">
          <h2 className="h2">Seus dados</h2>
          <Field label="Nome" error={err.nome}><input value={f.nome} onChange={(e) => set('nome', e.target.value)} autoComplete="name" /></Field>
          <Field label="WhatsApp" error={err.whatsapp}>
            <input value={f.whatsapp} onChange={(e) => set('whatsapp', maskPhone(e.target.value))} inputMode="tel" autoComplete="tel" />
          </Field>
          <Field label="Nome do negócio" error={err.negocio}><input value={f.negocio} onChange={(e) => set('negocio', e.target.value)} /></Field>
        </section>

        <section className="panel">
          <h2 className="h2">Entrega ou retirada</h2>
          <div className="seg">
            {(['entrega', 'retirada'] as const).map((tp) => (
              <button key={tp} type="button" className={f.tipo === tp ? 'on' : ''} onClick={() => set('tipo', tp)}>
                {tp === 'entrega' ? 'Entrega' : 'Retirada'}
              </button>
            ))}
          </div>

          {f.tipo === 'retirada' ? (
            <>
              <p className="notice"><b>Retirada em:</b> {ENDERECO_RETIRADA}<br />Segunda a sexta, das 8:30 às 11:30 e das 14:00 às 16:30.</p>
              <Field label="Dia da retirada" error={err.dia}>
                <select value={f.dia} onChange={(e) => setF((p) => ({ ...p, dia: e.target.value, faixa: '' }))}>
                  <option value="">Selecione…</option>
                  {dias.map((d) => <option key={d} value={d}>{dayLabel(d)}</option>)}
                </select>
              </Field>
              <Field label="Horário" error={err.faixa}>
                <select value={f.faixa} onChange={(e) => set('faixa', e.target.value)} disabled={!f.dia}>
                  <option value="">Selecione…</option>
                  {faixas.map((h) => <option key={h}>{h}</option>)}
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Rua" error={err.rua}><input value={f.rua} onChange={(e) => set('rua', e.target.value)} autoComplete="address-line1" /></Field>
              <div className="row2">
                <Field label="Número" error={err.numero}><input value={f.numero} onChange={(e) => set('numero', e.target.value)} /></Field>
                <Field label="Bairro" error={err.bairro}><input value={f.bairro} onChange={(e) => set('bairro', e.target.value)} /></Field>
              </div>
              <Field label="Cidade" error={err.cidade}><input value={f.cidade} onChange={(e) => set('cidade', e.target.value)} /></Field>
              <Field label="Ponto de referência" error={err.referencia}><input value={f.referencia} onChange={(e) => set('referencia', e.target.value)} /></Field>
              <Field label="CEP (opcional)" error={err.cep}>
                <input value={f.cep} onChange={(e) => set('cep', maskCep(e.target.value))} inputMode="numeric" autoComplete="postal-code" />
              </Field>
              {lead?.verificar_entrega && (
                <p className="notice">Vamos confirmar com nosso time se conseguimos entregar na sua região.</p>
              )}
              <p className="muted small">Primeira compra: pagamento à vista no ato. Depois da primeira compra: entrega em D+2, sempre à vista.</p>
            </>
          )}
        </section>

        <section className="panel">
          <h2 className="h2">Pagamento</h2>
          <div className="seg">
            {(['pix', 'especie'] as const).map((p) => (
              <button key={p} type="button" className={f.pagamento === p ? 'on' : ''} onClick={() => set('pagamento', p)}>
                {p === 'pix' ? 'Pix' : 'Espécie'}
              </button>
            ))}
          </div>
          {err.pagamento && <span className="field-error" role="alert">{err.pagamento}</span>}
          {f.pagamento === 'pix' && <p className="notice">Seu pagamento via Pix será finalizado com nosso time pelo WhatsApp após a confirmação do pedido.</p>}
          {f.pagamento === 'especie' && <p className="notice">Pagamento em dinheiro na entrega ou retirada.</p>}
          <p className="muted small">Não aceitamos cartão. Pagamento sempre à vista.</p>
        </section>

        {err.cart && <p className="field-error">{err.cart}</p>}
        <button className="btn primary" disabled={!t.ok || busy} onClick={submit}>
          {busy ? 'Enviando…' : 'Finalizar pedido'}
        </button>
      </main>
    </div>
  );
}
