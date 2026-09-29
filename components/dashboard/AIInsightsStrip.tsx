'use client';

import React from 'react';
import { 
  Bot, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  ClipboardCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface AIInsightsStripProps {
  currentDepth: number;
  onOpenAlertDetails?: () => void;
  onOpenAssistant?: () => void;
}

export function AIInsightsStrip({
  currentDepth,
  onOpenAlertDetails,
  onOpenAssistant,
}: AIInsightsStripProps) {
  // Proximity to risk zone (5,030 m)
  const distanceToLoss = 5030 - currentDepth;
  const isInside = currentDepth >= 5030 && currentDepth <= 5120;

  return (
    <div className="rounded-lg bg-[#0b1324] border border-slate-800 p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-blue-600/30 border border-blue-500 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-cyan-400" />
          </div>
          <h2 className="text-xs font-bold text-white tracking-wide uppercase">
            AI Offset Intelligence Insights
          </h2>
        </div>

        {onOpenAssistant && (
          <button
            onClick={onOpenAssistant}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Ask Decision Assistant</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Insight 1: Proximity */}
        <div 
          onClick={onOpenAlertDetails}
          className={`p-2.5 rounded-md border transition-all cursor-pointer ${
            isInside 
              ? 'bg-rose-950/60 border-rose-600/80 shadow-md shadow-rose-950/50' 
              : 'bg-[#09101f] hover:bg-[#0d162a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className={`p-1.5 rounded shrink-0 ${
              isInside ? 'bg-rose-600/30 text-rose-300' : 'bg-blue-950 text-cyan-400'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Proximity Alert
              </span>
              <p className="text-xs font-medium text-slate-200 leading-snug mt-0.5">
                {isInside 
                  ? 'Drill bit is currently penetrating the historical mud loss zone (5,030–5,120 m).'
                  : `You are ${distanceToLoss > 0 ? distanceToLoss : 50} m away from a historical mud loss interval (Well B-03).`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Insight 2: Torque Trend */}
        <div className="p-2.5 rounded-md bg-[#09101f] hover:bg-[#0d162a] border border-slate-800 transition-colors">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-amber-950/70 border border-amber-800/40 text-amber-400 shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Drilling Dynamics
              </span>
              <p className="text-xs font-medium text-slate-200 leading-snug mt-0.5">
                Torque is increasing (8% above average) — monitor for tight hole similar to Well C-07.
              </p>
            </div>
          </div>
        </div>

        {/* Insight 3: Formation Risk */}
        <div className="p-2.5 rounded-md bg-[#09101f] hover:bg-[#0d162a] border border-slate-800 transition-colors">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Geological Stratigraphy
              </span>
              <p className="text-xs font-medium text-slate-200 leading-snug mt-0.5">
                Formation F-3 shows higher instability risk based on 3 nearby offset wells.
              </p>
            </div>
          </div>
        </div>

        {/* Insight 4: Recommended Action */}
        <div 
          onClick={onOpenAlertDetails}
          className="p-2.5 rounded-md bg-[#09101f] hover:bg-[#0d162a] border border-cyan-900/60 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 shrink-0">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-semibold">
                Action Checklist
              </span>
              <p className="text-xs font-medium text-slate-200 leading-snug mt-0.5">
                Recommended: Review mud properties and prepare LCM pill on standby.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
