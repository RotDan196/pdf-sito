import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import download from 'downloadjs';
import { Upload, FileText, Layers, Trash2 } from 'lucide-react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Quando carichi i file
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setFiles([...files, ...pdfFiles]);
  };

  // 2. Per rimuovere un file
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // 3. Il cuore: UNIRE I PDF
  const mergePDFs = async () => {
    if (files.length < 2) return alert("Devi caricare almeno 2 PDF!");
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      download(pdfBytes, "mio-pdf-unito.pdf", "application/pdf");
    } catch (error) {
      alert("Errore! Forse uno dei PDF è protetto da password.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="container">
      <h1>📄 Unisci i tuoi PDF</h1>
      <p>Gratis, sicuro e veloce. I file non lasciano il tuo PC.</p>

      <div className="upload-area">
        <label htmlFor="upload">
          <Upload size={40} />
          <span>Clicca qui per selezionare i PDF</span>
        </label>
        <input id="upload" type="file" multiple accept="application/pdf" onChange={handleFileChange} />
      </div>

      <div className="files-list">
        {files.map((file, i) => (
          <div key={i} className="file-item">
            <span><FileText size={16} /> {file.name}</span>
            <button onClick={() => removeFile(i)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <button onClick={mergePDFs} disabled={isProcessing || files.length < 2} className="btn-merge">
        {isProcessing ? "Sto lavorando..." : "UNISCI PDF ORA"} <Layers size={20} />
      </button>
    </div>
  );
}

export default App;