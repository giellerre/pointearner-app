import { Linking } from 'react-native';
import { SUPPORT_EMAIL } from '@/lib/config';
import { Button } from '@/ui/components';
import { LegalPage } from '@/ui/LegalPage';

const CONTACT = SUPPORT_EMAIL || 'giuseppeluigiricci@gmail.com';

export default function EliminaAccount() {
  const subject = encodeURIComponent('Richiesta di eliminazione account PointEarner');
  const body = encodeURIComponent(
    "Chiedo di eliminare il mio account PointEarner e tutti i dati collegati.\n\nEmail con cui accedo all'app: ",
  );
  return (
    <LegalPage
      title="Eliminare l'account PointEarner"
      updated="21 ottobre 2026"
      intro="Puoi eliminare il tuo account PointEarner e tutti i dati collegati in due modi. In entrambi i casi la cancellazione è definitiva."
      sections={[
        {
          title: "Dall'app, subito",
          bullets: ["Apri PointEarner ed entra con la tua email.", 'Vai in Profilo.', 'Tocca Elimina account e conferma.'],
        },
        {
          title: 'Via email, senza app',
          paragraphs: [
            `Scrivi a ${CONTACT} dall'indirizzo con cui accedi, con oggetto «Richiesta di eliminazione account PointEarner». Eliminiamo l'account entro 30 giorni e ti confermiamo via email.`,
          ],
        },
        {
          title: 'Cosa viene cancellato',
          bullets: [
            'Account ed email di accesso.',
            'Nome che mostri ai negozi.',
            'Tutte le tessere, i punti e lo storico delle visite in ogni negozio.',
            'Se sei l’unico titolare di un negozio, anche il negozio con i suoi premi e collaboratori.',
          ],
          paragraphs: ['Non conserviamo copie dopo la cancellazione. I punti non sono recuperabili.'],
        },
      ]}
    >
      <Button title="Scrivi la richiesta via email" onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${subject}&body=${body}`)} />
    </LegalPage>
  );
}
