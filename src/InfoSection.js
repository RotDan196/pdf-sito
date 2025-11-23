import React from 'react';
import { ShieldCheck, Zap, Layers, Globe, Heart, Lock } from 'lucide-react';

const InfoSection = () => {
    return (
        <div className="info-wrapper fade-in">

            <div className="info-header">
                <h2>Il modo più intelligente di gestire i PDF</h2>
                <p>Potenza desktop, comodità del browser. Zero compromessi.</p>
            </div>

            {/* GRIGLIA PRINCIPALE 3 COLONNE */}
            <div className="info-grid">

                {/* CARD 1: PRIVACY */}
                <div className="info-card-premium">
                    <div className="icon-badge blue">
                        <Lock size={24} color="#007AFF" />
                    </div>
                    <h3>Privacy Assoluta</h3>
                    <p>
                        A differenza degli altri siti, i tuoi file <strong>non vengono mai caricati</strong> su un server.
                        Tutto avviene sul tuo dispositivo. I tuoi dati sensibili non lasciano mai il tuo PC.
                    </p>
                </div>

                {/* CARD 2: VELOCITÀ */}
                <div className="info-card-premium">
                    <div className="icon-badge yellow">
                        <Zap size={24} color="#FF9500" />
                    </div>
                    <h3>Velocità della Luce</h3>
                    <p>
                        Nessun tempo di upload o download. L'elaborazione è istantanea perché sfruttiamo la potenza
                        del tuo processore, non di un server lento dall'altra parte del mondo.
                    </p>
                </div>

                {/* CARD 3: STRUMENTI */}
                <div className="info-card-premium">
                    <div className="icon-badge purple">
                        <Layers size={24} color="#AF52DE" />
                    </div>
                    <h3>All-in-One Suite</h3>
                    <p>
                        Non serve installare programmi costosi. Unisci, Dividi, Ruota, Converti e Ripara i tuoi PDF
                        in un'unica interfaccia pulita e gratuita.
                    </p>
                </div>
            </div>

            {/* SEZIONE "TRUST" ORIZZONTALE */}
            <div className="trust-bar">
                <div className="trust-item">
                    <Globe size={20} color="#666" />
                    <span>Accessibile ovunque</span>
                </div>
                <div className="trust-item">
                    <ShieldCheck size={20} color="#666" />
                    <span>Crittografia SSL</span>
                </div>
                <div className="trust-item">
                    <Heart size={20} color="#ff3b30" />
                    <span>100% Gratuito</span>
                </div>
            </div>

            <p className="footer-note">
                &copy; {new Date().getFullYear()} PDF PRO ULTRA. Realizzato con passione per la produttività.
            </p>
        </div>
    );
};

export default InfoSection;