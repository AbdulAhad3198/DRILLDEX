'use client';

import React from 'react';
import { Info, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#04070e] py-3 px-4 text-xs font-mono text-slate-400">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Core Philosophy Banner */}
        <div className="flex items-center gap-2 text-slate-200">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="font-semibold text-[11px] sm:text-xs">
            “<strong className="text-cyan-300">eRTMAC</strong> tells what is happening now. <strong className="text-amber-300">NWIS</strong> tells what happened before and what may matter now.”
          </p>
        </div>

        {/* Operational Disclaimer Footer */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold">
            PROTOTYPE / SIMULATED DATA
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Info className="h-3 w-3 text-cyan-400 shrink-0" />
            <span>Decision-support system. Final operational decisions remain with the drilling engineer.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
