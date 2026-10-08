import { Header } from '../components';

export default function Done({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="screen">
      <Header />
      <main className="content center">
        <div className="big-emoji" aria-hidden>🍕</div>
        <h1 className="h1">Pedido recebido!</h1>
        <p>Recebemos seu pedido! Nosso time vai te chamar no WhatsApp para confirmar e finalizar o pagamento.</p>
        <button className="btn link" onClick={onRestart}>Voltar ao início</button>
      </main>
    </div>
  );
}
