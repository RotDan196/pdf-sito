import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees, StandardFonts, rgb, Grayscale } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import download from 'downloadjs';
import { auth, loginWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore'; // Aggiunti getDoc e setDoc
import {
  Upload, Layers, Scissors, RotateCw, Image as ImageIcon,
  Trash2, LogOut, User, Type, FileImage, Grid, ArrowLeft, ArrowRight,
  X, Loader2, FileText as TextIcon, Wrench, RefreshCcw, SortAsc,
  CheckCircle, LayoutTemplate, Hash, Droplet, Eraser
} from 'lucide-react';
import './App.css';
import InfoSection from './InfoSection';
import PrivacyPage from './PrivacyPage';

// --- FIX PDF.JS v5 ---
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function App() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // STATI EDITOR
  const [activeTool, setActiveTool] = useState(null);
  const [toolParams, setToolParams] = useState({});
  const [totalPages, setTotalPages] = useState(0);

  // --- EFFETTO LOGIN (Gestisce anche il ritorno da iPhone) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // SE L'UTENTE È LOGGATO, CONTROLLA/CREA IL DATABASE
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // Crea profilo se non esiste
            await setDoc(userRef, {
              name: currentUser.displayName,
              email: currentUser.email,
              joinedAt: new Date(),
              filesProcessed: 0,
              isPremium: false
            });
          }
        } catch (e) {
          console.error("Errore DB (non bloccante):", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- ANTEPRIME ---
  const generatePreview = async (file) => {
    if (file.type.startsWith('image/')) return URL.createObjectURL(file);
    if (file.type === 'text/plain') return null;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (error) { return null; }
  };

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    setIsProcessing(true);
    const newFiles = await Promise.all(selected.map(async (file) => {
      const previewUrl = await generatePreview(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        type: file.type,
        name: file.name
      };
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
  };

  const removeFile = (id) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    if (updated.length === 0) setActiveTool(null);
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const updateStats = async () => {
    if (user) {
      try { await updateDoc(doc(db, "users", user.uid), { filesProcessed: increment(1) }); } catch (e) { }
    }
  };

  // --- EDITOR TOOLS ---
  const openExtractTool = async () => {
    setIsProcessing(true);
    try {
      const pdfBytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      setTotalPages(pdf.getPageCount());
      setActiveTool('extract');
      setToolParams({ ranges: '' });
    } catch (e) { alert("Errore lettura file."); }
    setIsProcessing(false);
  };

  const executeRangeExtraction = async () => {
    const pages = new Set();
    toolParams.ranges.split(',').forEach(part => {
      const p = part.trim();
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(Number);
        if (start && end) for (let i = start; i <= end; i++) if (i <= totalPages) pages.add(i - 1);
      } else {
        const num = Number(p);
        if (num && num <= totalPages) pages.add(num - 1);
      }
    });
    const indices = Array.from(pages).sort((a, b) => a - b);
    if (indices.length === 0) return alert("Intervallo non valido!");
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(pdf, indices);
      copied.forEach(p => newPdf.addPage(p));
      download(await newPdf.save(), "estratto.pdf", "application/pdf");
      updateStats();
      setActiveTool(null);
    } catch (e) { alert("Errore estrazione."); }
    setIsProcessing(false);
  };

  const openRotateTool = () => { setActiveTool('rotate'); setToolParams({ rotation: 0 }); };
  const executeRotation = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      pdf.getPages().forEach(p => p.setRotation(degrees(p.getRotation().angle + toolParams.rotation)));
      download(await pdf.save(), "ruotato.pdf", "application/pdf");
      updateStats();
      setActiveTool(null);
    } catch (e) { alert("Errore rotazione."); }
    setIsProcessing(false);
  };

  // --- DIRECT TOOLS ---
  const mergePDFs = async () => {
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const f of files) {
        if (f.type !== 'application/pdf') continue;
        const bytes = await f.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      download(await mergedPdf.save(), "unito.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore unione."); }
    setIsProcessing(false);
  };

  const imagesToPDF = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const bytes = await f.file.arrayBuffer();
        let image;
        if (f.type.includes('jpeg') || f.type.includes('jpg')) image = await pdfDoc.embedJpg(bytes);
        else if (f.type.includes('png')) image = await pdfDoc.embedPng(bytes);
        else continue;
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      download(await pdfDoc.save(), "album.pdf", "application/pdf");
      updateStats();
    } catch (err) { alert("Errore immagini."); }
    setIsProcessing(false);
  };

  const txtToPDF = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const text = await files[0].file.text();
      const lines = text.split('\n');
      let page = pdfDoc.addPage();
      let y = page.getHeight() - 50;
      for (const line of lines) {
        if (y < 50) { page = pdfDoc.addPage(); y = page.getHeight() - 50; }
        page.drawText(line.substring(0, 90), { x: 50, y, size: 12, font });
        y -= 15;
      }
      download(await pdfDoc.save(), "testo.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore TXT."); }
    setIsProcessing(false);
  };

  const pdfToImages = async () => {
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const arrayBuffer = await files[0].file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        zip.file(`pagina-${i}.jpg`, imgData, { base64: true });
      }
      download(await zip.generateAsync({ type: "blob" }), "immagini.zip", "application/zip");
      updateStats();
    } catch (err) { alert("Errore conversione."); }
    setIsProcessing(false);
  };

  const addPageNumbers = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      pages.forEach((p, i) => {
        const { width } = p.getSize();
        p.drawText(`${i + 1}`, { x: width - 30, y: 20, size: 12, font });
      });
      download(await pdf.save(), "numerato.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore numerazione."); }
    setIsProcessing(false);
  };

  const addWatermark = async () => {
    const text = prompt("Testo Watermark:", "CONFIDENTIAL");
    if (!text) return;
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      pdf.getPages().forEach(p => {
        const { width, height } = p.getSize();
        p.drawText(text, { x: width / 4, y: height / 2, size: 50, font, color: rgb(0.9, 0.2, 0.2), opacity: 0.3, rotate: degrees(45) });
      });
      download(await pdf.save(), "watermark.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore watermark."); }
    setIsProcessing(false);
  };

  const flattenPDF = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      try { pdf.getForm().flatten(); } catch (e) { }
      download(await pdf.save(), "riparato.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore flatten."); }
    setIsProcessing(false);
  }

  const reversePDF = async () => {
    setIsProcessing(true);
    try {
      const bytes = await files[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const count = pdf.getPageCount();
      const newPdf = await PDFDocument.create();
      for (let i = count - 1; i >= 0; i--) {
        const [p] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(p);
      }
      download(await newPdf.save(), "inverso.pdf", "application/pdf");
      updateStats();
    } catch (e) { alert("Errore"); }
    setIsProcessing(false);
  };

  // --- UI RENDER ---
  const allPDFs = files.length > 0 && files.every(f => f.type === 'application/pdf');
  const allImages = files.length > 0 && files.every(f => f.type.startsWith('image/'));
  const isTxt = files.length === 1 && files[0].type === 'text/plain';

  return (
    <div className="main-wrapper">
      <div className="liquid-bg"></div>
      <div className="liquid-bg-2"></div>
      {showPrivacy && <PrivacyPage onClose={() => setShowPrivacy(false)} />}

      <nav className="glass-nav">
        <div className="logo" onClick={() => { setActiveTool(null); setFiles([]) }} style={{ cursor: 'pointer' }}>
          PDF PRO <span style={{ color: '#ff3b30', fontSize: '0.6em', verticalAlign: 'super' }}>ULTRA</span>
        </div>
        {user ? (
          <div className="user-menu">
            <img src={user.photoURL} alt="User" className="avatar" />
            <button onClick={logout} className="logout-btn"><LogOut size={16} /></button>
          </div>
        ) : (
          <button onClick={loginWithGoogle} className="login-btn"><User size={16} /> Accedi</button>
        )}
      </nav>

      <div className="glass-container">
        {!activeTool && (
          <header>
            <h1>Il tuo Workspace PDF.</h1>
            <p className="subtitle">Strumenti potenti. Privacy totale.</p>
          </header>
        )}

        {files.length === 0 ? (
          <div className="upload-section">
            <label htmlFor="upload" className="glass-button big-upload">
              <Upload size={32} /> <span>Seleziona File</span>
            </label>
            <input id="upload" type="file" multiple accept=".pdf, .jpg, .jpeg, .png, .txt" onChange={handleFileChange} />
            <p className="drop-text">Trascina qui PDF, Immagini o Testo</p>
          </div>
        ) : (
          <div className="workspace fade-in">

            {!activeTool && (
              <>
                <div className="toolbar">
                  <div className="toolbar-left">
                    <button onClick={() => setFiles([])} className="back-btn"><X size={18} /> Chiudi Tutto</button>
                    <span className="count-badge">{files.length} File</span>
                  </div>
                  <label htmlFor="add-more" className="add-btn-icon"><Upload size={18} /></label>
                  <input id="add-more" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                </div>

                <div className="preview-grid">
                  {files.map((item, i) => (
                    <div key={item.id} className="preview-card">
                      <div className="thumb-box">
                        {item.previewUrl ? <img src={item.previewUrl} alt="Prev" /> : <div className="generic-icon"><TextIcon size={40} /></div>}
                        <div className="overlay-actions">
                          {i > 0 && <button onClick={() => moveFile(i, -1)} className="move-btn"><ArrowLeft size={14} /></button>}
                          <button onClick={() => removeFile(item.id)} className="delete-btn-mini"><Trash2 size={16} /></button>
                          {i < files.length - 1 && <button onClick={() => moveFile(i, 1)} className="move-btn"><ArrowRight size={14} /></button>}
                        </div>
                        <div className="page-number">{i + 1}</div>
                      </div>
                      <div className="card-name">{item.name}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* --- EDITOR ESTRAZIONE --- */}
            {activeTool === 'extract' && (
              <div className="tool-editor fade-in">
                <div className="editor-header">
                  <h2><Scissors size={24} /> Estrazione Avanzata</h2>
                  <p>Il file ha <strong>{totalPages}</strong> pagine.</p>
                </div>
                <div className="editor-preview-row">
                  <div className="thumb-box big"><img src={files[0].previewUrl} alt="Preview" /></div>
                  <div className="editor-controls">
                    <label>Pagine da mantenere:</label>
                    <input type="text" placeholder="Es: 1-5, 8" className="range-input"
                      value={toolParams.ranges} onChange={(e) => setToolParams({ ...toolParams, ranges: e.target.value })} />
                    <div className="action-buttons">
                      <button onClick={() => setActiveTool(null)} className="ilove-btn secondary">Annulla</button>
                      <button onClick={executeRangeExtraction} className="ilove-btn primary">ESTRAI</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- EDITOR ROTAZIONE --- */}
            {activeTool === 'rotate' && (
              <div className="tool-editor fade-in">
                <div className="editor-header"><h2><RotateCw size={24} /> Rotazione</h2></div>
                <div className="editor-preview-row center">
                  <div className="thumb-box big" style={{ transform: `rotate(${toolParams.rotation}deg)`, transition: '0.3s' }}>
                    <img src={files[0].previewUrl} alt="Preview" />
                  </div>
                </div>
                <div className="rotate-controls">
                  <button onClick={() => setToolParams({ rotation: toolParams.rotation + 90 })} className="ilove-btn secondary">Ruota</button>
                  <button onClick={executeRotation} className="ilove-btn primary">SALVA</button>
                  <button onClick={() => setActiveTool(null)} className="ilove-btn text-only">Annulla</button>
                </div>
              </div>
            )}

            {!activeTool && !isProcessing && (
              <div className="functions-panel">
                <div className="action-group">
                  {allPDFs && files.length > 1 && <button onClick={mergePDFs} className="ilove-btn primary"><Layers size={20} /> UNISCI PDF</button>}
                  {allImages && <button onClick={imagesToPDF} className="ilove-btn primary"><ImageIcon size={20} /> CREA PDF</button>}
                  {isTxt && <button onClick={txtToPDF} className="ilove-btn primary"><Type size={20} /> CONVERTI PDF</button>}
                </div>

                {files.length === 1 && allPDFs && (
                  <div className="grid-options">
                    <button onClick={openExtractTool} className="ilove-card"><LayoutTemplate size={24} color="#34C759" /> <span>Dividi/Estrai</span></button>
                    <button onClick={openRotateTool} className="ilove-card"><RotateCw size={24} color="#FF9500" /> <span>Ruota</span></button>
                    <button onClick={pdfToImages} className="ilove-card"><FileImage size={24} color="#E879F9" /> <span>PDF in JPG</span></button>
                    <button onClick={addPageNumbers} className="ilove-card"><Hash size={24} color="#007AFF" /> <span>Numera Pag.</span></button>
                    <button onClick={addWatermark} className="ilove-card"><Type size={24} color="#FF3B30" /> <span>Watermark</span></button>
                    <button onClick={reversePDF} className="ilove-card"><RefreshCcw size={24} color="#5856D6" /> <span>Inverti</span></button>
                    <button onClick={flattenPDF} className="ilove-card"><Wrench size={24} color="#8E8E93" /> <span>Ripara</span></button>
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="processing-box">
                <Loader2 className="spin" size={40} color="#007AFF" />
                <p>Elaborazione in corso...</p>
              </div>
            )}

          </div>
        )}

        {files.length === 0 && <InfoSection />}
      </div>
      <footer className="glass-footer">
        <button className="footer-link" onClick={() => setShowPrivacy(true)}>Privacy & Sicurezza</button>
      </footer>
    </div>
  );
}

export default App;