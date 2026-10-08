import { useMemo, useState } from 'react';
import { Header, Field } from '../components';
import {
  DECIDE, ESTRUTURA, INICIO, MOMENTO, PERFIL, PESSOAS_DIA, UFS, VENDE_PIZZA, VOLUME, label, type Opt,
} from '../data/quiz';
import { isTeresina, score, type Answers } from '../lib/scoring';
import { maskPhone, normalizePhone } from '../lib/format';
import { newId, saveLead, type LeadRow } from '../lib/supabase';

type Key = keyof Answers;
interface Step { key: Key | 'final'; title: string; options?: Opt[] }

const STEPS: Record<string, Step> = {
  loc: { key: 'uf', title: 'Onde fica o seu negócio?' },
  perfil: { key: 'perfil', title: 'Qual é o seu perfil?', options: PERFIL },
  momento: { key: 'momento', title: 'Em que momento você está?', options: MOMENTO },
  volume: { key: 'volume', title: 'Quantas pizzas você pretende vender por semana?', options: VOLUME },
  estrutura: { key: 'estrutura', title: 'Como está sua estrutura (forno, balcão e freezer)?', options: ESTRUTURA },
  inicio: { key: 'inicio', title: 'Quando você quer começar?', options: INICIO },
  decide: { key: 'decide', title: 'Você decide sozinho(a)?', options: DECIDE },
  pessoas: { key: 'pessoasDia', title: 'Quantas pessoas passam pela sua padaria por dia?', options: PESSOAS_DIA },
  vende: { key: 'vendePizza', title: 'Você já vende pizza hoje?', options: VENDE_PIZZA },
  final: { key: 'final', title: 'Quase lá! Como podemos te chamar?' },
};

const empty: Answers = {
  uf: '', cidade: '', perfil: '', momento: '', volume: '', estrutura: '', inicio: '', decide: '',
  nome: '', whatsapp: '', negocio: '',
};

export default function Quiz({ onDone }: { onDone: (l: LeadRow) => void }) {
  const [a, setA] = useState<Answers>(empty);
  const [i, setI] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const order = useMemo(() => {
    const base = ['loc', 'perfil', 'momento', 'volume', 'estrutura', 'inicio', 'decide'];
    if (a.perfil === 'supermercado') base.push('pessoas', 'vende');
    base.push('final');
    return base;
  }, [a.perfil]);

  const step = STEPS[order[i]];
  const pct = Math.round((i / order.length) * 100);
  const set = (k: Key, v: string) => setA((p) => ({ ...p, [k]: v }));
  const next = () => { setErrors({}); setI((n) => n + 1); };

  const pick = (o: Opt) => {
    set(step.key as Key, o.id);
    // pequena pausa para o cliente ver a seleção
    setTimeout(next, 180);
  };

  const nextLoc = () => {
    const e: Record<string, string> = {};
    if (!a.uf) e.uf = 'Selecione o estado.';
    if (a.cidade.trim().length < 2) e.cidade = 'Informe a cidade.';
    setErrors(e);
    if (!Object.keys(e).length) next();
  };

  const finish = async () => {
    const e: Record<string, string> = {};
    if (a.nome.trim().length < 2) e.nome = 'Informe seu nome.';
    const phone = normalizePhone(a.whatsapp);
    if (!phone) e.whatsapp = 'Informe um WhatsApp válido com DDD.';
    if (a.negocio.trim().length < 2) e.negocio = 'Informe o nome do negócio.';
    setErrors(e);
    if (Object.keys(e).length || !phone) return;

    setSaving(true);
    const s = score(a);
    const row: LeadRow = {
      id: newId(),
      nome: a.nome.trim(),
      whatsapp: phone,
      negocio: a.negocio.trim(),
      uf: a.uf,
      cidade: a.cidade.trim(),
      perfil: label(PERFIL, a.perfil),
      momento: label(MOMENTO, a.momento),
      volume: label(VOLUME, a.volume),
      estrutura: label(ESTRUTURA, a.estrutura),
      inicio: label(INICIO, a.inicio),
      decide: label(DECIDE, a.decide),
      pessoas_dia: a.pessoasDia ? label(PESSOAS_DIA, a.pessoasDia) : null,
      vende_pizza: a.vendePizza ? label(VENDE_PIZZA, a.vendePizza) : null,
      pontuacao: s.score,
      classificacao: s.classe,
      status_sdr: s.statusSdr,
      verificar_entrega: s.verificarEntrega,
      proxima_acao: s.proximaAcao,
    };
    await saveLead(row); // falha de rede não trava o cliente
    onDone(row);
  };

  const foraTeresina = a.uf !== '' && (a.uf !== 'PI' || (a.cidade.trim().length > 1 && !isTeresina(a.uf, a.cidade)));

  return (
    <div className="screen">
      <Header />
      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <main className="content">
        <p className="muted small">Pergunta {i + 1} de {order.length}</p>
        <h1 className="h1">{step.title}</h1>

        {step.options && (
          <div className="options">
            {step.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`option ${a[step.key as Key] === o.id ? 'selected' : ''}`}
                onClick={() => pick(o)}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {step.key === 'uf' && (
          <>
            <Field label="Estado (UF)" error={errors.uf}>
              <select value={a.uf} onChange={(e) => set('uf', e.target.value)}>
                <option value="">Selecione…</option>
                {UFS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Cidade" error={errors.cidade}>
              <input value={a.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="Ex.: Teresina" autoComplete="address-level2" />
            </Field>
            {foraTeresina && (
              <p className="notice">Vamos confirmar com nosso time se conseguimos entregar na sua região.</p>
            )}
            <button className="btn primary" onClick={nextLoc}>Continuar</button>
          </>
        )}

        {step.key === 'final' && (
          <>
            <Field label="Seu nome" error={errors.nome}>
              <input value={a.nome} onChange={(e) => set('nome', e.target.value)} autoComplete="name" />
            </Field>
            <Field label="WhatsApp (com DDD)" error={errors.whatsapp}>
              <input
                value={a.whatsapp}
                onChange={(e) => set('whatsapp', maskPhone(e.target.value))}
                inputMode="tel" autoComplete="tel" placeholder="(86) 99999-9999"
              />
            </Field>
            <Field label="Nome do negócio" error={errors.negocio}>
              <input value={a.negocio} onChange={(e) => set('negocio', e.target.value)} autoComplete="organization" />
            </Field>
            <button className="btn primary" onClick={finish} disabled={saving}>
              {saving ? 'Enviando…' : 'Ver meu resultado'}
            </button>
          </>
        )}

        {i > 0 && (
          <button className="btn link" onClick={() => { setErrors({}); setI(i - 1); }}>← Voltar</button>
        )}
      </main>
    </div>
  );
}
