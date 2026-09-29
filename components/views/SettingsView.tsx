'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Radio, Sliders, Info, Check, RotateCcw } from 'lucide-react';
import { ActiveWellState } from '@/lib/data';

interface SettingsViewProps {
  activeWell: ActiveWellState;
}

import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Lock, ShieldCheck as UserShield } from 'lucide-react';

export function SettingsView({ activeWell }: SettingsViewProps) {
  const { user, signOut } = useAuth();
  const [witsmlUrl, setWitsmlUrl] = useState('https://ertmac.oil-india.internal/witsml/v1.4');
  const [pollingFreq, setPollingFreq] = useState(1);
  const [lookaheadDistance, setLookaheadDistance] = useState(300);
  const [mudLossThreshold, setMudLossThreshold] = useState(20);
  const [torqueThreshold, setTorqueThreshold] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4 pb-8 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="h-4 w-4 text-cyan-400" />
          <span>System Settings & Account Management</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage user profile, security session, and real-time WITSML telemetry feed parameters.
        </p>
      </div>

      {/* User Account Profile Card */}
      {user && (
        <div className="p-4 rounded-xl bg-[#091122] border border-slate-800 space-y-3 font-mono shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                User Account Profile
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              AUTHENTICATED SESSION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Email ID</span>
              <strong className="text-white text-xs truncate block font-bold">{user.email}</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Assigned Role</span>
              <strong className="text-cyan-300 text-xs block font-bold">{user.role}</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Account Status</span>
              <span className="text-emerald-400 text-xs font-bold block">{user.status}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans block">Last Active Session</span>
              <span className="text-slate-300 text-[11px] block">{new Date(user.lastLogin || user.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400">
              Role permissions are centrally validated via Supabase Auth layer.
            </span>
            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Configuration saved. Telemetry listener calibrated.</span>
        </div>
      )}

      {/* Section 1: eRTMAC Rig Integration */}
      <div className="p-4 rounded-lg bg-[#0b1324] border border-slate-800 space-y-3.5">
        <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <Radio className="h-4 w-4 text-cyan-400" />
          <span>eRTMAC & WITSML Stream Configuration</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">eRTMAC WITSML 1.4.1 Endpoint URL</label>
            <input
              type="text"
              value={witsmlUrl}
              onChange={e => setWitsmlUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#070c17] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
              Active Server: Oil India Limited Operations Cloud · Protocol: WITSML SOAP / RESTful JSON
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Sampling & Ingestion Frequency</label>
              <select
                value={pollingFreq}
                onChange={e => setPollingFreq(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md bg-[#070c17] border border-slate-700 text-xs text-cyan-300 focus:outline-none"
              >
                <option value={0.5}>0.5 Hz (Every 2 seconds)</option>
                <option value={1.0}>1.0 Hz (Every 1 second - Nominal)</option>
                <option value={2.0}>2.0 Hz (High Frequency Dynamic Mode)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Connected Active Well</label>
              <input
                type="text"
                disabled
                value={`${activeWell.name} (${activeWell.code})`}
                className="w-full px-3 py-2 rounded-md bg-[#070c17]/60 border border-slate-800 text-xs text-slate-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Offset Correlation & Proximity Thresholds */}
      <div className="p-4 rounded-lg bg-[#0b1324] border border-slate-800 space-y-3.5">
        <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span>Offset Correlation & Predictive Hazard Thresholds</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-md bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-slate-300 font-medium block text-[11px]">Lookahead Proximity Distance</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={lookaheadDistance}
                onChange={e => setLookaheadDistance(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded bg-[#070c17] border border-slate-700 text-cyan-400 font-mono font-bold text-xs"
              />
              <span className="text-slate-400 font-mono">meters ahead</span>
            </div>
            <p className="text-[10px] text-slate-400">Triggers alert before entering historical hazard interval.</p>
          </div>

          <div className="p-3 rounded-md bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-slate-300 font-medium block text-[11px]">Mud Loss Alarm Threshold</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={mudLossThreshold}
                onChange={e => setMudLossThreshold(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded bg-[#070c17] border border-slate-700 text-rose-400 font-mono font-bold text-xs"
              />
              <span className="text-slate-400 font-mono">bbl/hr loss</span>
            </div>
            <p className="text-[10px] text-slate-400">Classifies incident as high-severity lost circulation.</p>
          </div>

          <div className="p-3 rounded-md bg-slate-900/60 border border-slate-800 space-y-1.5">
            <label className="text-slate-300 font-medium block text-[11px]">Torque Fluctuation Threshold</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={torqueThreshold}
                onChange={e => setTorqueThreshold(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded bg-[#070c17] border border-slate-700 text-amber-400 font-mono font-bold text-xs"
              />
              <span className="text-slate-400 font-mono">k·ft-lb</span>
            </div>
            <p className="text-[10px] text-slate-400">Flags tight hole / formation stress warning.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Save Threshold Configuration</span>
          </button>
        </div>
      </div>

      {/* Section 3: Smart India Hackathon 2026 Submission Metadata */}
      <div className="p-4 rounded-lg bg-[#09101f] border border-cyan-900/60 space-y-3 text-xs">
        <h3 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
          <Info className="h-4 w-4 text-cyan-400" />
          <span>Smart India Hackathon 2026 Project Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
          <div>
            <span className="text-slate-400 text-[10px] block font-mono">Problem Statement ID</span>
            <strong className="text-cyan-400 font-mono text-sm">26121</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-mono">Problem Statement Title</span>
            <span className="font-semibold text-white">eRTMAC-NWIS (Nearby Wells Intelligence System)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-mono">Team Name & ID</span>
            <span className="text-slate-200">Hacksphere1 (Team ID: 159036)</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-mono">Target Operator</span>
            <span className="text-slate-200">Oil India Limited (OIL) — Duliajan & Makum Operations</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-black/40 border border-slate-800 text-[11px] text-slate-400 leading-normal">
          <strong>Decision-Support Architecture Note:</strong> &ldquo;eRTMAC tells what is happening now; NWIS tells what happened before and what may matter now.&rdquo; Built with Next.js App Router, React Leaflet, Recharts, and Google GenAI server-side RAG integration.
        </div>
      </div>
    </div>
  );
}
