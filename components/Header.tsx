'use client';

import React from 'react';
import { 
  Radio, 
  Activity, 
  Sliders, 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { ActiveWellState } from '@/lib/data';
import { UserMenu } from '@/components/auth/UserMenu';

interface HeaderProps {
  well: ActiveWellState;
  currentDepth: number;
  onOpenDepthSimulator: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  unreadAlertCount: number;
  onOpenNotificationDrawer?: () => void;
}

export function Header({
  well,
  currentDepth,
  onOpenDepthSimulator,
  activeView,
  setActiveView,
  unreadAlertCount,
  onOpenNotificationDrawer,
}: HeaderProps) {
  // Proximity to risk interval (5,030 m – 5,070 m)
  const distanceToRisk = 5030 - currentDepth;
  const isInsideRisk = currentDepth >= 5030 && currentDepth <= 5070;
  const isApproaching = distanceToRisk > 0 && distanceToRisk <= 150;

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-800 bg-[#070b16]/95 backdrop-blur-md px-4 py-2.5 shadow-md">
      {/* Top Status Bar (Matching Prompt Exact Specification) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Well & Operational Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Active Well */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1325] border border-cyan-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Active Well:</span>
            <span className="font-bold text-white font-mono tracking-wider">{well.name}</span>
          </div>

          {/* Field */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">Field:</span>
            <span className="font-semibold text-slate-200">{well.field}</span>
          </div>

          {/* Formation */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400">Formation:</span>
            <span className="font-semibold text-cyan-300 font-mono">{well.currentFormation}</span>
          </div>

          {/* Current Depth */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Current Depth:</span>
            <span className="font-bold text-white font-mono text-sm tabular-nums">
              {currentDepth.toLocaleString()} m
            </span>
          </div>

          {/* Well Status: DRILLING */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 font-bold uppercase font-mono tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{well.status}</span>
          </div>

          {/* Connection: LIVE + Data Source: eRTMAC Stream */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#091122] border border-slate-800 text-xs">
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-white font-bold uppercase tracking-wider">{well.connection}</span>
            </div>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 font-mono text-[10px]">{well.dataSource}</span>
          </div>
        </div>

        {/* Right: Risk Proximity Alert & Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Proximity / Risk State Indicator */}
          {isInsideRisk ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/90 border border-rose-600 text-rose-300 text-xs font-bold animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>INSIDE RISK INTERVAL (5,030–5,070 m)</span>
            </div>
          ) : isApproaching ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/90 border border-amber-500 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>{distanceToRisk} m to Risk Interval (5,030 m)</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Baseline Drilling Profile</span>
            </div>
          )}

          {/* Depth Simulation Scrubber Toggle */}
          <button
            onClick={onOpenDepthSimulator}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-600/70 text-cyan-300 text-xs font-medium hover:bg-cyan-900/60 transition-colors shadow-sm cursor-pointer"
            title="Adjust bit depth to simulate approaching or entering the 5,030–5,070 m risk interval"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono">Simulate Bit Depth</span>
          </button>

          {/* Alert Notification Button */}
          <button
            onClick={() => {
              if (onOpenNotificationDrawer) {
                onOpenNotificationDrawer();
              } else {
                setActiveView('alerts');
              }
            }}
            className={`relative p-1.5 rounded border transition-colors cursor-pointer ${
              activeView === 'alerts' 
                ? 'bg-rose-950/80 border-rose-600 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="View Active Risk Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* User profile Menu */}
          <div className="pl-1 border-l border-slate-800">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Subheader Metadata Row */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <span>Target TD: <strong className="text-slate-200 font-mono">{well.parameters.targetDepth.toLocaleString()} m</strong></span>
          <span className="text-slate-600">·</span>
          <span>Predicted Risk Window: <strong className="text-amber-400 font-mono">5,030 – 5,070 m</strong></span>
          <span className="text-slate-600">·</span>
          <span>Lead Time: <strong className="text-cyan-400 font-mono">~2.7 hours at 18.4 m/hr ROP</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-400/90 font-mono">
          <span>⚠️ Prototype / Simulated Data</span>
        </div>
      </div>
    </header>
  );
}
