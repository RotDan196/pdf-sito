import React from 'react';
import { Shield, Zap, CheckCircle } from 'lucide-react';

const InfoSection = () => {
    return (
        <div className="info-section">
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '30px' }}>Perché PDF Pro?</h2>

            <div className="info-grid">
                <div className="info-card">
                    <h3><Shield size={20} color="#007AFF" /> Sicurezza Totale</h3>
                    <p>
                        Dimentica i server cloud lenti e insicuri. Noi usiamo la potenza del tuo computer.
                        I tuoi documenti sensibili (banca, lavoro, salute) rimangono privati al 100%.
                    </p>
                </div>

                <div className="info-card">
                    <h3><Zap size={20} color="#FFD60A" /> Velocità Istantanea</h3>
                    <p>
                        Poiché non devi caricare (upload) e scaricare (download) file pesanti,
                        l'elaborazione è immediata. Risparmia tempo prezioso.
                    </p>
                </div>

                <div className="info-card">
                    <h3><CheckCircle size={20} color="#34C759" /> Qualità Intatta</h3>
                    <p>
                        Manteniamo la qualità originale dei tuoi PDF e delle tue immagini.
                        Nessuna compressione nascosta o perdita di dettagli.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', color: '#86868b', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} PDF Pro - Strumenti professionali gratuiti per tutti.
            </div>
        </div>
    );
};

export default InfoSection;