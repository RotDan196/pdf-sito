import React from 'react';

const InfoSection = () => {
    return (
        <div className="info-section">
            <h2>Perché scegliere PDF Pro?</h2>

            <div className="info-grid">
                <div className="info-card">
                    <h3>🔒 Privacy Totale</h3>
                    <p>
                        Elaboriamo i tuoi PDF <strong>direttamente nel browser</strong>.
                        Nessun file viene caricato su server esterni. Sicurezza al 100%.
                    </p>
                </div>

                <div className="info-card">
                    <h3>⚡ Velocità Lampo</h3>
                    <p>
                        Nessuna coda, nessun upload lento. L'elaborazione sfrutta la potenza del tuo dispositivo per risultati istantanei.
                    </p>
                </div>

                <div className="info-card">
                    <h3>📂 Come Funziona</h3>
                    <ol>
                        <li>Carica i tuoi PDF.</li>
                        <li>Scegli l'azione (Unisci, Ruota, ecc).</li>
                        <li>Scarica il risultato.</li>
                    </ol>
                </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.6, marginTop: '30px' }}>
                Tool gratuito e illimitato per la gestione dei documenti.
            </p>
        </div>
    );
};

export default InfoSection;