'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  FileText, 
  Clock, 
  Compass, 
  Sparkles, 
  Bot, 
  Download, 
  Sliders, 
  ChevronRight, 
  Info,
  CheckSquare,
  Square,
  TrendingUp,
  Flame,
  Radio,
  Share2,
  Copy,
  Check
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
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

import { 
  ActiveWellState, 
  INITIAL_ACTIVE_WELL, 
  PRIMARY_RISK_ALERT,
  OFFSET_WELLS 
} from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { SimulationDepthModal } from '@/components/modals/SimulationDepthModal';

interface RiskAnalysisViewProps {
  activeWell?: ActiveWellState;
  currentDepth?: number;
  onOpenDoc?: (docName: string) => void;
  onOpenDepthSimulator?: () => void;
}

// Depth-Risk Profile Series (4,700 m to 5,200 m)
const DEPTH_RISK_DATA = [
  { depth: 4700, riskScore: 12, historicalDensity: 8, torqueRisk: 10, lossRisk: 6 },
  { depth: 4750, riskScore: 15, historicalDensity: 10, torqueRisk: 12, lossRisk: 8 },
  { depth: 4800, riskScore: 18, historicalDensity: 12, torqueRisk: 14, lossRisk: 10 },
  { depth: 4850, riskScore: 22, historicalDensity: 15, torqueRisk: 18, lossRisk: 12 },
  { depth: 4900, riskScore: 26, historicalDensity: 18, torqueRisk: 20, lossRisk: 15 },
  { depth: 4940, riskScore: 32, historicalDensity: 24, torqueRisk: 28, lossRisk: 20 },
  { depth: 4980, riskScore: 48, historicalDensity: 42, torqueRisk: 45, lossRisk: 35 }, // Current Depth
  { depth: 5000, riskScore: 62, historicalDensity: 58, torqueRisk: 58, lossRisk: 52 },
  { depth: 5010, riskScore: 71, historicalDensity: 68, torqueRisk: 68, lossRisk: 62 }, // Warning Zone
  { depth: 5025, riskScore: 86, historicalDensity: 84, torqueRisk: 78, lossRisk: 74 }, // Well C stuck pipe
  { depth: 5030, riskScore: 89, historicalDensity: 88, torqueRisk: 82, lossRisk: 80 }, // Start of Critical Interval
  { depth: 5040, riskScore: 94, historicalDensity: 95, torqueRisk: 88, lossRisk: 96 }, // Well A mud loss peak
  { depth: 5050, riskScore: 91, historicalDensity: 92, torqueRisk: 90, lossRisk: 88 },
  { depth: 5060, riskScore: 92, historicalDensity: 90, torqueRisk: 96, lossRisk: 78 }, // Well B torque spike
  { depth: 5070, riskScore: 78, historicalDensity: 76, torqueRisk: 74, lossRisk: 65 }, // End of Critical Interval
  { depth: 5085, riskScore: 55, historicalDensity: 50, torqueRisk: 48, lossRisk: 42 },
  { depth: 5100, riskScore: 38, historicalDensity: 32, torqueRisk: 30, lossRisk: 28 },
  { depth: 5150, riskScore: 24, historicalDensity: 20, torqueRisk: 22, lossRisk: 18 },
  { depth: 5200, riskScore: 18, historicalDensity: 15, torqueRisk: 16, lossRisk: 12 },
];

export function RiskAnalysisView({
  activeWell = INITIAL_ACTIVE_WELL,
  currentDepth: propDepth,
  onOpenDoc,
  onOpenDepthSimulator,
}: RiskAnalysisViewProps) {
  const [currentDepth, setCurrentDepth] = useState<number>(propDepth || activeWell.parameters.depth || 4980);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [activeCurveFilter, setActiveCurveFilter] = useState<'all' | 'torque' | 'loss'>('all');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Engineer Review Interactive Checklist
  const [reviewChecklist, setReviewChecklist] = useState([
    { id: 'chk-1', text: 'Compare historical torque trends from Well B (5,060 m)', checked: true, critical: true },
    { id: 'chk-2', text: 'Review mud-loss events from Well A (5,040 m) & LCM standby protocol', checked: true, critical: true },
    { id: 'chk-3', text: 'Review offset-well drilling parameters (ROP cap < 8 m/hr, WOB < 18 klbf)', checked: false, critical: true },
    { id: 'chk-4', text: 'Review historical mitigation measures & enforce 3-min stationary limit (Well C)', checked: false, critical: false },
  ]);

  const toggleChecklist = (id: string) => {
    setReviewChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleOpenDoc = (name: string) => {
    if (onOpenDoc) {
      onOpenDoc(name);
    } else {
      setSelectedDoc(name);
    }
  };

  const handleCopyRiskBrief = () => {
    const brief = `[DRILLDEX eRTMAC-NWIS RISK BRIEF]
Target Well: ${activeWell.name} @ ${currentDepth} m
Status: HIGH ATTENTION | Approaching Critical Interval 5,030–5,070 m (Distance: ${5030 - currentDepth} m)
Primary Risk: Stuck Pipe / High Torque (Prototype Risk Score: 82/100)
Historical Evidence: 3 Offset Wells in Formation X (Well A @ 5,040m mud loss, Well B @ 5,060m torque spike, Well C @ 5,025m stuck pipe)
Decision Support: Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.`;
    navigator.clipboard.writeText(brief);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadExecutiveReport = () => {
    const reportText = `===================================================================
DRILLDEX | eRTMAC-NWIS DRILLING RISK INTELLIGENCE DOSSIER
===================================================================
Active Target Well: ${activeWell.name} (${activeWell.field})
Operator: Oil India Limited (OIL)
Current Measured Depth: ${currentDepth} m MD
Active Formation: Formation X (Barail Sandstone)
Next Critical Interval: 5,030 m – 5,070 m (Delta: ${5030 - currentDepth} m to entry)
System Threat Classification: HIGH ATTENTION

-------------------------------------------------------------------
1. RISK OVERVIEW MATRIX
-------------------------------------------------------------------
- Mud Loss:             MEDIUM (Sub-hydrostatic depleted sands)
- Stuck Pipe:           HIGH   (Differential sticking hazard)
- Torque Spike:         HIGH   (Tectonic shale stress & coal pinch)
- Kick / Pressure:      LOW    (Under-balanced influx unlikely)
- Cementing Issue:      MEDIUM (Annular void loss risk)

-------------------------------------------------------------------
2. MULTI-FACTOR RISK CONFIDENCE
-------------------------------------------------------------------
Prototype Risk Score: 82 / 100
(Prototype risk score based on simulated historical patterns. Not a statistical probability.)
- Historical Event Frequency:     35%
- Formation Geological Match:     25%
- Depth Stratigraphic Proximity:  20%
- Drilling Parameter Anomaly:     20%

-------------------------------------------------------------------
3. CORROBORATING HISTORICAL OFFSET EVIDENCE
-------------------------------------------------------------------
[1] Well A (Offset: 3.0 km | Bearing NW 315°):
    - Depth: 5,040 m MD in Formation X
    - Event: Severe Mud Loss (78 bbl/hr lost circulation)
    - Source: DDR-2021-WELL-A-042 (Page 42)
    - Mitigation: 40 bbl coarse LCM pill + 4.5h hesitation squeeze

[2] Well B (Offset: 4.7 km | Bearing NE 045°):
    - Depth: 5,060 m MD in Formation X
    - Event: High Torque Spike (38 kNm) & top drive stalls
    - Source: DDR-2022-WELL-B-118 (Page 18)
    - Mitigation: Rheology thinning (YP 18), organic lubricant beads, ROP capped

[3] Well C (Offset: 6.2 km | Bearing SE 135°):
    - Depth: 5,025 m MD in Formation X
    - Event: Differential Stuck Pipe (38 hrs NPT, 180 klbf overpull)
    - Source: WCR-2019-WELL-C-076 (Page 88)
    - Mitigation: 50 bbl surfactant soak pill + hydraulic jarring

-------------------------------------------------------------------
4. ENGINEER REVIEW & RECOMMENDED MITIGATION ACTIONS
-------------------------------------------------------------------
Recommended Operational Procedures:
[X] 1. Compare historical torque trends with Well B baseline.
[X] 2. Pre-mix 40 bbl coarse LCM pill on surface prior to entering 5,020 m.
[ ] 3. Cap ROP at 8.0 m/hr to limit dynamic ECD pressure surges.
[ ] 4. Enforce strict 3-minute stationary drillstring limit across interval.

-------------------------------------------------------------------
COMPLIANCE NOTICE
-------------------------------------------------------------------
This system provides decision support. Recommendations are provided for 
engineer review. Final operational decisions remain with the drilling engineer.
===================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeWell.name}_Risk_Intelligence_Briefing.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const distanceToEntry = 5030 - currentDepth;

  return (
    <div className="space-y-6 pb-14 animate-in fade-in duration-200">
      {/* ==================================================
          1. HEADER (Exact Prompt Requirements)
          ================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wide font-sans">
              Risk Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 border border-blue-700 text-cyan-300">
              AI DECISION SUPPORT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Identify historically relevant drilling risks before entering critical intervals.
          </p>
        </div>

        {/* Status Indicators (Current Depth | Next Critical Interval | Risk Status: HIGH ATTENTION) */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {/* Current Depth */}
          <div className="px-3 py-1.5 rounded-lg bg-[#0b1325] border border-cyan-800/80 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-slate-400 text-[10px] uppercase font-sans">Current Depth:</span>
            <strong className="text-cyan-400 font-bold text-sm tabular-nums">
              {currentDepth.toLocaleString()} m
            </strong>
          </div>

          {/* Next Critical Interval */}
          <div className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-amber-800/80 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-slate-400 text-[10px] uppercase font-sans">Next Critical Interval:</span>
            <strong className="text-amber-300 font-bold text-sm">
              5,030–5,070 m
            </strong>
            <span className="text-[10px] text-slate-400 font-sans">({distanceToEntry} m away)</span>
          </div>

          {/* Risk Status: HIGH ATTENTION */}
          <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-600/90 text-rose-300 flex items-center gap-2 shadow-lg shadow-rose-950/40">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] text-rose-400/90 uppercase font-sans font-semibold">Risk Status</span>
              <strong className="text-white font-extrabold tracking-wider text-xs">
                HIGH ATTENTION
              </strong>
            </div>
          </div>

          {/* Quick Simulation / Scrubber Trigger */}
          <button
            onClick={() => (onOpenDepthSimulator ? onOpenDepthSimulator() : setIsDepthModalOpen(true))}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Adjust Simulation Depth"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ==================================================
          2. RISK OVERVIEW (5 Cards: Mud Loss, Stuck Pipe, Torque Spike, Kick, Cementing)
          Green = Low | Amber = Medium | Red = High
          ================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider font-sans flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span>Hazard Likelihood Matrix for Approaching Interval (5,030–5,070 m)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Green = Low · Amber = Medium · Red = High
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Mud Loss: MEDIUM (Amber) */}
          <div className="p-3.5 rounded-xl bg-[#0b1324] border border-amber-600/70 hover:border-amber-500 transition-all shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 font-sans">Mud Loss</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-600">
                MEDIUM
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: '64%' }} />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Micro-fractured Barail sands; Well A experienced 78 bbl/hr losses at 5,040 m.
            </p>
          </div>

          {/* 2. Stuck Pipe: HIGH (Red) */}
          <div className="p-3.5 rounded-xl bg-[#0b1324] border border-rose-600/80 hover:border-rose-500 transition-all shadow-md space-y-2 bg-rose-950/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white font-sans flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>Stuck Pipe</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-sm animate-pulse">
                HIGH
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: '88%' }} />
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Differential sticking hazard in depleted sands. Well C logged 38h NPT at 5,025 m.
            </p>
          </div>

          {/* 3. Torque Spike: HIGH (Red) */}
          <div className="p-3.5 rounded-xl bg-[#0b1324] border border-rose-600/80 hover:border-rose-500 transition-all shadow-md space-y-2 bg-rose-950/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white font-sans flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
                <span>Torque Spike</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-600 shadow-sm">
                HIGH
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: '84%' }} />
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Tectonic shale stress & coal seams. Well B rotary torque jumped to 38 kNm at 5,060 m.
            </p>
          </div>

          {/* 4. Kick / Pressure: LOW (Green) */}
          <div className="p-3.5 rounded-xl bg-[#0b1324] border border-emerald-700/70 hover:border-emerald-600 transition-all shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 font-sans">Kick / Pressure</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-600">
                LOW
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: '18%' }} />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Pore pressure sub-hydrostatic (1.02–1.14 SG); gas shows controlled under 45 units.
            </p>
          </div>

          {/* 5. Cementing Issue: MEDIUM (Amber) */}
          <div className="p-3.5 rounded-xl bg-[#0b1324] border border-amber-600/70 hover:border-amber-500 transition-all shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 font-sans">Cementing Issue</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-600">
                MEDIUM
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: '55%' }} />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Lost circulation during production liner primary cement slurry placement.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          3. DEPTH RISK PROFILE (Large Recharts Visualization)
          X: Depth | Y: Risk Score | Plot Historical Risk Density, Current Position, Highlight 5,030–5,070 m, Vertical Line 4,980 m
          ================================================== */}
      <div className="rounded-xl bg-[#0b1324] border border-slate-800 p-4 md:p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm font-sans">
                Depth-Stratigraphic Risk Profile Model
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-well spatial correlation showing Historical Risk Density vs Approaching Risk Horizon.
            </p>
          </div>

          {/* Interactive Curve Filter */}
          <div className="flex items-center gap-1.5 bg-[#070c17] p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveCurveFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeCurveFilter === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Composite Risk
            </button>
            <button
              onClick={() => setActiveCurveFilter('torque')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeCurveFilter === 'torque'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Torque Spike
            </button>
            <button
              onClick={() => setActiveCurveFilter('loss')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeCurveFilter === 'loss'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mud Loss
            </button>
          </div>
        </div>

        {/* Large Recharts Visualization */}
        <div className="h-[380px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={DEPTH_RISK_DATA}
              margin={{ top: 25, right: 30, left: 10, bottom: 25 }}
            >
              <defs>
                <linearGradient id="riskDensityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="torqueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="depth"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
                label={{
                  value: 'Measured Depth MD (meters)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#cbd5e1',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              />

              <YAxis
                stroke="#94a3b8"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
                label={{
                  value: 'Risk Score (0 - 100)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#cbd5e1',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#070c18',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />

              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

              {/* Exact Prompt Requirement: Highlight 5,030–5,070 m */}
              <ReferenceArea
                x1={5030}
                x2={5070}
                fill="#e11d48"
                fillOpacity={0.16}
                label={{
                  value: 'PREDICTED CRITICAL RISK INTERVAL (5,030 – 5,070 m)',
                  position: 'top',
                  fill: '#fda4af',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              />

              {/* Exact Prompt Requirement: Add a vertical line CURRENT DEPTH = 4,980 m */}
              <ReferenceLine
                x={currentDepth}
                stroke="#38bdf8"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                label={{
                  value: `CURRENT DEPTH = ${currentDepth.toLocaleString()} m`,
                  position: 'insideTopLeft',
                  fill: '#38bdf8',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              />

              {/* Warning zone entry line */}
              <ReferenceLine
                x={5010}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                label={{
                  value: 'Warning Zone Entry (5,010 m)',
                  position: 'insideTopRight',
                  fill: '#fbbf24',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />

              {/* Historical Risk Density Curve */}
              {(activeCurveFilter === 'all' || activeCurveFilter === 'torque') && (
                <Area
                  type="monotone"
                  dataKey="historicalDensity"
                  name="Historical Risk Density"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#riskDensityGrad)"
                />
              )}

              {/* Composite Risk Curve */}
              {activeCurveFilter === 'all' && (
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  name="Predicted / Relevant Risk Interval"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {/* Torque Curve */}
              {(activeCurveFilter === 'all' || activeCurveFilter === 'torque') && (
                <Line
                  type="monotone"
                  dataKey="torqueRisk"
                  name="Torque Anomaly Likelihood"
                  stroke="#fbbf24"
                  strokeWidth={1.8}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}

              {/* Loss Curve */}
              {(activeCurveFilter === 'all' || activeCurveFilter === 'loss') && (
                <Line
                  type="monotone"
                  dataKey="lossRisk"
                  name="Lost Circulation Likelihood"
                  stroke="#34d399"
                  strokeWidth={1.8}
                  strokeDasharray="4 2"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==================================================
          4. MAIN 2-COLUMN SECTION:
          LEFT: WHY THIS RISK? (Explainability) & EVIDENCE
          RIGHT: RISK CONFIDENCE & BREAKDOWN
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: WHY THIS RISK? (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#0b1324] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-amber-950/80 border border-amber-600/80 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Why This Risk? (AI Explainability)
                </h3>
                <span className="text-xs font-mono font-bold text-rose-400">
                  Primary Detected Threat: Stuck Pipe / High Torque
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              Confidence Factor: High
            </span>
          </div>

          {/* Rationale Bullet Points (Exact Prompt Requirements) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans block">
              Multi-Source Reasoning:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-200"><strong>3 similar offset wells</strong> within 6.5 km radius.</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-200"><strong>Same/similar formation</strong> (Formation X / Barail member).</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-200"><strong>Comparable depth interval</strong> (5,025 m to 5,060 m MD).</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-200"><strong>Historical torque increase</strong> (+72% above background).</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-start gap-2 sm:col-span-2">
                <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-slate-200"><strong>Previous stuck-pipe event</strong> with 38 hrs NPT during stationary survey.</span>
              </div>
            </div>
          </div>

          {/* Evidence Cards: Well A, Well B, Well C (Exact Prompt Requirements) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans block">
              Corroborating Historical Offset Evidence:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Well A */}
              <div className="p-3 rounded-lg bg-[#070c17] border border-amber-800/60 hover:border-cyan-400 transition-all space-y-1.5 shadow-sm group">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-sans text-xs">Well A</strong>
                  <span className="text-amber-300 font-mono font-bold text-xs">5,040 m</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <p className="text-rose-400 font-semibold">Mud Loss (78 bbl/hr)</p>
                  <p className="text-slate-400 text-[10px]">Formation X · 3.0 km offset</p>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenDoc('DDR-2021-WELL-A-042')}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="h-3 w-3" />
                    <span>DDR-042</span>
                  </button>
                  <Link
                    href="/wells/WELL-A"
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>

              {/* Well B */}
              <div className="p-3 rounded-lg bg-[#070c17] border border-amber-800/60 hover:border-cyan-400 transition-all space-y-1.5 shadow-sm group">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-sans text-xs">Well B</strong>
                  <span className="text-amber-300 font-mono font-bold text-xs">5,060 m</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <p className="text-rose-400 font-semibold">High Torque (38 kNm)</p>
                  <p className="text-slate-400 text-[10px]">Formation X · 4.7 km offset</p>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenDoc('DDR-2022-WELL-B-118')}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="h-3 w-3" />
                    <span>DDR-118</span>
                  </button>
                  <Link
                    href="/wells/WELL-B"
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>

              {/* Well C */}
              <div className="p-3 rounded-lg bg-[#070c17] border border-rose-800/80 hover:border-cyan-400 transition-all space-y-1.5 shadow-sm group bg-rose-950/20">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-sans text-xs">Well C</strong>
                  <span className="text-rose-400 font-mono font-bold text-xs">5,025 m</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <p className="text-rose-400 font-semibold">Stuck Pipe (38h NPT)</p>
                  <p className="text-slate-400 text-[10px]">Formation X · 6.2 km offset</p>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenDoc('WCR-2019-WELL-C-076')}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="h-3 w-3" />
                    <span>WCR-076</span>
                  </button>
                  <Link
                    href="/wells/WELL-C"
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: RISK CONFIDENCE & BREAKDOWN (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-[#0b1324] border border-slate-800 p-5 space-y-4 shadow-xl">
          {/* Header */}
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
              Multi-Factor Confidence Assessment
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-base font-bold text-white font-sans">Prototype Risk Score</h3>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-rose-400">82</span>
                <span className="text-sm text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Exact Required Disclaimer */}
            <p className="text-[10px] text-amber-300/90 font-mono italic mt-1 leading-snug">
              “Prototype risk score based on simulated historical patterns.”
            </p>
            <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
              Not a clinically or statistically validated probability.
            </span>
          </div>

          {/* Breakdown Bars (Exact Prompt Requirements: 35%, 25%, 20%, 20%) */}
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Historical event frequency</span>
                <strong className="text-white">35%</strong>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Formation similarity</span>
                <strong className="text-white">25%</strong>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Depth similarity</span>
                <strong className="text-white">20%</strong>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Parameter similarity</span>
                <strong className="text-white">20%</strong>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          {/* Actions & Export */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2 text-xs">
            <button
              onClick={handleCopyRiskBrief}
              className="flex-1 py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copiedSummary ? 'Copied Brief!' : 'Copy Risk Brief'}</span>
            </button>

            <button
              onClick={handleDownloadExecutiveReport}
              className="flex-1 py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================
          5. RECOMMENDATION (ENGINEER REVIEW) & 6. RISK TIMELINE
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RECOMMENDATION: ENGINEER REVIEW (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-gradient-to-br from-[#0c1930] via-[#091124] to-[#070c18] border border-cyan-800/90 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-cyan-950 border border-cyan-600 text-cyan-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  ENGINEER REVIEW
                </h3>
                <span className="text-[10px] text-cyan-300 font-mono">
                  Advisory Protocol for 5,030–5,070 m Interval Entry
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              Interactive Checklist
            </span>
          </div>

          {/* Exact Prompt Required Rationale */}
          <div className="p-3.5 rounded-lg bg-cyan-950/30 border-l-4 border-cyan-400 text-xs text-slate-200">
            <p className="font-sans font-medium text-white leading-relaxed">
              Historical evidence suggests that the upcoming interval deserves additional review.
            </p>
          </div>

          {/* Recommended Review Checklist (Prompt Requirements) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans block">
              Recommended Pre-Interval Review Protocol:
            </span>

            <div className="space-y-2">
              {reviewChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                    item.checked
                      ? 'bg-blue-950/40 border-cyan-500/70 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.checked ? (
                      <CheckSquare className="h-4 w-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <span className={item.checked ? 'font-medium' : ''}>{item.text}</span>
                  </div>
                  {item.critical && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                      Required
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exact Required Footer */}
          <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed font-sans pt-2">
            <strong>COMPLIANCE NOTICE:</strong> “This system provides decision support. Final operational decisions remain with the drilling engineer.”
          </div>
        </div>

        {/* 6. RISK TIMELINE (5 cols) - Exact Prompt Requirements */}
        <div className="lg:col-span-5 rounded-xl bg-[#0b1324] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Depth Risk Horizon Timeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Trajectory corridor stepping toward the historical hazard zone.
            </p>
          </div>

          {/* Visually Compelling Depth Timeline Stepper */}
          <div className="relative pl-6 border-l-2 border-slate-800 ml-2 space-y-6 my-2 text-xs">
            {/* Step 1: Current Depth ↓ 4,980 m */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-cyan-400 border-2 border-white shadow-md shadow-cyan-400/80" />
              <div className="p-3 rounded-lg bg-[#070c17] border border-cyan-800/80 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-cyan-400 uppercase font-sans font-bold">1. Current Depth</span>
                  <strong className="text-white text-sm">4,980 m</strong>
                </div>
                <p className="text-[11px] text-slate-300">
                  Normal drilling parameters in Formation X member. Margin tightening.
                </p>
              </div>
            </div>

            {/* Step 2: Warning Zone ↓ 5,010 m */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-slate-900" />
              <div className="p-3 rounded-lg bg-[#070c17] border border-amber-800/80 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-amber-400 uppercase font-sans font-bold">2. Warning Zone</span>
                  <strong className="text-amber-300 text-sm">5,010 m</strong>
                </div>
                <p className="text-[11px] text-slate-300">
                  30 m to entry. Prepare coarse LCM on surface and verify drillstring vibration.
                </p>
              </div>
            </div>

            {/* Step 3: Historical Event Cluster ↓ 5,025–5,070 m */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/80 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-rose-400 uppercase font-sans font-bold">3. Historical Event Cluster</span>
                  <strong className="text-rose-300 text-sm">5,025–5,070 m</strong>
                </div>
                <p className="text-[11px] text-slate-200">
                  Concentration of 3 historical offset incidents: Well C (5,025m), Well A (5,040m), Well B (5,060m).
                </p>
              </div>
            </div>

            {/* Step 4: Critical Interval ↓ 5,030–5,070 m */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-rose-600 border-2 border-white shadow-md shadow-rose-600/80" />
              <div className="p-3 rounded-lg bg-[#070c17] border border-rose-700 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-rose-400 uppercase font-sans font-bold">4. Critical Interval</span>
                  <strong className="text-rose-300 text-sm">5,030–5,070 m</strong>
                </div>
                <p className="text-[11px] text-slate-300">
                  Narrow drilling window. Enforce strict 3-min stationary limit & continuous rotation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Interactive Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        documentIdOrName={selectedDoc}
      />

      {/* Depth Scrubber Modal */}
      <SimulationDepthModal
        isOpen={isDepthModalOpen}
        onClose={() => setIsDepthModalOpen(false)}
        currentDepth={currentDepth}
        onUpdateDepth={(d) => setCurrentDepth(d)}
      />
    </div>
  );
}
