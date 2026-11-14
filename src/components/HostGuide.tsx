// How a room is hosted, start to finish. Folded by default: the regulars know it, and the
// room list above it is what most visits are for.
const STEPS: { title: string; text: string }[] = [
  { title: 'Reis et Rom', text: 'Gi Faxingen et navn og trykk «Reis et nytt Rom». I blir da Rommets Vert. Kun Faxepaven kan gjøre en Faxing offisiell.' },
  { title: 'Kall sammen Krigerne', text: 'Les Koden høyt eller del lenken. Hver Kriger trer inn fra sin egen telefon med Navn og kjønn. Den som er uten telefon, innskriver Verten selv.' },
  { title: 'Begynn kampen', text: 'Naar alle er samlet, trykker Verten «Begynn kampen». Timen gaar likt paa hver skjerm. Ingen kan tre inn efter dette; kommer noen sent, innskriver Verten dem.' },
  { title: 'Merk Eder selv', text: 'Den som haver tømt sin Liter, trykker «Fullbragt!» paa sitt eget kort. Den som gir tapt, trykker «Gav Opp».' },
  { title: 'Vertens makt', text: 'Ved feiltrykk kan Verten sette en Kriger i gang igjen, merke ham fullbragt, rette hans tid eller gjøre ham til Hestemann.' },
  { title: 'Avslutt og lagre', text: 'Naar Timen er ute, eller alle er ferdige, trykker Verten «Avslutt og lagre Faxing». Den som ennu drikker, blir Hestemann, og utfallet skrives i krøniken.' },
]

export default function HostGuide() {
  return <details className="host-guide">
    <summary>Slik holdes en Faxing</summary>
    <ol>{STEPS.map(step => <li key={step.title}><strong>{step.title}</strong><span>{step.text}</span></li>)}</ol>
    {/* The host role lives in this browser's storage; a private window forgets it on close. */}
    <p className="admin-only-note">Vertens makt bor i den telefon som reiste Rommet. Bruk ikke et privat vindu, og behold telefonen til Faxingen er lagret.</p>
  </details>
}
