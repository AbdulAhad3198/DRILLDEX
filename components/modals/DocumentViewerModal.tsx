'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { HISTORICAL_DOCUMENTS, SourceDocument } from '@/lib/data';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentIdOrName: string | null;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  documentIdOrName,
}: DocumentViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'ocr' | 'parameters' | 'summary'>('ocr');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !documentIdOrName) return null;

  // Find document matching either ID or filename
  const cleanTerm = documentIdOrName.toLowerCase().replace('.pdf', '');
  const doc: SourceDocument = HISTORICAL_DOCUMENTS.find(
    d => d.id.toLowerCase().includes(cleanTerm) ||
         d.name.toLowerCase().includes(cleanTerm) ||
         cleanTerm.includes(d.name.toLowerCase().replace('.pdf', ''))
  ) || HISTORICAL_DOCUMENTS[0]; // fallback to WCR-1187

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.ocrExtractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-xl bg-[#080d19] border border-cyan-800/80 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Document Viewer Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#060a14]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-blue-950 border border-blue-700/60 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white truncate">
                  {doc.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-cyan-300 border border-blue-700/40 shrink-0">
                  {doc.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {doc.name} · Well: <strong className="text-slate-200">{doc.wellName}</strong> · Size: {doc.fileSize} · Date: {doc.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Copy OCR Text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-800 bg-[#091122] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ocr')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeTab === 'ocr'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              OCR Extracted Report Text
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeTab === 'parameters'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Logged Incident Parameters
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive Highlights
            </button>
          </div>

          <span className="text-[10px] text-cyan-400/90 font-mono hidden sm:inline">
            OCR Confidence: 99.4% · eRTMAC Ingestion Pipeline
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'ocr' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200 text-[11px] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  High-relevance passage extracted from {doc.name}: Documents historical lost circulation and stuck-pipe mitigation across Formation F-3.
                </span>
              </div>

              {/* Monospace Document Paper View */}
              <div className="p-4 rounded-lg bg-[#050810] border border-slate-800/80 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-line select-text">
                {doc.ocrExtractedText}
              </div>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                Rig Sensor Log Excerpts at Incident Time
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Depth Interval</span>
                  <p className="text-base font-bold font-mono text-cyan-400 mt-1">{doc.parametersLogged.depth}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Mud Weight Logged</span>
                  <p className="text-base font-bold font-mono text-white mt-1">{doc.parametersLogged.mudWeight}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Mud Loss / Seepage Rate</span>
                  <p className="text-base font-bold font-mono text-rose-400 mt-1">{doc.parametersLogged.lossRate}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Torque Spikes</span>
                  <p className="text-base font-bold font-mono text-amber-400 mt-1">{doc.parametersLogged.torqueSpike}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block font-mono">
                  Applied Mitigation Formulation
                </span>
                <p className="text-xs text-emerald-200 mt-1 font-medium">
                  {doc.parametersLogged.mitigationApplied}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                Key Historical Takeaways for Well Engineers
              </h3>

              <div className="space-y-2">
                {doc.keyHighlights.map((hl, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 leading-snug">{hl}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400">
                <strong>Provenance:</strong> Ingested into eRTMAC-NWIS centralized knowledge repository via automated OCR & NLP entity recognition. Verified by Oil India Limited Drilling Engineering Division.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#060a14] text-xs">
          <span className="text-[11px] text-slate-400">
            Source: <strong className="text-slate-200">{doc.name}</strong> (Oil India Archives)
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
