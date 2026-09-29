'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ExternalLink, 
  Download, 
  FileCheck, 
  Database, 
  Layers,
  Sparkles,
  Calendar,
  Eye
} from 'lucide-react';
import { HISTORICAL_DOCUMENTS, SourceDocument } from '@/lib/data';

interface HistoricalReportsViewProps {
  onOpenDoc: (docName: string) => void;
}

export function HistoricalReportsView({ onOpenDoc }: HistoricalReportsViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredDocs = HISTORICAL_DOCUMENTS.filter(doc => {
    if (typeFilter !== 'All' && doc.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.name.toLowerCase().includes(q) ||
        doc.wellName.toLowerCase().includes(q) ||
        doc.ocrExtractedText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span>Centralized Well Database (WCR, DDR & Mud Logs)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Unstructured historical drilling records ingested and vectorized via OCR + NLP entity extraction.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports or OCR text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md bg-[#091122] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#091122] border border-slate-800 text-slate-300">
            <span className="text-[10px] text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-transparent text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Document Types</option>
              <option value="WCR" className="bg-slate-900">WCR (Well Completion Report)</option>
              <option value="DDR" className="bg-slate-900">DDR (Daily Drilling Report)</option>
              <option value="Incident Report" className="bg-slate-900">Incident Reports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#0b1324] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Ingested Archive</span>
          <p className="text-lg font-bold font-mono text-white mt-0.5">42 Reports</p>
          <span className="text-[10px] text-emerald-400 font-mono">Makum & Moran Fields</span>
        </div>
        <div className="p-3 rounded-lg bg-[#0b1324] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono">OCR Extraction Engine</span>
          <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">99.4% Precision</p>
          <span className="text-[10px] text-slate-400 font-mono">Tesseract + LayoutLM</span>
        </div>
        <div className="p-3 rounded-lg bg-[#0b1324] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Extracted Incidents</span>
          <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">18 Key Events</p>
          <span className="text-[10px] text-slate-400 font-mono">Mud loss, stuck pipe, kick</span>
        </div>
        <div className="p-3 rounded-lg bg-[#0b1324] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Vector Embeddings</span>
          <p className="text-lg font-bold font-mono text-blue-400 mt-0.5">100% Indexed</p>
          <span className="text-[10px] text-slate-400 font-mono">Semantic RAG Active</span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="p-4 rounded-lg bg-[#0b1324] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-snug">{doc.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {doc.name} · Well: <strong className="text-slate-200">{doc.wellName}</strong>
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-cyan-300 border border-blue-700/50 shrink-0">
                  {doc.type}
                </span>
              </div>

              {/* Highlights */}
              <div className="mt-3 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Extracted Operational Highlights
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {doc.keyHighlights.slice(0, 2).map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Logged parameters excerpt */}
              <div className="mt-2.5 p-2 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono grid grid-cols-2 gap-2 text-slate-400">
                <div>
                  <span>Interval:</span> <strong className="text-slate-200">{doc.parametersLogged.depth}</strong>
                </div>
                <div>
                  <span>Mud Loss:</span> <strong className="text-rose-400">{doc.parametersLogged.lossRate}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                {doc.fileSize} · {doc.date}
              </span>

              <button
                onClick={() => onOpenDoc(doc.name)}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Inspect OCR & Parameters</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
