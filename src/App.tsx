import { useEffect, useState } from 'react';
import Quiz from './screens/Quiz';
import Result from './screens/Result';
import Catalog from './screens/Catalog';
import Checkout from './screens/Checkout';
import Done from './screens/Done';
import Admin from './screens/Admin';
import type { LeadRow } from './lib/supabase';

type Screen = 'quiz' | 'result' | 'catalog' | 'checkout' | 'done';

const load = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ }
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(location.hash.startsWith('#/admin'));
  const [screen, setScreen] = useState<Screen>(() => (load<LeadRow | null>('t_lead', null) ? 'result' : 'quiz'));
  const [lead, setLead] = useState<LeadRow | null>(() => load('t_lead', null));
  const [cart, setCart] = useState<Record<string, number>>(() => load('t_cart', {}));

  useEffect(() => {
    const onHash = () => setIsAdmin(location.hash.startsWith('#/admin'));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => save('t_cart', cart), [cart]);
  useEffect(() => window.scrollTo(0, 0), [screen]);

  const setQty = (id: string, q: number) =>
    setCart((c) => {
      const n = { ...c };
      if (q <= 0) delete n[id]; else n[id] = Math.min(q, 99);
      return n;
    });

  if (isAdmin) return <Admin />;

  const onLead = (l: LeadRow) => { setLead(l); save('t_lead', l); setScreen('result'); };
  const restart = () => {
    setLead(null); setCart({});
    try { localStorage.removeItem('t_lead'); } catch { /* ok */ }
    setScreen('quiz');
  };

  switch (screen) {
    case 'quiz':
      return <Quiz onDone={onLead} />;
    case 'result':
      return lead ? <Result lead={lead} onCatalog={() => setScreen('catalog')} onRestart={restart} /> : <Quiz onDone={onLead} />;
    case 'catalog':
      return <Catalog cart={cart} setQty={setQty} onCheckout={() => setScreen('checkout')} onBack={() => setScreen('result')} />;
    case 'checkout':
      return (
        <Checkout
          lead={lead}
          cart={cart}
          setQty={setQty}
          onBack={() => setScreen('catalog')}
          onDone={() => { setCart({}); setScreen('done'); }}
        />
      );
    case 'done':
      return <Done onRestart={restart} />;
  }
}
