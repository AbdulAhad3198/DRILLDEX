'use client';

import React from 'react';
import { ShieldCheck, Activity, Sparkles } from 'lucide-react';

export function AuthLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060a14] text-white font-mono antialiased">
      {/* Background Subtle Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm px-6">
        {/* Animated NWIS Logo Badge */}
        <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-950 via-[#0b172e] to-indigo-950 border border-cyan-500/40 shadow-2xl shadow-cyan-950/80">
          <ShieldCheck className="h-8 w-8 text-cyan-400 animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl border border-cyan-400/20 animate-ping pointer-events-none opacity-40" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-white tracking-wider flex items-center justify-center gap-2">
            <span>eRTMAC-NWIS</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800">
              SECURE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Nearby Wells Intelligence System
          </p>
        </div>

        {/* Loading Spinner / Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full animate-pulse w-3/4" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span>Verifying Session...</span>
            </span>
            <span>OIL Assam Operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
