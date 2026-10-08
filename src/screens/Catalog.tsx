import { useState } from 'react';
import { Header, RulesCard } from '../components';
import { CATEGORIAS, MIN_VALOR, PRODUCTS, cartTotals, unitLabel, unitPrice, type Product } from '../data/products';
import { brl } from '../lib/format';

interface Props {
  cart: Record<string, number>;
  setQty: (id: string, q: number) => void;
  onCheckout: () => void;
  onBack: () => void;
}

export const Stepper = ({ qty, onChange }: { qty: number; onChange: (q: number) => void }) => (
  <div className="stepper">
    <button type="button" aria-label="Diminuir" onClick={() => onChange(qty - 1)}>−</button>
    <span aria-live="polite">{qty}</span>
    <button type="button" aria-label="Aumentar" onClick={() => onChange(qty + 1)}>+</button>
  </div>
);

function Card({ p, qty, setQty }: { p: Product; qty: number; setQty: (q: number) => void }) {
  return (
    <article className="card">
      <img src={p.image} alt={p.nome} loading="lazy" width={200} height={200} />
      <div className="card-body">
        <h3>{p.nome}</h3>
        <p className="muted small">{p.categoria !== 'Massas' ? `${p.categoria} · ` : ''}{p.peso ?? ''}</p>
        <p className="small">Caixa com {p.unidadesCaixa} {unitLabel(p)}</p>
        <p className="price">{brl(p.precoCaixa)}</p>
        <p className="muted small">{brl(unitPrice(p))}/{p.unidadeLabel}</p>
        {qty === 0 ? (
          <button className="btn primary sm" onClick={() => setQty(1)}>Adicionar</button>
        ) : (
          <Stepper qty={qty} onChange={setQty} />
        )}
      </div>
    </article>
  );
}

export default function Catalog({ cart, setQty, onCheckout, onBack }: Props) {
  const [cat, setCat] = useState<(typeof CATEGORIAS)[number]>('Todos');
  const t = cartTotals(cart);
  const list = cat === 'Todos' ? PRODUCTS : PRODUCTS.filter((p) => p.categoria === cat);
  const pctMin = Math.min(100, Math.round((t.total / MIN_VALOR) * 100));

  return (
    <div className="screen has-footer">
      <Header right={<button className="btn link inline" onClick={onBack}>← Voltar</button>} />
      <main className="content wide">
        <h1 className="h1">Catálogo</h1>
        <p className="muted">Vendido sempre por caixa.</p>
        <RulesCard />
        <div className="chips" role="tablist">
          {CATEGORIAS.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid">
          {list.map((p) => (
            <Card key={p.id} p={p} qty={cart[p.id] ?? 0} setQty={(q) => setQty(p.id, q)} />
          ))}
        </div>
      </main>

      <footer className="cartbar">
        {t.caixas > 0 && !t.ok && (
          <div className="minbar">
            <div className="minbar-track"><div style={{ width: `${pctMin}%` }} /></div>
            <span>
              {t.faltaValor > 0 ? `Faltam ${brl(t.faltaValor)} para o pedido mínimo` : `Faltam ${t.faltaCaixas} caixa(s) para o pedido mínimo`}
            </span>
          </div>
        )}
        {t.caixas === 0 && <div className="minbar"><span>Pedido mínimo: 2 caixas e R$ 300,00 · Pix ou Espécie</span></div>}
        <div className="cartrow">
          <div>
            <strong>{brl(t.total)}</strong>
            <span className="muted small"> · {t.caixas} caixa{t.caixas === 1 ? '' : 's'}</span>
          </div>
          <button className="btn primary sm" disabled={!t.ok} onClick={onCheckout}>Finalizar pedido</button>
        </div>
      </footer>
    </div>
  );
}
