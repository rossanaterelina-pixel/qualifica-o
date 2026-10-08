import { Header } from '../components';
import type { LeadRow } from '../lib/supabase';
import { WHATSAPP_TIME } from '../data/products';
import { leadMessage, mentoriaMessage, openWhatsApp } from '../lib/whatsapp';

interface Props { lead: LeadRow; onCatalog: () => void; onRestart: () => void }

export default function Result({ lead, onCatalog, onRestart }: Props) {
  const primeiro = lead.nome.split(' ')[0];
  const frio = lead.classificacao === 'FRIO';
  const supermercado = lead.perfil.startsWith('Sou supermercado');
  const falar = () => openWhatsApp(WHATSAPP_TIME, leadMessage(lead));

  return (
    <div className="screen">
      <Header />
      <main className="content">
        <div className="hero-card">
          <h1 className="h1">
            {frio ? `Obrigado, ${primeiro}! 🍕` : `Que ótimo, ${primeiro}! 🍕`}
          </h1>
          {frio ? (
            <p>
              Foi um prazer conhecer o <b>{lead.negocio}</b>. Quando você estiver pronto(a) para
              dar o próximo passo, a Terelina estará aqui. Dê uma olhada no nosso catálogo ou
              converse com a gente no WhatsApp, sem compromisso.
            </p>
          ) : (
            <p>
              Pelo que você nos contou, a Terelina tem tudo para fazer o <b>{lead.negocio}</b> vender
              mais, com massas e pizzas padronizadas, de qualidade e prontas para o forno. Monte o
              seu primeiro pedido agora!
            </p>
          )}
        </div>

        {supermercado && (
          <div className="mentoria">
            <h2 className="h2">Mentoria para padarias</h2>
            <p><b>Aumente o fluxo da sua padaria com pizza.</b> Aprenda a transformar a pizza em
              motivo de visita e de ticket maior no seu supermercado.</p>
            <button className="btn gold" onClick={() => openWhatsApp(WHATSAPP_TIME, mentoriaMessage(lead))}>
              Quero saber mais
            </button>
          </div>
        )}

        {lead.verificar_entrega && (
          <p className="notice">Vamos confirmar com nosso time se conseguimos entregar na sua região.</p>
        )}

        {frio ? (
          <div className="stack">
            <button className="btn primary" onClick={onCatalog}>Ver catálogo</button>
            <button className="btn whats" onClick={falar}>Falar no WhatsApp</button>
          </div>
        ) : (
          <div className="stack">
            <button className="btn primary" onClick={onCatalog}>Montar meu pedido</button>
            <button className="btn outline" onClick={falar}>Falar com o time</button>
          </div>
        )}
        <button className="btn link" onClick={onRestart}>Refazer o quiz</button>
      </main>
    </div>
  );
}
