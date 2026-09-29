'use client';

import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Lightbulb, 
  ShieldAlert, 
  Layers, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { RiskAlert } from '@/lib/data';

interface RiskAlertCardProps {
  alert: RiskAlert;
  currentDepth: number;
  onViewDetails: () => void;
  onViewMitigation: () => void;
  onOpenDoc: (docName: string) => void;
}

export function RiskAlertCard({
  alert,
  currentDepth,
  onViewDetails,
  onViewMitigation,
  onOpenDoc,
}: RiskAlertCardProps) {
  const isInsideRiskZone = currentDepth >= alert.expectedIntervalStart && currentDepth <= alert.expectedIntervalEnd;

  return (
    <div className={`flex flex-col h-full rounded-lg border transition-all overflow-hidden ${
      isInsideRiskZone 
        ? 'bg-gradient-to-b from-[#1a080d] via-[#10070c] to-[#0a0710] border-rose-600/80 shadow-xl shadow-rose-950/50' 
        : 'bg-gradient-to-b from-[#180e14] via-[#110e1a] to-[#0a0f1d] border-rose-900/60'
    }`}>
      {/* Alert Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-rose-950/40 border-b border-rose-900/50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-rose-600/30 border border-rose-500 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            Risk Alert
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white tracking-wide uppercase">
          {alert.severity}
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        {/* Title and description */}
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
            {alert.title}
          </h3>
          <p className="text-[11px] text-slate-300 mt-1 leading-normal">
            Based on historical events from nearby offset wells and current real-time drilling trends.
          </p>
        </div>

        {/* Risk details block */}
        <div className="p-2.5 rounded bg-black/40 border border-rose-950/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Risk Type:</span>
            <span className="font-semibold text-rose-300">{alert.riskType}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-950/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Expected Interval</span>
              <span className="font-mono font-bold text-amber-300">
                {alert.expectedIntervalStart.toLocaleString()} – {alert.expectedIntervalEnd.toLocaleString()} m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Current Depth</span>
              <span className="font-mono font-bold text-white">
                {currentDepth.toLocaleString()} m
              </span>
            </div>
          </div>
        </div>

        {/* Primary View Details Button */}
        <button
          onClick={onViewDetails}
          className="w-full py-2 px-3 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-950/40 cursor-pointer"
        >
          <span>View Detailed Alert & Evidence</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        {/* Key Evidence Section */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Key Evidence (Offset Reports)
            </span>
            <span className="text-[10px] text-slate-400">3 Wells Match</span>
          </div>

          <div className="space-y-1.5">
            {alert.evidenceItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onOpenDoc(item.sourceDoc.split(' ')[0])}
                className="group flex items-center justify-between p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0 group-hover:text-cyan-400 transition-colors" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {item.wellName} — {item.incidentType} @ {item.depth.toLocaleString()} m
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {item.sourceDoc}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="text-[10px] text-slate-400 block">Relevance</span>
                  <span className="font-mono text-cyan-400 font-bold text-[11px]">
                    {item.relevancePct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/50 space-y-2">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300 block text-[11px]">
                Recommended Action
              </span>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                Review mud rheology & prepare 50 bbl LCM pill on standby before entering {alert.expectedIntervalStart} m.
              </p>
            </div>
          </div>

          <button
            onClick={onViewMitigation}
            className="w-full py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/50 text-amber-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Mitigation History</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
