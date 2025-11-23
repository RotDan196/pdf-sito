import React from 'react';
import './App.css'; // Usa lo stesso CSS

const InfoSection = () => {
    return (
        <div className="glass-container info-section" style={{ marginTop: '40px', textAlign: 'left' }}>
            <h2>Perché scegliere PDF Pro?</h2>

            <div className="info-grid">
                <div className="info-card">
                    <h3>🔒 Privacy Totale</h3>
                    <p>
                        A differenza di altri siti, noi elaboriamo i tuoi PDF <strong>direttamente nel tuo browser</strong>.
                        Nessun file viene mai caricato su server esterni. I tuoi documenti rimangono sul tuo computer.
                    </p>
                </div>

                <div className="info-card">
                    <h3>⚡ Velocità Immediata</h3>
                    <p>
                        Non devi aspettare code di caricamento o download. L'elaborazione è istantanea perché sfrutta la potenza del tuo dispositivo.
                    </p>
                </div>

                <div className="info-card">
                    <h3>📂 Come Unire i PDF</h3>
                    <ol>
                        <li>Clicca su "Seleziona File PDF".</li>
                        <li>Scegli due o più documenti dal tuo dispositivo.</li>
                        <li>Ordina i file se necessario.</li>
                        <li>Premi il pulsante "Unisci" e salva il nuovo file.</li>
                    </ol>
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '20px' }}>
                Questo strumento supporta l'unione, la separazione e la rotazione di file PDF gratuitamente e senza limiti.
            </p>
        </div>
    );
};

export default InfoSection;