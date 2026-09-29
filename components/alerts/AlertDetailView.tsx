'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Layers,
  Activity,
  CheckSquare,
  Square,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Info,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea
} from 'recharts';
import { RiskAlert, HISTORICAL_MUD_LOSS_DEPTH_TREND, OffsetWell } from '@/lib/data';
import { NearbyWellsMap } from '../dashboard/NearbyWellsMap';
import { ActiveWellState } from '@/lib/data';

interface AlertDetailViewProps {
  alert: RiskAlert;
  activeWell: ActiveWellState;
  offsetWells: OffsetWell[];
  currentDepth: number;
  onBack: () => void;
  onOpenDoc: (docName: string) => void;
  onSelectWell: (well: OffsetWell) => void;
}

export function AlertDetailView({
  alert,
  activeWell,
  offsetWells,
  currentDepth,
  onBack,
  onOpenDoc,
  onSelectWell,
}: AlertDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'mitigation' | 'analysis'>('overview');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [acknowledgedTime, setAcknowledgedTime] = useState<string | null>(null);

  // Interactive Key Actions checklist
  const [actions, setActions] = useState(alert.keyActions);

  const toggleAction = (id: string) => {
    setActions(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    setAcknowledgedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="space-y-3.5 pb-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Risk Alerts</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold">Alert Details</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Alert ID: {alert.id} · Priority 1 Drilling Advisory
        </span>
      </div>

      {/* Big Red Alert Banner (Matching Screenshot 1) */}
      <div className="rounded-lg bg-gradient-to-r from-rose-950/90 via-[#200b12] to-[#120e20] border border-rose-600 p-4 shadow-xl shadow-rose-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title and Description */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/50">
              <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-extrabold text-white tracking-wide">
                  {alert.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white tracking-wider uppercase">
                  {alert.severity} Risk
                </span>
                {isAcknowledged && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Acknowledged at {acknowledgedTime}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Similar event found in nearby offset wells. High risk of mud loss and differential sticking in the upcoming interval.
              </p>
            </div>
          </div>

          {/* Right Telemetry Information Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded bg-black/50 border border-rose-900/60">
              <span className="text-[10px] text-slate-400 block font-sans">Current Well</span>
              <span className="font-bold text-white">A-12</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-black/50 border border-rose-900/60">
              <span className="text-[10px] text-slate-400 block font-sans">Current Depth</span>
              <span className="font-bold text-cyan-400">{currentDepth.toLocaleString()} m</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-black/50 border border-rose-900/60">
              <span className="text-[10px] text-slate-400 block font-sans">Risk Interval</span>
              <span className="font-bold text-amber-400">
                {alert.expectedIntervalStart.toLocaleString()} – {alert.expectedIntervalEnd.toLocaleString()} m
              </span>
            </div>
            <div className="px-3 py-1.5 rounded bg-black/50 border border-rose-900/60">
              <span className="text-[10px] text-slate-400 block font-sans">Formation</span>
              <span className="font-bold text-slate-200">F-3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['overview', 'evidence', 'mitigation', 'analysis'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab === 'overview'
              ? 'Overview'
              : tab === 'evidence'
              ? 'Historical Evidence'
              : tab === 'mitigation'
              ? 'Mitigation History'
              : 'AI Analysis'}
          </button>
        ))}
      </div>

      {/* Main 3-Column Layout Matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Card 1: Why this alert? */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-blue-600/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                Why this alert?
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              AI found similar events in nearby wells based on spatial location, target depth, formation stratigraphy, and drilling parameters.
            </p>

            <div className="space-y-2">
              {/* Item 1: Well B-03 */}
              <div 
                onClick={() => {
                  const b03 = offsetWells.find(w => w.id === 'W-B03');
                  if (b03) onSelectWell(b03);
                }}
                className="p-2.5 rounded bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-white">Similar mud-loss event in Well B-03</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">92% similarity</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Mud loss occurred at 4,820 m and 5,040 m in the exact same formation (F-3).
                </p>
              </div>

              {/* Item 2: Well C-07 */}
              <div 
                onClick={() => {
                  const c07 = offsetWells.find(w => w.id === 'W-C07');
                  if (c07) onSelectWell(c07);
                }}
                className="p-2.5 rounded bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-white">High torque in Well C-07</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">87% similarity</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  High torque observed at 4,850 m & 5,060 m, likely related to formation tectonic stress.
                </p>
              </div>

              {/* Item 3: Well D-11 */}
              <div 
                onClick={() => {
                  const d11 = offsetWells.find(w => w.id === 'W-D11');
                  if (d11) onSelectWell(d11);
                }}
                className="p-2.5 rounded bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span className="text-xs font-bold text-white">Stuck pipe in Well D-11</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">81% similarity</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Stuck pipe event at 5,060 m, close to the current risk interval, resulting in 38h NPT.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Historical Evidence Table */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                Historical Evidence
              </h2>
              <button 
                onClick={() => setActiveTab('evidence')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-sans font-medium">
                  <th className="pb-1">Well</th>
                  <th className="pb-1">Event</th>
                  <th className="pb-1">Depth (m)</th>
                  <th className="pb-1">Formation</th>
                  <th className="pb-1 text-right">Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {alert.evidenceItems.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onOpenDoc(item.sourceDoc.split(' ')[0])}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2 font-sans font-bold text-slate-200">
                      {item.wellName}
                      <span className="text-[9px] text-slate-400 block font-mono">({item.distanceKm} km)</span>
                    </td>
                    <td className="py-2 text-rose-300 font-sans text-[11px]">
                      {item.incidentType.split(' ')[0]} {item.incidentType.split(' ')[1] || ''}
                    </td>
                    <td className="py-2 text-slate-300">{item.depth.toLocaleString()}</td>
                    <td className="py-2 text-slate-400">{item.formation.replace('Formation ', '')}</td>
                    <td className="py-2 text-right">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/40">
                        {item.relevancePct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card 3: Spatial Radar GIS Mini View */}
          <div className="h-56 rounded-lg overflow-hidden border border-slate-800">
            <NearbyWellsMap
              activeWell={activeWell}
              offsetWells={offsetWells}
              onSelectWell={onSelectWell}
            />
          </div>
        </div>

        {/* Center Column (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Card 1: Risk Interval & Formation */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                Risk Interval & Formation
              </h2>
            </div>

            {/* Depth column graphic */}
            <div className="p-3 rounded bg-slate-900/90 border border-slate-800 flex gap-4 items-center">
              {/* Graphic depth bar */}
              <div className="w-14 h-48 rounded bg-[#070c17] border border-slate-800 relative flex flex-col justify-between py-1 px-1 font-mono text-[9px] text-slate-400">
                <span>4,000</span>
                <span>4,500</span>
                <span>5,000</span>
                <span>5,500</span>
                <span>6,000</span>

                {/* Current Depth marker */}
                <div
                  className="absolute left-0 right-0 -translate-y-1/2 border-t-2 border-cyan-400 flex items-center justify-between"
                  style={{ top: `${((currentDepth - 4000) / 2000) * 100}%` }}
                >
                  <span className="text-[8px] bg-cyan-400 text-black font-bold px-1 rounded-r">
                    {currentDepth}m
                  </span>
                </div>

                {/* Risk Interval box */}
                <div
                  className="absolute left-0 right-0 bg-rose-600/40 border-y border-rose-500 flex items-center justify-center"
                  style={{
                    top: `${((5030 - 4000) / 2000) * 100}%`,
                    height: `${((5120 - 5030) / 2000) * 100}%`,
                  }}
                >
                  <span className="text-[8px] font-bold text-rose-300">5030-5120</span>
                </div>
              </div>

              {/* Stratigraphic metadata */}
              <div className="flex-1 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Formation</span>
                  <p className="font-bold text-white text-sm">Formation F-3 (Barail)</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Lithology</span>
                  <p className="text-slate-200">Depleted Sandstone / Friable Shale</p>
                </div>

                <div className="p-2 rounded bg-rose-950/40 border border-rose-900/50">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block">
                    Expected Behaviour
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                    Severe lost circulation into depleted fracture network and differential sticking on prolonged stops.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Mud Loss Trend (Historical Comparison) Chart */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>Mud Loss Trend (Historical Comparison)</span>
              </h2>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Current Well (A-12)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Similar Wells Avg (bbl/hr)
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORICAL_MUD_LOSS_DEPTH_TREND} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="depth" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <ReferenceArea x1={5030} x2={5120} stroke="#ef4444" strokeOpacity={0.8} fill="#ef4444" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="offsetAvg" name="Offset Wells Avg Loss" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
                  <Line type="monotone" dataKey="currentWell" name="Current Well A-12" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Key Observations */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span>Key Observations</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {alert.keyObservations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-snug">{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Card 1: AI Recommendation & Interactive Key Actions */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-cyan-800/60 space-y-3 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-cyan-600/30 flex items-center justify-center text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                AI Recommendation
              </h2>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Review mud properties and prepare proactive lost-circulation mitigation measures before entering the risk interval (5,030 – 5,120 m).
            </p>

            {/* Checklist */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recommended Actions Checklist
              </span>
              <div className="space-y-1.5">
                {actions.map(act => (
                  <div
                    key={act.id}
                    onClick={() => toggleAction(act.id)}
                    className={`flex items-start gap-2.5 p-2 rounded border transition-colors cursor-pointer text-xs ${
                      act.completed
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {act.completed ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span className={`leading-snug ${act.completed ? 'line-through text-slate-400' : ''}`}>
                      {act.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleAcknowledge}
                disabled={isAcknowledged}
                className={`w-full py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAcknowledged
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/40'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isAcknowledged ? 'Alert Acknowledged by Engineer' : '✓ Acknowledge Alert'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>View Evidence</span>
                </button>
                <button
                  onClick={() => setActiveTab('mitigation')}
                  className="py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                  <span>Review Mitigation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Mitigation History Table */}
          <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-2.5">
            <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
              <span>Mitigation History</span>
            </h2>

            <div className="space-y-2">
              {alert.mitigationHistory.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenDoc(m.sourceDoc)}
                  className="p-2.5 rounded bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{m.wellName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        m.result === 'Worked'
                          ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                          : 'bg-amber-950 border border-amber-700/60 text-amber-300'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${m.result === 'Worked' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {m.result}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {m.actionTaken}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <FileText className="h-3 w-3" />
                      {m.sourceDoc}
                    </span>
                    <span>Click to inspect report</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Inspiring Mission Quote / Philosophy */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#0c1629] to-[#070d18] border border-slate-800 text-center space-y-1">
            <p className="text-xs font-semibold text-cyan-300">
              Learn from the past. Drill safer tomorrow.
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Every well adds to the collective knowledge base. Every early alert saves time, cost, and NPT.
            </p>
            <p className="text-[10px] font-mono text-amber-400/90 pt-1">
              Decision Support System · Final decisions remain with drilling engineer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
