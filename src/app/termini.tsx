import { LegalPage } from '@/ui/LegalPage';

const CONTACT = 'giuseppeluigiricci@gmail.com';

export default function Termini() {
  return (
    <LegalPage
      title="Termini d'uso"
      updated="21 ottobre 2026"
      intro="Questi termini regolano l'uso di PointEarner, servizio fornito da Giuseppe Luigi Ricci, Roma (Italia). Usando l'app li accetti."
      sections={[
        {
          title: 'Il servizio',
          paragraphs: [
            'PointEarner permette ai negozi di gestire un programma fedeltà e ai clienti di accumulare punti mostrando un codice QR personale.',
          ],
        },
        {
          title: 'Account',
          paragraphs: [
            "Serve un'email valida. Sei responsabile dell'uso del tuo account. Puoi eliminarlo in qualsiasi momento dall'app, in Profilo → Elimina account.",
          ],
        },
        {
          title: 'Punti e premi',
          paragraphs: [
            'I punti valgono solo nel negozio dove sono stati assegnati. Non hanno valore in denaro, non si convertono in contanti e non si trasferiscono ad altri utenti o negozi.',
            'Premi, punti per visita e disponibilità dei premi sono decisi da ciascun negozio, che ne risponde.',
            'Se un negozio chiude o smette di usare PointEarner, i punti presso quel negozio non sono più utilizzabili.',
          ],
        },
        {
          title: 'Uso corretto',
          paragraphs: [
            "Non è consentito ottenere punti senza un acquisto reale, usare il QR di altre persone o tentare di aggirare i controlli dell'app. Gli account che lo fanno possono essere sospesi e i punti ottenuti in modo scorretto annullati.",
          ],
        },
        {
          title: 'Negozi',
          paragraphs: [
            "Chi registra un'attività dichiara di poterla rappresentare, mantiene corretti i premi pubblicati, rispetta le norme sulla privacy verso i propri clienti e risponde dell'operato dei collaboratori che aggiunge. Durante la fase pilota il servizio è gratuito.",
          ],
        },
        {
          title: 'Disponibilità',
          paragraphs: [
            'Il servizio può avere interruzioni per manutenzione o cause esterne. Restano salvi i diritti riconosciuti ai consumatori dal Codice del consumo.',
          ],
        },
        {
          title: 'Modifiche',
          paragraphs: ["Le modifiche ai termini sono comunicate nell'app prima di entrare in vigore."],
        },
        {
          title: 'Legge applicabile',
          paragraphs: [
            'Si applica la legge italiana. Per i consumatori è competente il foro del luogo di residenza o domicilio del consumatore.',
          ],
        },
        {
          title: 'Contatti',
          paragraphs: [`Per assistenza e segnalazioni: ${CONTACT}.`],
        },
      ]}
    />
  );
}
