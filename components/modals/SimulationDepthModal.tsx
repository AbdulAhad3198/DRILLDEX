'use client';

import React, { useState } from 'react';
import { Sliders, X, AlertTriangle, Play, RotateCcw, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface SimulationDepthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDepth: number;
  onUpdateDepth: (newDepth: number) => void;
}

export function SimulationDepthModal({
  isOpen,
  onClose,
  currentDepth,
  onUpdateDepth,
}: SimulationDepthModalProps) {
  const [sliderVal, setSliderVal] = useState(currentDepth);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'Initial Baseline',
      depth: 4780,
      description: '250 m before hazard. Nominal torque (11.5 k·ft-lb) & pressure.',
      badge: 'Normal',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    },
    {
      label: 'MVP Demo Scenario (Prompt)',
      depth: 4980,
      description: '50 m before Barail F-3 hazard. System alerts: Approaching high-risk interval.',
      badge: 'Pre-Hazard Alert',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    },
    {
      label: 'Inside Risk Interval',
      depth: 5045,
      description: 'Within 5,030–5,120 m interval. Peak mud loss precedent from Well B-03 & C-07.',
      badge: 'Active Hazard Zone',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-700',
    },
    {
      label: 'Post-Hazard Section',
      depth: 5180,
      description: 'Stabilized in deeper strata. Normal pressure restored after LCM treatment.',
      badge: 'Safe Interval',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-[#090f1d] border border-cyan-800/80 p-5 shadow-2xl shadow-cyan-950/50 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-600/30 border border-cyan-500 flex items-center justify-center text-cyan-400">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Simulate Drill Bit Depth Progression
              </h2>
              <p className="text-[11px] text-slate-400">
                Observe how eRTMAC-NWIS triggers proactive alerts as the well approaches offset hazards.
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

        {/* Current Depth Scrubber */}
        <div className="p-3.5 rounded-lg bg-[#070b16] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Selected Well Depth:</span>
            <span className="text-xl font-mono font-bold text-cyan-400">
              {sliderVal.toLocaleString()} <span className="text-xs text-slate-400">m MD</span>
            </span>
          </div>

          <input
            type="range"
            min={4500}
            max={5300}
            step={5}
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>4,500 m (Top)</span>
            <span className="text-rose-400 font-bold">5,030–5,120 m (Risk Interval)</span>
            <span>5,300 m (Base)</span>
          </div>
        </div>

        {/* Interactive Presets for Hackathon Jury Demo */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Jury Demo Scenarios (One-Click Test)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((preset, idx) => {
              const isCurrent = sliderVal === preset.depth;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSliderVal(preset.depth);
                    onUpdateDepth(preset.depth);
                  }}
                  className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{preset.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${preset.badgeColor}`}>
                      {preset.depth} m
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply & Cancel actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onUpdateDepth(sliderVal);
              onClose();
            }}
            className="px-4 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-950/50"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Depth ({sliderVal} m)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
