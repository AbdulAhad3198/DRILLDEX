'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  ExternalLink, 
  ShieldAlert, 
  Info, 
  Layers, 
  Compass, 
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { RiskAlert, OffsetWell } from '@/lib/data';

interface CriticalRiskPanelProps {
  alert: RiskAlert;
  currentDepth: number;
  onSelectWell: (wellId: string) => void;
  onOpenDoc: (docName: string) => void;
  onViewEvent: (eventDetails: any) => void;
  onViewFullAnalysis: () => void;
}

export function CriticalRiskPanel({
  alert,
  currentDepth,
  onSelectWell,
  onOpenDoc,
  onViewEvent,
  onViewFullAnalysis,
}: CriticalRiskPanelProps) {
  const distanceToInterval = Math.max(0, alert.riskIntervalStart - currentDepth);
  const isInsideInterval = currentDepth >= alert.riskIntervalStart && currentDepth <= alert.riskIntervalEnd;

  return (
    <div className={`flex flex-col h-full rounded-lg border transition-all duration-300 overflow-hidden ${
      isInsideInterval
        ? 'bg-gradient-to-b from-[#1c080d] via-[#12080f] to-[#0a0814] border-rose-600/90 shadow-xl shadow-rose-950/60'
        : 'bg-gradient-to-b from-[#180e14] via-[#110e1a] to-[#0a0f1d] border-amber-800/60 shadow-lg'
    }`}>
      {/* 1. Header: POTENTIAL RISK AHEAD */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-rose-950/70 to-amber-950/40 border-b border-rose-900/60">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded bg-rose-600/40 border border-rose-500 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white tracking-widest uppercase font-sans">
              {alert.header}
            </h2>
          </div>
        </div>

        {/* Risk Level Badge: HIGH */}
        <span className="px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase font-mono bg-rose-600 text-white shadow-sm">
          {alert.riskLevel} RISK
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        {/* Risk & Proximity Attributes */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-medium">Identified Hazard:</span>
            <span className="text-sm font-bold text-rose-300 font-sans tracking-wide">
              {alert.risk}
            </span>
          </div>

          {/* 4-Box Telemetry Matrix */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-black/40 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans block">Current Depth</span>
              <strong className="text-white text-sm">{currentDepth.toLocaleString()} m</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans block">Risk Interval</span>
              <strong className="text-amber-300 text-sm">{alert.riskIntervalStart} – {alert.riskIntervalEnd} m</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans block">Distance to Interval</span>
              <strong className={`text-sm ${distanceToInterval <= 50 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                {distanceToInterval} m ahead
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans block">Correlated Evidence</span>
              <span className="text-cyan-300 text-xs font-sans font-semibold">{alert.evidenceSummary}</span>
            </div>
          </div>
        </div>

        {/* 2. EVIDENCE PANEL (3 Evidence Cards: Well A, Well B, Well C) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-sans">
              Offset Well Historical Evidence
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Formation X Match</span>
          </div>

          <div className="space-y-2">
            {alert.evidenceCards.map((card, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#070c17] hover:bg-[#0b1324] border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                {/* Top Row: Well Name, Distance, Event, Depth */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="font-bold text-white text-xs">{card.wellName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({card.distanceKm} km)</span>
                  </div>

                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    {card.event} @ {card.depth.toLocaleString()} m
                  </span>
                </div>

                {/* Subtitle: Formation */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Formation: <strong className="text-slate-200">{card.formation}</strong></span>
                  <span className="font-mono text-cyan-400">{card.relevancePct}% Match</span>
                </div>

                {/* Action Buttons: View Well | View Source | View Event */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 text-[10px]">
                  <button
                    onClick={() => onSelectWell(card.wellId)}
                    className="flex-1 py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-medium"
                    title="Select and highlight on GIS map"
                  >
                    <Compass className="h-3 w-3 text-cyan-400" />
                    <span>View Well</span>
                  </button>

                  <button
                    onClick={() => onOpenDoc(card.sourceDoc)}
                    className="flex-1 py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-medium"
                    title="Open DDR/WCR report"
                  >
                    <FileText className="h-3 w-3 text-amber-400" />
                    <span>View Source</span>
                  </button>

                  <button
                    onClick={() => onViewEvent(card)}
                    className="flex-1 py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-medium"
                    title="Inspect historical incident and mitigation"
                  >
                    <Eye className="h-3 w-3 text-rose-400" />
                    <span>View Event</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RECOMMENDATION PANEL (Exact Text from Prompt) */}
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wide text-[10px]">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>{alert.recommendation.title}</span>
          </div>

          <p className="text-[11px] text-slate-200 leading-snug font-medium">
            &ldquo;{alert.recommendation.body}&rdquo;
          </p>

          <p className="text-[10px] text-amber-400/90 font-mono italic pt-0.5 border-t border-amber-900/50">
            &ldquo;{alert.recommendation.disclaimer}&rdquo;
          </p>
        </div>

        {/* Full Details Navigation CTA */}
        <button
          onClick={onViewFullAnalysis}
          className="w-full py-2 px-3 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-950/40 cursor-pointer"
        >
          <span>Deep-Dive Risk Analysis & Mitigations</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
