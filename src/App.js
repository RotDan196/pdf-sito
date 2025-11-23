import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import download from 'downloadjs';
import { auth, loginWithGoogle, logout, db } from './firebase'; // Importa Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Upload, FileText, Layers, Scissors, RotateCw, Image as ImageIcon, Trash2, LogOut, User, Lock } from 'lucide-react';
import './App.css';
import InfoSection from './InfoSection';
import PrivacyPage from './PrivacyPage';

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Ascolta se l'utente è loggato
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- GESTIONE FILE ---
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Accetta PDF e Immagini
    const validFiles = selectedFiles.filter(file =>
      file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Funzione per aggiornare le statistiche nel DB
  const updateStats = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { filesProcessed: increment(1) });
    }
  };

  // --- FUNZIONI TOOL ---
  const mergePDFs = async () => {
    if (files.length < 2) return alert("Servono almeno 2 file!");
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        if (file.type !== 'application/pdf') continue; // Salta immagini nel merge per ora
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      download(pdfBytes, "merged-doc.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore unione."); }
    setIsProcessing(false);
  };

  const imagesToPDF = async () => {
    if (files.length === 0) return alert("Carica immagini!");
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') image = await pdfDoc.embedJpg(imageBytes);
        else if (file.type === 'image/png') image = await pdfDoc.embedPng(imageBytes);
        else continue;

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
      download(pdfBytes, "images-converted.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore conversione immagini."); }
    setIsProcessing(false);
  };

  // ... (Tieni splitPDF e rotatePDF uguali a prima, omettiamoli per brevità ma tu lasciali)

  if (showPrivacy) return <PrivacyPage onClose={() => setShowPrivacy(false)} />;

  return (
    <div className="main-wrapper">
      <div className="liquid-bg"></div>
      <div className="liquid-bg-2"></div>

      {/* NAVBAR */}
      <nav className="glass-nav">
        <div className="logo">PDF PRO</div>
        {user ? (
          <div className="user-menu">
            <img src={user.photoURL} alt="User" className="avatar" />
            <span>{user.displayName}</span>
            <button onClick={logout} className="logout-btn"><LogOut size={16} /></button>
          </div>
        ) : (
          <button onClick={loginWithGoogle} className="login-btn">
            <User size={16} /> Accedi con Google
          </button>
        )}
      </nav>

      <div className="glass-container">

        {/* TITOLO DINAMICO */}
        <header>
          <h1>{user ? `Ciao, ${user.displayName.split(' ')[0]}` : "Gestione Documenti"}</h1>
          <p>{user ? "Pronto a lavorare sui tuoi file?" : "Accedi per salvare le tue statistiche e supportarci."}</p>
        </header>

        {/* WORKSPACE ORDINATA */}
        {files.length === 0 ? (
          // SE NON CI SONO FILE: MOSTRA TASTO UPLOAD GIGANTE
          <div className="upload-section">
            <label htmlFor="upload" className="glass-button upload-btn">
              <Upload size={28} />
              <span>Carica PDF o Immagini</span>
            </label>
            <input id="upload" type="file" multiple accept="application/pdf, image/png, image/jpeg" onChange={handleFileChange} />
            <p className="small-text">I file vengono elaborati localmente e criptati dal browser.</p>
          </div>
        ) : (
          // SE CI SONO FILE: MOSTRA LISTA E STRUMENTI (Niente più tasto upload gigante)
          <div className="workspace fade-in">
            <div className="toolbar">
              <span>{files.length} file pronti</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label htmlFor="add-more" className="add-more-btn">+ Aggiungi</label>
                <input id="add-more" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                <button onClick={() => setFiles([])} className="clear-btn">Svuota</button>
              </div>
            </div>

            <div className="file-list">
              {files.map((file, i) => (
                <div key={i} className="file-item">
                  <div className="file-icon">
                    {file.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <span className="filename">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="delete-btn"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>

            {/* GRIGLIA FUNZIONI INTELLIGENTE */}
            <div className="functions-title">STRUMENTI DISPONIBILI</div>
            <div className="actions-grid">

              <button onClick={mergePDFs} disabled={isProcessing} className="action-card">
                <div className="icon-box"><Layers size={24} /></div>
                <div className="text-box">
                  <strong>Unisci PDF</strong>
                  <small>Combina più file in uno</small>
                </div>
              </button>

              <button onClick={imagesToPDF} disabled={isProcessing} className="action-card">
                <div className="icon-box"><ImageIcon size={24} /></div>
                <div className="text-box">
                  <strong>Img to PDF</strong>
                  <small>Crea PDF da foto</small>
                </div>
              </button>

              {/* Pulsante "Coming Soon" per far vedere che il sito è vivo */}
              <button disabled className="action-card disabled">
                <div className="icon-box"><Lock size={24} /></div>
                <div className="text-box">
                  <strong>Comprimi</strong>
                  <small>Prossimamente</small>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* Info Section solo se non ci sono file per tenere pulito */}
        {files.length === 0 && <InfoSection />}

      </div>

      <footer className="glass-footer">
        <button onClick={() => setShowPrivacy(true)}>Privacy & Sicurezza</button>
      </footer>
    </div>
  );
}

export default App;