'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Gauge, 
  RotateCw, 
  Droplet, 
  Flame, 
  Sliders, 
  Play, 
  Pause,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Compass,
  FileText,
  Info,
  Layers,
  FastForward,
  RotateCcw,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Legend
} from 'recharts';
import { ActiveWellState, INITIAL_ACTIVE_WELL, OFFSET_WELLS } from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';

interface LiveMonitoringViewProps {
  activeWell?: ActiveWellState;
  currentDepth?: number;
  onOpenDepthSimulator?: () => void;
  onUpdateDepth?: (newDepth: number) => void;
}

// Historical telemetry points for Recharts visualization (Depth-based from 4,800 to 5,150 m)
const BASE_TELEMETRY_SERIES = [
  { depth: 4800, torque: 14.2, rop: 18.5, wob: 22.0, spp: 3100, riskZone: false },
  { depth: 4850, torque: 15.1, rop: 18.2, wob: 22.5, spp: 3120, riskZone: false },
  { depth: 4900, torque: 16.0, rop: 17.8, wob: 23.0, spp: 3150, riskZone: false },
  { depth: 4940, torque: 17.4, rop: 16.5, wob: 23.8, spp: 3180, riskZone: false },
  { depth: 4980, torque: 18.5, rop: 15.4, wob: 24.0, spp: 3240, riskZone: false }, // Normal baseline
  { depth: 5000, torque: 21.0, rop: 13.8, wob: 25.0, spp: 3290, riskZone: false }, // Warning approach
  { depth: 5020, torque: 25.5, rop: 11.2, wob: 26.2, spp: 3340, riskZone: false },
  { depth: 5030, torque: 29.8, rop: 8.4, wob: 27.5, spp: 3180, riskZone: true },  // Risk zone start (losses begin)
  { depth: 5040, torque: 34.2, rop: 6.2, wob: 28.0, spp: 2890, riskZone: true },  // Well A mud loss peak (-350 psi SPP)
  { depth: 5050, torque: 36.8, rop: 5.5, wob: 28.5, spp: 2940, riskZone: true },
  { depth: 5060, torque: 38.5, rop: 4.8, wob: 29.0, spp: 2990, riskZone: true },  // Well B torque spike peak
  { depth: 5070, torque: 31.0, rop: 7.2, wob: 26.0, spp: 3080, riskZone: true },  // Risk zone end
  { depth: 5090, torque: 22.4, rop: 11.5, wob: 24.5, spp: 3160, riskZone: false },
  { depth: 5120, torque: 18.2, rop: 14.8, wob: 23.0, spp: 3200, riskZone: false },
  { depth: 5150, torque: 16.5, rop: 16.0, wob: 22.5, spp: 3220, riskZone: false },
];

export function LiveMonitoringView({
  activeWell = INITIAL_ACTIVE_WELL,
  currentDepth: propDepth,
  onOpenDepthSimulator,
  onUpdateDepth,
}: LiveMonitoringViewProps) {
  // Depth State (defaults to 4,980 m per specification demo sequence step 1)
  const [depth, setDepth] = useState<number>(propDepth || 4980);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [streamActive, setStreamActive] = useState<boolean>(true);
  const [clockTick, setClockTick] = useState<number>(0);

  // Modals & Panels State
  const [evidencePanelOpen, setEvidencePanelOpen] = useState<boolean>(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<string | null>(null);
  const [eventDetailForModal, setEventDetailForModal] = useState<any | null>(null);
  const [activeTabChart, setActiveTabChart] = useState<'all' | 'torque' | 'rop' | 'pressure'>('all');

  // Engineer Review Checklist
  const [checklist, setChecklist] = useState([
    { id: '1', text: 'Verify 40 bbl coarse cellulosic LCM pill is staged on active suction pit (Well A precedent)', checked: true },
    { id: '2', text: 'Enforce strict 3-minute stationary drillstring limit during MWD survey (Well C precedent)', checked: true },
    { id: '3', text: 'Condition mud with 2% lubricant beads; cap rotary speed < 90 RPM upon torque chatter', checked: false },
    { id: '4', text: 'Throttle circulation from 620 gpm to 420 gpm if pit level shows negative gradient', checked: false },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  // Continuous realistic telemetry fluctuation tick
  useEffect(() => {
    if (!streamActive) return;
    const interval = setInterval(() => {
      setClockTick(t => t + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [streamActive]);

  // Automated Depth Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;
    const stepInterval = 1000 / simSpeed;
    const interval = setInterval(() => {
      setDepth(prev => {
        if (prev >= 5120) {
          setIsSimulating(false);
          return 5120;
        }
        const next = prev + 2;
        if (onUpdateDepth) onUpdateDepth(next);
        return next;
      });
    }, stepInterval);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, onUpdateDepth]);

  // Sync external depth prop during render per React guidelines
  const [prevPropDepth, setPrevPropDepth] = useState(propDepth);
  if (propDepth !== undefined && propDepth !== prevPropDepth) {
    setPrevPropDepth(propDepth);
    if (!isSimulating) {
      setDepth(propDepth);
    }
  }

  // Progressively calculated Risk State based on exact Depth thresholds
  // < 5000: NORMAL OPERATION
  // ~5000 to 5029: HISTORICAL RISK ZONE APPROACHING
  // 5030 to 5039: POTENTIAL RISK AHEAD
  // 5040 to 5065: STRONGER ALERT STATE (CRITICAL HAZARD CLUSTER)
  // > 5070: RECOVERING / NORMALIZED
  const riskStatus = useMemo(() => {
    if (depth < 5000) {
      return {
        level: 'NORMAL',
        title: 'NORMAL OPERATION',
        subtext: 'Drilling parameters stable. Offset well records indicate benign formation transition.',
        badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
        cardBorder: 'border-slate-800',
        alertColor: 'text-emerald-400',
      };
    } else if (depth >= 5000 && depth < 5030) {
      return {
        level: 'WARNING',
        title: 'HISTORICAL RISK ZONE APPROACHING',
        subtext: `Target interval 5,030–5,070 m is ${5030 - depth} m ahead. Offset wells logged major mud loss and torque oscillations.`,
        badgeColor: 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse',
        cardBorder: 'border-amber-700/80',
        alertColor: 'text-amber-400',
      };
    } else if (depth >= 5030 && depth < 5040) {
      return {
        level: 'ALERT',
        title: 'POTENTIAL RISK AHEAD — ENTERING CRITICAL INTERVAL',
        subtext: 'Current depth inside 5,030–5,070 m hazard corridor. Precedent in Well A (5,040 m) and Well C (5,025 m).',
        badgeColor: 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse',
        cardBorder: 'border-rose-600',
        alertColor: 'text-rose-400',
      };
    } else if (depth >= 5040 && depth <= 5065) {
      return {
        level: 'CRITICAL',
        title: 'POTENTIAL HIGH-TORQUE / STUCK-PIPE / MUD LOSS INTERVAL',
        subtext: 'CRITICAL HAZARD ZONE: 3 offset wells experienced severe operational downtime at this exact depth range in Formation X.',
        badgeColor: 'bg-red-950 text-red-200 border-red-600 animate-ping',
        cardBorder: 'border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500',
        alertColor: 'text-red-400',
      };
    } else {
      return {
        level: 'EVALUATION',
        title: 'POST-CRITICAL RECOVERY INTERVAL',
        subtext: 'Past major fractured thief zone (5,070 m). Monitor annular pressure for stable circulation.',
        badgeColor: 'bg-blue-950 text-cyan-300 border-cyan-800',
        cardBorder: 'border-cyan-800/80',
        alertColor: 'text-cyan-400',
      };
    }
  }, [depth]);

  // Small realistic fluctuations
  const jitter1 = Math.sin(clockTick * 0.8) * 0.15;
  const jitter2 = Math.cos(clockTick * 1.1) * 0.2;
  const isInsideSevereHazard = depth >= 5030 && depth <= 5070;

  // Real-time parameters calculated dynamically
  const currentParams = useMemo(() => {
    let baseTorque = 18.5;
    let baseRop = 16.2;
    let baseWob = 24.0;
    let baseSpp = 3240;
    let baseFlow = 620;
    let baseMudWeight = 1.18;
    let baseEcd = 1.24;
    let baseRpm = 118;

    if (depth < 5000) {
      baseTorque = 17.5 + (depth - 4800) * 0.005;
      baseRop = 17.2 - (depth - 4800) * 0.008;
    } else if (depth >= 5000 && depth < 5030) {
      baseTorque = 21.0 + (depth - 5000) * 0.28;
      baseRop = 13.5 - (depth - 5000) * 0.15;
      baseWob = 25.5;
    } else if (depth >= 5030 && depth <= 5070) {
      // Hazardous interval: high torque, suppressed ROP, lost circulation SPP drop
      baseTorque = 34.5 + Math.sin(clockTick) * 3.5;
      baseRop = 4.8 + Math.cos(clockTick) * 0.6;
      baseWob = 28.2 + jitter2;
      baseSpp = 2880 + Math.sin(clockTick * 2) * 45; // SPP loss drop
      baseFlow = 450;
      baseMudWeight = 1.22;
      baseEcd = 1.28;
      baseRpm = 85;
    } else {
      baseTorque = 22.0;
      baseRop = 12.0;
      baseSpp = 3180;
    }

    return {
      depth,
      rop: parseFloat((baseRop + jitter1).toFixed(1)),
      wob: parseFloat((baseWob + jitter2).toFixed(1)),
      torque: parseFloat((baseTorque + jitter1 * 2).toFixed(1)),
      rpm: Math.round(baseRpm),
      spp: Math.round(baseSpp + jitter2 * 20),
      flowRate: Math.round(baseFlow),
      mudWeight: parseFloat(baseMudWeight.toFixed(2)),
      ecd: parseFloat(baseEcd.toFixed(2)),
    };
  }, [depth, clockTick, jitter1, jitter2]);

  // Demo sequence jumper
  const handleJumpToDepth = (target: number) => {
    setDepth(target);
    if (onUpdateDepth) onUpdateDepth(target);
    if (target >= 5030) {
      setEvidencePanelOpen(true);
    }
  };

  const handleOpenDocModal = (docName: string) => {
    setSelectedDocForModal(docName);
  };

  const handleOpenEventModal = (wellName: string, eventName: string, depthVal: number, doc: string) => {
    setEventDetailForModal({
      wellName,
      distanceKm: wellName.includes('A') ? 3.0 : wellName.includes('B') ? 4.7 : 6.2,
      formation: 'Formation X',
      event: eventName,
      depth: depthVal,
      sourceDoc: doc,
      relevancePct: 94,
      mitigationApplied: 'Spotted 40 bbl coarse cellulosic LCM pill (35 ppb) & reduced flow to 420 gpm',
    });
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">
      {/* 1. HEADER */}
      <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <div className="h-full w-full bg-[#070c18] rounded-[10px] flex items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold text-white tracking-wide font-mono">
                  LIVE DRILLING MONITOR
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  eRTMAC STREAM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Active Telemetry Ingestion · Formation X · Upper Assam Basin
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Well:</span>
              <strong className="text-white font-bold">WELL-NWIS-01</strong>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                CONNECTED
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800/80 flex items-center gap-2 text-cyan-300">
              <span className="text-[11px] text-slate-400">Stream:</span>
              <span className="font-bold">SIMULATED eRTMAC DATA</span>
            </div>

            <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
        </div>

        {/* Prototype WebSocket abstraction notice */}
        <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/50 flex items-start gap-2.5 text-[11px] font-mono text-cyan-200">
          <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>FRONTEND PROTOTYPE SPECIFICATION:</strong> This screen implements a simulated WebSocket abstraction layer (<code>/ws/v1/telemetry-stream</code>). It demonstrates real-time parameter streaming and risk corridor triggering without physical connection to active rig telemetry.
          </p>
        </div>
      </div>

      {/* 2. DEMO INTERACTION CONTROL BAR & 9-STEP SEQUENCE NAVIGATOR */}
      <div className="rounded-2xl border border-cyan-800/80 bg-gradient-to-r from-[#09152a] to-[#070e1d] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 font-mono">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Depth Simulation & Risk Corridor Controls
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isSimulating
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isSimulating ? 'PAUSE DRILLING' : 'START DRILLING SIMULATION'}</span>
            </button>

            <button
              onClick={() => handleJumpToDepth(4980)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset to 4,980 m (Normal Baseline)"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset 4,980 m</span>
            </button>
          </div>
        </div>

        {/* Interactive Depth Slider */}
        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Current Depth: <strong className="text-cyan-300 text-sm font-bold">{depth} m</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Hazard Zone:</span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                5,030 m – 5,070 m
              </span>
            </div>
            <span className="text-slate-400">Simulation Limit: 5,200 m</span>
          </div>

          <input
            type="range"
            min={4500}
            max={5200}
            step={5}
            value={depth}
            onChange={(e) => handleJumpToDepth(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>4,500 m</span>
            <span className="text-emerald-400">4,980 m (Demo Step 1)</span>
            <span className="text-amber-400 font-bold">5,000 m (Approach)</span>
            <span className="text-rose-400 font-bold">5,035 m (Corridor)</span>
            <span className="text-red-400 font-bold">5,050 m (Loss/Torque Peak)</span>
            <span>5,200 m</span>
          </div>
        </div>

        {/* 9-Step Guided Walkthrough Chips */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5 font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Guided 9-Step Scenario Walkthrough:
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => handleJumpToDepth(4980)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                depth === 4980 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              1. 4,980 m (Normal)
            </button>
            <button
              onClick={() => handleJumpToDepth(5000)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                depth === 5000 ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              2. 5,000 m (Approach)
            </button>
            <button
              onClick={() => handleJumpToDepth(5030)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                depth === 5030 ? 'bg-rose-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              3. 5,030 m (Risk Ahead)
            </button>
            <button
              onClick={() => handleJumpToDepth(5035)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                depth === 5035 ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              4. 5,035 m (Alert Triggered)
            </button>
            <button
              onClick={() => handleJumpToDepth(5050)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                depth === 5050 ? 'bg-red-700 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              5. 5,050 m (Loss/Torque Peak)
            </button>
            <button
              onClick={() => handleJumpToDepth(5085)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                depth === 5085 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              6. 5,085 m (Circulation Restored)
            </button>
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME PARAMETERS (9 Channels with Dynamic Fluctuations) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {/* 1. Depth */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">Depth</span>
          <div className="my-1">
            <span className="text-base lg:text-lg font-black font-mono text-white">
              {currentParams.depth.toLocaleString()}
            </span>
            <span className="text-[10px] text-cyan-400 ml-1">m</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">TVD: {(currentParams.depth * 0.985).toFixed(0)} m</span>
        </div>

        {/* 2. ROP */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">ROP</span>
          <div className="my-1">
            <span className={`text-base lg:text-lg font-black font-mono ${
              currentParams.rop < 8 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentParams.rop}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">m/hr</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Rate of Penetration</span>
        </div>

        {/* 3. WOB */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">WOB</span>
          <div className="my-1">
            <span className="text-base lg:text-lg font-black font-mono text-cyan-300">
              {currentParams.wob}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">klbf</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Weight on Bit</span>
        </div>

        {/* 4. Torque */}
        <div className={`p-3 rounded-xl bg-[#091122] border flex flex-col justify-between transition-colors ${
          currentParams.torque > 30 ? 'border-red-600 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400">Torque</span>
            {currentParams.torque > 30 && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
          </div>
          <div className="my-1">
            <span className={`text-base lg:text-lg font-black font-mono ${
              currentParams.torque > 30 ? 'text-red-400 animate-pulse' : 'text-amber-300'
            }`}>
              {currentParams.torque}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">kNm</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Rotary Torque</span>
        </div>

        {/* 5. RPM */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">RPM</span>
          <div className="my-1">
            <span className="text-base lg:text-lg font-black font-mono text-white">
              {currentParams.rpm}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">rev/min</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Rotary Speed</span>
        </div>

        {/* 6. SPP */}
        <div className={`p-3 rounded-xl bg-[#091122] border flex flex-col justify-between transition-colors ${
          currentParams.spp < 3000 ? 'border-amber-600 bg-amber-950/20' : 'border-slate-800'
        }`}>
          <span className="text-[10px] uppercase font-mono text-slate-400">SPP</span>
          <div className="my-1">
            <span className={`text-base lg:text-lg font-black font-mono ${
              currentParams.spp < 3000 ? 'text-amber-400' : 'text-cyan-300'
            }`}>
              {currentParams.spp}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">psi</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Standpipe Press.</span>
        </div>

        {/* 7. Flow Rate */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">Flow Rate</span>
          <div className="my-1">
            <span className="text-base lg:text-lg font-black font-mono text-blue-300">
              {currentParams.flowRate}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">gpm</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Circulation Flow</span>
        </div>

        {/* 8. Mud Weight */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">Mud Weight</span>
          <div className="my-1">
            <span className="text-base lg:text-lg font-black font-mono text-purple-300">
              {currentParams.mudWeight}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">SG</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Active Pit Density</span>
        </div>

        {/* 9. ECD */}
        <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">ECD</span>
          <div className="my-1">
            <span className="text-base lg:text-lg font-black font-mono text-indigo-300">
              {currentParams.ecd}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">SG</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Equiv. Circ. Density</span>
        </div>
      </div>

      {/* 4. PROGRESSIVE RISK TRIGGER & ALERT PANEL */}
      <div className={`rounded-2xl border bg-[#091122] p-5 shadow-2xl transition-all duration-300 ${riskStatus.cardBorder}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black border ${riskStatus.badgeColor}`}>
                {riskStatus.title}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Current Depth: <strong className="text-white">{depth} m</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
              {riskStatus.subtext}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEvidencePanelOpen(!evidencePanelOpen)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{evidencePanelOpen ? 'Hide Evidence' : 'View Evidence'}</span>
            </button>

            <Link
              href="/nearby-wells"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>View Similar Wells</span>
            </Link>
          </div>
        </div>

        {/* Detailed Alert Card when inside risk zone (5,030–5,070 m) */}
        {depth >= 5030 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 font-mono">
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-rose-800/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>POTENTIAL HIGH-TORQUE / STUCK-PIPE INTERVAL</span>
                </span>
                <span className="text-slate-400 text-[10px]">Formation: <strong className="text-purple-300">Formation X</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Current Depth:</span>
                  <strong className="text-white text-xs">{depth} m</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Historical Evidence:</span>
                  <strong className="text-cyan-300 text-xs">3 offset wells</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Comparable Interval:</span>
                  <strong className="text-rose-400 text-xs">5,025–5,070 m</strong>
                </div>
              </div>

              {/* Action Buttons inside Alert */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400">
                  Correlated incidents: Well A (5,040 m), Well B (5,060 m), Well C (5,025 m)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEventModal('Well A', 'Mud Loss', 5040, 'DDR-WELL-A-042')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] cursor-pointer"
                  >
                    View Evidence
                  </button>
                  <Link
                    href="/nearby-wells"
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px]"
                  >
                    View Similar Wells
                  </Link>
                  <button
                    onClick={() => setEvidencePanelOpen(true)}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Review Recommendation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Evidence & Recommendations Panel */}
        {evidencePanelOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 font-mono text-xs">
              {/* Evidence 1: Well A */}
              <div className="p-3 rounded-lg bg-[#060b17] border border-rose-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold">Well A (3.0 km offset)</strong>
                  <span className="text-rose-400 text-[10px] font-bold">5,040 m</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-snug">
                  Experienced severe lost circulation (78 bbl/hr) upon entering micro-fractured thief zone. Standpipe pressure dropped 350 psi.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                  <span className="text-emerald-400">40 bbl LCM pill soak</span>
                  <button
                    onClick={() => handleOpenDocModal('DDR-WELL-A-2021-042')}
                    className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>DDR-042</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>

              {/* Evidence 2: Well B */}
              <div className="p-3 rounded-lg bg-[#060b17] border border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold">Well B (4.7 km offset)</strong>
                  <span className="text-amber-400 text-[10px] font-bold">5,060 m</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-snug">
                  Torque surged from 14 to 38 kNm with frequent top-drive stalling due to reactive shale stringers.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                  <span className="text-emerald-400">YP &lt; 20 + lubricant beads</span>
                  <button
                    onClick={() => handleOpenDocModal('WCR-WELL-B-2020-011')}
                    className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>WCR-011</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>

              {/* Evidence 3: Well C */}
              <div className="p-3 rounded-lg bg-[#060b17] border border-rose-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold">Well C (6.2 km offset)</strong>
                  <span className="text-rose-400 text-[10px] font-bold">5,025 m</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-snug">
                  Differential sticking after 22-min stationary MWD survey over depleted sand. 36 hours NPT jarring.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                  <span className="text-emerald-400">&lt; 3 min stationary limit</span>
                  <button
                    onClick={() => handleOpenDocModal('WCR-WELL-C-2019-076')}
                    className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>WCR-076</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Engineer Review Mitigation Checklist */}
            <div className="p-4 rounded-xl bg-[#060a14] border border-emerald-800/60 space-y-2.5 font-mono text-xs">
              <span className="text-[11px] text-emerald-400 uppercase font-bold block flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Drilling Engineer Mitigation Review Checklist:</span>
              </span>
              <div className="space-y-1.5">
                {checklist.map(item => (
                  <label
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="mt-0.5 accent-emerald-500 rounded"
                    />
                    <span className={item.checked ? 'text-emerald-200' : 'text-slate-400'}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. CHARTS (Real-Time Scrolling Depth Profile with Hazard Overlay) */}
      <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Real-Time Parameter Profile & Historical Risk Zone Overlays
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setActiveTabChart('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTabChart === 'all' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              All Curves
            </button>
            <button
              onClick={() => setActiveTabChart('torque')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTabChart === 'torque' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Torque
            </button>
            <button
              onClick={() => setActiveTabChart('rop')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTabChart === 'rop' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              ROP
            </button>
            <button
              onClick={() => setActiveTabChart('pressure')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTabChart === 'pressure' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Pressure
            </button>
          </div>
        </div>

        {/* Recharts Multi-Curve Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={BASE_TELEMETRY_SERIES}
              margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="depth"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[4800, 5150]}
                unit=" m"
                label={{ value: 'Measured Depth (m)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 11 }}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Normalized Parameter Units', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 bg-[#060c18] border border-cyan-800 rounded-lg shadow-xl text-xs font-mono space-y-1">
                        <p className="font-bold text-white mb-1">Depth: {label} m</p>
                        {payload.map((p, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <span style={{ color: p.color }}>{p.name}:</span>
                            <span className="font-bold text-white">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

              {/* Critical Risk Zone Overlay (5,030 m – 5,070 m) */}
              <ReferenceArea
                x1={5030}
                x2={5070}
                stroke="#e11d48"
                strokeOpacity={0.6}
                strokeDasharray="4 4"
                fill="#e11d48"
                fillOpacity={0.15}
                label={{ value: 'HISTORICAL HAZARD CORRIDOR (5,030–5,070 m)', fill: '#fb7185', fontSize: 11, position: 'top' }}
              />

              {/* Current Depth Reference Line */}
              <ReferenceLine
                x={depth}
                stroke="#22d3ee"
                strokeWidth={2.5}
                label={{ value: `CURRENT: ${depth} m`, fill: '#22d3ee', fontSize: 11, position: 'insideTopLeft' }}
              />

              {/* Curves */}
              {(activeTabChart === 'all' || activeTabChart === 'torque') && (
                <Line
                  type="monotone"
                  dataKey="torque"
                  name="Torque (kNm)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              )}

              {(activeTabChart === 'all' || activeTabChart === 'rop') && (
                <Line
                  type="monotone"
                  dataKey="rop"
                  name="ROP (m/hr)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              )}

              {activeTabChart === 'all' && (
                <Line
                  type="monotone"
                  dataKey="wob"
                  name="WOB (klbf)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#38bdf8' }}
                />
              )}

              {(activeTabChart === 'all' || activeTabChart === 'pressure') && (
                <Line
                  type="monotone"
                  dataKey="spp"
                  name="SPP (psi / 100)"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#818cf8' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-rose-950 border border-rose-600" />
              <span>Hazard Overlay (5,030–5,070 m)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-cyan-400" />
              <span>Current Rig Position ({depth} m)</span>
            </span>
          </div>
          <span>Sampling Interval: 100 ms · Protocol: WITSML / eRTMAC Stream</span>
        </div>
      </div>

      {/* GLOBAL MODALS */}
      {selectedDocForModal && (
        <DocumentViewerModal
          documentIdOrName={selectedDocForModal}
          isOpen={!!selectedDocForModal}
          onClose={() => setSelectedDocForModal(null)}
        />
      )}

      {eventDetailForModal && (
        <EventDetailModal
          event={eventDetailForModal}
          isOpen={!!eventDetailForModal}
          onClose={() => setEventDetailForModal(null)}
          onOpenDoc={handleOpenDocModal}
        />
      )}
    </div>
  );
}
