import type { ReactNode } from 'react';

export const Header = ({ right }: { right?: ReactNode }) => (
  <header className="topbar">
    <img src="/logo.png" alt="Terelina" className="logo" width={48} height={48} />
    <span className="brand">Terelina</span>
    {right && <div className="topbar-right">{right}</div>}
  </header>
);

export const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {error && <span className="field-error" role="alert">{error}</span>}
  </label>
);

export const RulesCard = ({ compact = false }: { compact?: boolean }) => (
  <aside className="rules" aria-label="Condições comerciais">
    <strong>Condições comerciais</strong>
    <ul>
      <li>Pedido mínimo: <b>2 caixas</b> e <b>R$ 300,00</b>.</li>
      <li>Pagamento <b>somente Pix ou Espécie</b> (dinheiro). Não aceitamos cartão. Sempre à vista.</li>
      {!compact && (
        <>
          <li>Primeira compra: pagamento à vista no ato. Depois da primeira compra: entrega em D+2, sempre à vista.</li>
          <li>Funcionamento e retirada: seg. a sex., 8:30 às 11:30 e 14:00 às 16:30. Não funcionamos sábado e domingo.</li>
        </>
      )}
    </ul>
  </aside>
);
