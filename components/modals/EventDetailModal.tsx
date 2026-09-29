'use client';

import React from 'react';
import { AlertTriangle, X, FileText, CheckCircle2, ShieldAlert, ArrowRight, Clock } from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    wellName: string;
    distanceKm: number;
    formation: string;
    event: string;
    depth: number;
    sourceDoc: string;
    relevancePct: number;
    mitigationApplied: string;
  } | null;
  onOpenDoc: (docName: string) => void;
}

export function EventDetailModal({
  isOpen,
  onClose,
  event,
  onOpenDoc,
}: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-[#090f1e] border border-cyan-800/80 shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Historical Event Details — {event.wellName}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Offset {event.distanceKm} km · Incident @ {event.depth.toLocaleString()} m MD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Incident Summary */}
        <div className="p-3 rounded-lg bg-black/40 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Incident Classification:</span>
            <span className="font-bold text-rose-300 font-mono text-sm">{event.event}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Occurrence Depth</span>
              <strong className="text-white">{event.depth.toLocaleString()} m</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Stratigraphic Zone</span>
              <strong className="text-cyan-300">{event.formation}</strong>
            </div>
          </div>
        </div>

        {/* Proven Mitigation */}
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px] font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Field Proven Mitigation Applied</span>
          </div>
          <p className="text-emerald-200 leading-relaxed text-xs">
            {event.mitigationApplied}
          </p>
        </div>

        {/* Source Document Citation */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Verified Source Report</span>
              <strong className="text-slate-200 font-mono">{event.sourceDoc}</strong>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenDoc(event.sourceDoc);
            }}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Read Report</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
