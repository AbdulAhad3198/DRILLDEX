'use client';

import React from 'react';
import { Layers, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { FORMATION_STRATA } from '@/lib/data';

interface DepthStrataVisualizerProps {
  currentDepth: number;
  onSelectOffsetDepth?: (depth: number) => void;
}

export function DepthStrataVisualizer({
  currentDepth,
  onSelectOffsetDepth,
}: DepthStrataVisualizerProps) {
  // Interval coordinates for 4,000m to 6,000m viewport
  const minDepth = 4000;
  const maxDepth = 6000;
  const totalRange = maxDepth - minDepth;

  const getPercent = (depth: number) => {
    return Math.max(0, Math.min(100, ((depth - minDepth) / totalRange) * 100));
  };

  const currentDepthPct = getPercent(currentDepth);
  const riskStartPct = getPercent(5030);
  const riskHeightPct = getPercent(5120) - riskStartPct;

  // Offset historical incidents on the depth ruler
  const historicalEvents = [
    { name: 'Well B-03', depth: 4820, type: 'Mud Loss', color: '#ef4444' },
    { name: 'Well C-07', depth: 4850, type: 'High Torque', color: '#f59e0b' },
    { name: 'Well D-11', depth: 5060, type: 'Stuck Pipe', color: '#dc2626' },
  ];

  const isInsideRiskZone = currentDepth >= 5030 && currentDepth <= 5120;

  return (
    <div className="flex flex-col h-full rounded-lg bg-[#0b1324] border border-slate-800 p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase">
            Depth vs Historical Events
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Current Well
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Historical Events
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-[220px]">
        {/* Depth Column with Stratigraphy */}
        <div className="relative w-28 shrink-0 rounded bg-slate-900/90 border border-slate-800 flex">
          {/* Depth Ruler ticks */}
          <div className="w-10 shrink-0 border-r border-slate-800 flex flex-col justify-between py-1 px-1 font-mono text-[9px] text-slate-500 text-right select-none">
            <span>4,000</span>
            <span>4,500</span>
            <span>5,000</span>
            <span>5,500</span>
            <span>6,000</span>
          </div>

          {/* Strata Graphic Column */}
          <div className="relative flex-1 bg-[#090f1b] overflow-hidden">
            {/* Formation F-2B Kopili (4,400 to 4,750) */}
            <div
              className="absolute left-0 right-0 bg-indigo-950/40 border-b border-indigo-800/40 text-[8px] text-indigo-300 font-mono pl-1 flex items-center"
              style={{
                top: `${getPercent(4400)}%`,
                height: `${getPercent(4750) - getPercent(4400)}%`,
              }}
            >
              Kopili
            </div>

            {/* Formation F-3 Barail (4,750 to 5,250) */}
            <div
              className="absolute left-0 right-0 bg-blue-950/30 border-b border-blue-800/40 text-[8px] text-cyan-300 font-mono pl-1 flex items-center"
              style={{
                top: `${getPercent(4750)}%`,
                height: `${getPercent(5250) - getPercent(4750)}%`,
              }}
            >
              Barail F-3
            </div>

            {/* Red Risk Interval Zone: 5,030m - 5,120m */}
            <div
              className="absolute left-0 right-0 bg-rose-600/30 border-y-2 border-rose-500 z-10 flex items-center justify-center shadow-lg shadow-rose-900/40 animate-pulse"
              style={{
                top: `${riskStartPct}%`,
                height: `${riskHeightPct}%`,
              }}
            >
              <span className="text-[8px] font-bold text-rose-300 uppercase tracking-tighter bg-rose-950/90 px-1 py-0.5 rounded">
                Risk
              </span>
            </div>

            {/* Historical Incident Pins */}
            {historicalEvents.map((evt, idx) => {
              const top = getPercent(evt.depth);
              return (
                <div
                  key={idx}
                  className="absolute right-0 w-3 h-2 -translate-y-1/2 z-20 flex items-center justify-end"
                  style={{ top: `${top}%` }}
                  title={`${evt.name}: ${evt.type} at ${evt.depth}m`}
                >
                  <span
                    className="h-2 w-2 rounded-full ring-2 ring-black"
                    style={{ backgroundColor: evt.color }}
                  />
                </div>
              );
            })}

            {/* Current Depth Bit Marker */}
            <div
              className="absolute left-0 right-0 -translate-y-1/2 z-30 flex items-center border-t-2 border-cyan-400 transition-all duration-500"
              style={{ top: `${currentDepthPct}%` }}
            >
              <div className="h-3 w-3 bg-cyan-400 text-black font-bold text-[8px] rounded-r flex items-center justify-center font-mono shadow-md shadow-cyan-400/80">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Stratigraphy Details and Historical Correlation Panel */}
        <div className="flex-1 flex flex-col justify-between space-y-2 text-xs">
          {/* Active Bit readout */}
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Current Wellbore Bit</span>
              <span className="font-mono font-bold text-cyan-400">{currentDepth.toLocaleString()} m</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Formation: <strong className="text-slate-200">F-3 (Barail)</strong></span>
              <span>Lithology: <strong className="text-slate-200">Sandstone / Shale</strong></span>
            </div>
          </div>

          {/* Risk Interval callout */}
          <div className={`p-2.5 rounded border transition-colors ${
            isInsideRiskZone
              ? 'bg-rose-950/70 border-rose-600 text-rose-200'
              : 'bg-slate-900/80 border-rose-900/50 text-slate-300'
          }`}>
            <div className="flex items-center justify-between font-bold text-xs">
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Risk Interval
              </span>
              <span className="font-mono text-rose-300">5,030 – 5,120 m</span>
            </div>
            <p className="text-[10px] text-slate-300 mt-1 leading-tight">
              Expected Behaviour: Higher risk of mud loss, torque stalling, and differential pipe sticking.
            </p>
          </div>

          {/* Historical Offset Events list */}
          <div className="space-y-1 text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Offset Precedents in Interval
            </span>
            {historicalEvents.map((evt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800 text-[10px]"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: evt.color }}
                  />
                  <span className="font-semibold text-slate-200">{evt.name}</span>
                  <span className="text-slate-400">({evt.type})</span>
                </div>
                <span className="font-mono font-bold text-slate-300">{evt.depth.toLocaleString()} m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
