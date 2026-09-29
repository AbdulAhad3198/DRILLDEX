'use client';

import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Activity, 
  Droplet, 
  Gauge, 
  RotateCw, 
  Sliders, 
  Compass,
  AlertTriangle
} from 'lucide-react';
import { RealTimeParameters } from '@/lib/data';

interface MetricCardsBarProps {
  parameters: RealTimeParameters;
  currentDepth: number;
}

export function MetricCardsBar({ parameters, currentDepth }: MetricCardsBarProps) {
  // Determine if inside or approaching the 5,030–5,070 m risk interval
  const isInsideRiskZone = currentDepth >= 5030 && currentDepth <= 5070;
  const isNearRiskZone = currentDepth >= 4950 && currentDepth < 5030;

  // Real-time parameter calculations with depth-dependent physical simulation
  const effectiveTorque = isInsideRiskZone ? 42.0 : isNearRiskZone ? parameters.torque : 22.0;
  const effectiveROP = isInsideRiskZone ? 6.2 : parameters.rop;
  const effectiveSPP = isInsideRiskZone ? 2950 : parameters.spp; // SPP drops during fluid loss
  const effectiveWOB = isInsideRiskZone ? 30.5 : parameters.wob; // Overpull / weight fluctuation
  const effectiveRPM = parameters.rpm;

  const depthPct = Math.min(100, Math.round((currentDepth / parameters.targetDepth) * 100));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Current Depth Card */}
      <div className={`p-3.5 rounded-lg border transition-all duration-300 relative overflow-hidden ${
        isInsideRiskZone
          ? 'bg-gradient-to-b from-rose-950/70 to-[#0c1424] border-rose-500 shadow-lg shadow-rose-950/50'
          : isNearRiskZone
          ? 'bg-gradient-to-b from-amber-950/50 to-[#0c1424] border-amber-600/70'
          : 'bg-[#0b1324] border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Current Depth</span>
          <span className="h-5 w-5 rounded bg-blue-950 border border-blue-700/60 flex items-center justify-center text-cyan-400 text-xs font-mono font-bold">
            ⏚
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {currentDepth.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-400">m</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Target: {parameters.targetDepth.toLocaleString()} m</span>
          <span className="text-cyan-400 font-bold">{depthPct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isInsideRiskZone ? 'bg-rose-500' : isNearRiskZone ? 'bg-amber-400' : 'bg-cyan-500'
            }`} 
            style={{ width: `${depthPct}%` }}
          />
        </div>
      </div>

      {/* 2. ROP Card */}
      <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">ROP</span>
          <span className="h-5 w-5 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 text-xs font-mono">
            ⚡
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {effectiveROP.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-400">m/hr</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Penetration Rate</span>
          <span className="text-emerald-400 font-medium flex items-center gap-0.5">
            <ArrowUp className="h-2.5 w-2.5" />
            +12% vs avg
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (effectiveROP / 30) * 100)}%` }} />
        </div>
      </div>

      {/* 3. WOB Card */}
      <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">WOB</span>
          <span className="h-5 w-5 rounded bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 text-xs font-mono">
            ⚖
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {effectiveWOB.toFixed(0)}
          </span>
          <span className="text-xs font-mono text-slate-400">klbf</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Weight on Bit</span>
          <span className="text-indigo-300 font-medium">Optimal</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (effectiveWOB / 40) * 100)}%` }} />
        </div>
      </div>

      {/* 4. Torque Card */}
      <div className={`p-3.5 rounded-lg border transition-all duration-300 ${
        isInsideRiskZone || effectiveTorque >= 35
          ? 'bg-gradient-to-b from-rose-950/70 to-[#0c1424] border-rose-500 shadow-lg shadow-rose-950/40'
          : effectiveTorque >= 30
          ? 'bg-gradient-to-b from-amber-950/50 to-[#0c1424] border-amber-500 shadow-md shadow-amber-950/30'
          : 'bg-[#0b1324] border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Torque</span>
          <span className={`h-5 w-5 rounded flex items-center justify-center text-xs font-mono ${
            effectiveTorque >= 30 
              ? 'bg-amber-950 border border-amber-600 text-amber-400' 
              : 'bg-slate-900 border border-slate-700 text-slate-400'
          }`}>
            ⚙
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
            effectiveTorque >= 35 ? 'text-rose-400' : effectiveTorque >= 30 ? 'text-amber-400' : 'text-white'
          }`}>
            {effectiveTorque.toFixed(1)}
          </span>
          <span className="text-xs font-mono text-slate-400">kNm</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Rotary Drag</span>
          {effectiveTorque >= 30 ? (
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <ArrowUp className="h-2.5 w-2.5" />
              High Drag
            </span>
          ) : (
            <span className="text-slate-400">Nominal</span>
          )}
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div 
            className={`h-full ${effectiveTorque >= 35 ? 'bg-rose-500' : 'bg-amber-400'}`} 
            style={{ width: `${Math.min(100, (effectiveTorque / 50) * 100)}%` }} 
          />
        </div>
      </div>

      {/* 5. RPM Card */}
      <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">RPM</span>
          <span className="h-5 w-5 rounded bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 text-xs font-mono">
            ↻
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {effectiveRPM}
          </span>
          <span className="text-xs font-mono text-slate-400">rpm</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Rotary Speed</span>
          <span className="text-cyan-300 font-medium">Continuous</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (effectiveRPM / 150) * 100)}%` }} />
        </div>
      </div>

      {/* 6. SPP Card */}
      <div className={`p-3.5 rounded-lg border transition-all duration-300 ${
        isInsideRiskZone
          ? 'bg-rose-950/60 border-rose-500'
          : 'bg-[#0b1324] border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">SPP</span>
          <span className="h-5 w-5 rounded bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-400 text-xs font-mono">
            ⚓
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
            isInsideRiskZone ? 'text-rose-400' : 'text-white'
          }`}>
            {effectiveSPP.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-400">psi</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Standpipe Press</span>
          {isInsideRiskZone ? (
            <span className="text-rose-400 font-bold flex items-center gap-0.5">
              <ArrowDown className="h-2.5 w-2.5" />
              -290 psi
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">Steady</span>
          )}
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, (effectiveSPP / 4000) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
