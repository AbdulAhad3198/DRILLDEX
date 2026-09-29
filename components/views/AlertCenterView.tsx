'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Info, 
  Eye, 
  Check, 
  X, 
  SlidersHorizontal,
  Flame,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  Bell,
  RefreshCw,
  Copy,
  ChevronDown
} from 'lucide-react';
import { OFFSET_WELLS } from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';

export interface AlertRecord {
  id: string;
  severity: 'High Priority' | 'Medium Priority' | 'Low Priority';
  title: string;
  riskType: 
    | 'Historical Risk' 
    | 'Formation Change' 
    | 'Torque Spike' 
    | 'Mud Loss Pattern' 
    | 'Stuck Pipe Risk' 
    | 'Pressure Anomaly' 
    | 'Cementing Risk' 
    | 'System/Data Alert';
  currentDepth: string;
  depthNum: number;
  riskInterval: string;
  affectedWell: string;
  formation: string;
  evidenceCount: number;
  reason: string;
  timestamp: string;
  isoTime: string;
  status: 'New' | 'Acknowledged' | 'Under Review' | 'Resolved';
  evidenceDetails: {
    wellName: string;
    distanceKm: number;
    depth: number;
    event: string;
    sourceDoc: string;
    mitigation: string;
  }[];
}

const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: 'ALT-1001',
    severity: 'High Priority',
    title: 'Potential Stuck Pipe Risk',
    riskType: 'Stuck Pipe Risk',
    currentDepth: '5,035 m',
    depthNum: 5035,
    riskInterval: '5,030–5,070 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X',
    evidenceCount: 3,
    reason: 'Comparable formation and historical torque/stuck-pipe events within the upcoming interval.',
    timestamp: '12 mins ago (12:45 PM)',
    isoTime: '2026-09-28 12:45',
    status: 'New',
    evidenceDetails: [
      {
        wellName: 'Well C',
        distanceKm: 2.8,
        depth: 5025,
        event: 'Differential Stuck Pipe',
        sourceDoc: 'WCR-WELL-C-076',
        mitigation: '50 bbl surfactant soak & 180 klbf upward jarring. Maintain <3 min stationary limit.',
      },
      {
        wellName: 'Well B',
        distanceKm: 4.2,
        depth: 5060,
        event: 'High Torque & Keyseat Sticking',
        sourceDoc: 'WCR-WELL-B-2020-011',
        mitigation: 'Conditioned mud YP < 20 lb/100ft², added 2% liquid lubricant beads.',
      },
      {
        wellName: 'Well A',
        distanceKm: 3.0,
        depth: 5040,
        event: 'Severe Mud Loss & Tight Hole',
        sourceDoc: 'DDR-WELL-A-2021-042',
        mitigation: '40 bbl coarse cellulosic LCM pill (35 ppb) & flow throttle to 420 gpm.',
      },
    ],
  },
  {
    id: 'ALT-1002',
    severity: 'High Priority',
    title: 'Severe Mud Loss Pattern Detected',
    riskType: 'Mud Loss Pattern',
    currentDepth: '5,038 m',
    depthNum: 5038,
    riskInterval: '5,030–5,070 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X',
    evidenceCount: 2,
    reason: 'Entering micro-fractured sandstone member correlated with 78 bbl/hr fluid loss in Well A.',
    timestamp: '28 mins ago (12:29 PM)',
    isoTime: '2026-09-28 12:29',
    status: 'New',
    evidenceDetails: [
      {
        wellName: 'Well A',
        distanceKm: 3.0,
        depth: 5040,
        event: 'Severe Lost Circulation',
        sourceDoc: 'DDR-WELL-A-2021-042',
        mitigation: 'Hesitation squeeze with 40 bbl LCM pill over 4.5 hours.',
      },
      {
        wellName: 'Well B',
        distanceKm: 4.7,
        depth: 5015,
        event: 'Partial Losses (45 bbl/hr)',
        sourceDoc: 'DDR-WELL-B-2020-118',
        mitigation: '30 bbl calcium carbonate blend & raised mud weight to 1.22 SG.',
      },
    ],
  },
  {
    id: 'ALT-1003',
    severity: 'High Priority',
    title: 'Rotary Torque Spike Anomaly',
    riskType: 'Torque Spike',
    currentDepth: '5,042 m',
    depthNum: 5042,
    riskInterval: '5,035–5,065 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X',
    evidenceCount: 2,
    reason: 'Real-time torque rose from 18.5 kNm to 34.2 kNm (+84%) matching Well B top-drive stalling profile.',
    timestamp: '45 mins ago (12:12 PM)',
    isoTime: '2026-09-28 12:12',
    status: 'Under Review',
    evidenceDetails: [
      {
        wellName: 'Well B',
        distanceKm: 4.2,
        depth: 5060,
        event: 'Top Drive Stall / 38 kNm Torque',
        sourceDoc: 'WCR-WELL-B-2020-011',
        mitigation: 'Capped ROP < 6 m/hr and circulated 30 bbl weighted lubricant sweep.',
      },
    ],
  },
  {
    id: 'ALT-1004',
    severity: 'Medium Priority',
    title: 'Formation Lithology Transition Alert',
    riskType: 'Formation Change',
    currentDepth: '4,980 m',
    depthNum: 4980,
    riskInterval: '4,975–5,010 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X (Barail Sand)',
    evidenceCount: 4,
    reason: 'Drilling rate increase indicates boundary transition from dense claystone into permeable sand member.',
    timestamp: '1.5 hrs ago (11:42 AM)',
    isoTime: '2026-09-28 11:42',
    status: 'Acknowledged',
    evidenceDetails: [
      {
        wellName: 'Well A',
        distanceKm: 3.0,
        depth: 4980,
        event: 'Lithology Top Marker',
        sourceDoc: 'DDR-WELL-A-2021-042',
        mitigation: 'Sampled cuttings every 2m; confirmed pore pressure gradient 1.34 SG.',
      },
    ],
  },
  {
    id: 'ALT-1005',
    severity: 'Medium Priority',
    title: 'Standpipe Pressure Differential Anomaly',
    riskType: 'Pressure Anomaly',
    currentDepth: '5,040 m',
    depthNum: 5040,
    riskInterval: '5,035–5,055 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X',
    evidenceCount: 1,
    reason: 'SPP dropped 350 psi across active bit, indicating thief zone intake or nozzle washout.',
    timestamp: '2 hours ago (11:00 AM)',
    isoTime: '2026-09-28 11:00',
    status: 'Under Review',
    evidenceDetails: [
      {
        wellName: 'Well A',
        distanceKm: 3.0,
        depth: 5040,
        event: 'SPP Drop / Loss',
        sourceDoc: 'DDR-WELL-A-2021-042',
        mitigation: 'Checked pit volume; confirmed 40 bbl active fluid loss.',
      },
    ],
  },
  {
    id: 'ALT-1006',
    severity: 'Medium Priority',
    title: 'Historical Geomechanical Overburden Risk',
    riskType: 'Historical Risk',
    currentDepth: '4,950 m',
    depthNum: 4950,
    riskInterval: '4,940–5,100 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X',
    evidenceCount: 5,
    reason: 'Vector search correlates 5 historical NPT records across 4 offset wells in this fault block.',
    timestamp: '3 hours ago (10:30 AM)',
    isoTime: '2026-09-28 10:30',
    status: 'Resolved',
    evidenceDetails: [
      {
        wellName: 'Well D',
        distanceKm: 5.1,
        depth: 4950,
        event: 'Fault Crossing Slip',
        sourceDoc: 'DDR-WELL-D-2022-015',
        mitigation: 'Reduced WOB and controlled ROP.',
      },
    ],
  },
  {
    id: 'ALT-1007',
    severity: 'Medium Priority',
    title: 'Intermediate Casing Seat / Cementing Integrity Alert',
    riskType: 'Cementing Risk',
    currentDepth: '4,680 m',
    depthNum: 4680,
    riskInterval: '4,670–4,700 m',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation W',
    evidenceCount: 2,
    reason: 'Historical gas channeling behind 7" liner logged in Well E at 4,890 m due to short slurry transit time.',
    timestamp: '5 hours ago (08:15 AM)',
    isoTime: '2026-09-28 08:15',
    status: 'Resolved',
    evidenceDetails: [
      {
        wellName: 'Well E',
        distanceKm: 6.8,
        depth: 4890,
        event: 'Gas Channeling Post-Cementing',
        sourceDoc: 'WCR-WELL-E-2018-092',
        mitigation: 'Squeeze cemented perfs with micro-fine expanding cement.',
      },
    ],
  },
  {
    id: 'ALT-1008',
    severity: 'Low Priority',
    title: 'eRTMAC Sensor Telemetry Heartbeat Sync',
    riskType: 'System/Data Alert',
    currentDepth: '4,980 m',
    depthNum: 4980,
    riskInterval: 'Continuous',
    affectedWell: 'WELL-NWIS-01',
    formation: 'Formation X',
    evidenceCount: 0,
    reason: 'Telemetry stream synced via WITSML 1.4.1 protocol with 100 ms packet latency.',
    timestamp: '6 hours ago (07:00 AM)',
    isoTime: '2026-09-28 07:00',
    status: 'Resolved',
    evidenceDetails: [],
  },
];

export function AlertCenterView() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(INITIAL_ALERTS);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [selectedDocForModal, setSelectedDocForModal] = useState<string | null>(null);
  const [eventDetailForModal, setEventDetailForModal] = useState<any | null>(null);

  // Status handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a))
    );
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
  };

  const handleUnderReviewAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Under Review' } : a))
    );
  };

  // Metrics
  const activeNewCount = useMemo(() => alerts.filter((a) => a.status === 'New').length, [alerts]);
  const highPriorityCount = useMemo(() => alerts.filter((a) => a.severity === 'High Priority' && a.status !== 'Resolved').length, [alerts]);
  const acknowledgedCount = useMemo(() => alerts.filter((a) => a.status === 'Acknowledged').length, [alerts]);
  const resolvedCount = useMemo(() => alerts.filter((a) => a.status === 'Resolved').length, [alerts]);

  // Filtered Alert History Table
  const filteredHistory = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedStatusFilter !== 'All' && a.status !== selectedStatusFilter) return false;
      if (selectedSeverityFilter !== 'All' && a.severity !== selectedSeverityFilter) return false;
      if (selectedTypeFilter !== 'All' && a.riskType !== selectedTypeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          a.id.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.riskType.toLowerCase().includes(q) ||
          a.affectedWell.toLowerCase().includes(q) ||
          a.formation.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, selectedStatusFilter, selectedSeverityFilter, selectedTypeFilter, searchQuery]);

  // Active High Priority Cards
  const activeCards = useMemo(() => {
    return alerts.filter((a) => a.status !== 'Resolved');
  }, [alerts]);

  const handleOpenDocModal = (docName: string) => {
    setSelectedDocForModal(docName);
  };

  const handleOpenEventModal = (item: any) => {
    setEventDetailForModal({
      wellName: item.wellName,
      distanceKm: item.distanceKm,
      formation: 'Formation X',
      event: item.event,
      depth: item.depth,
      sourceDoc: item.sourceDoc,
      relevancePct: 95,
      mitigationApplied: item.mitigation,
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Global Risk Alert Center
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                  REAL-TIME DECISION SUPPORT
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Geomechanical risk advisories, historical hazard correlations, and operational notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 font-bold flex items-center gap-1.5 animate-pulse">
            <Bell className="h-3.5 w-3.5" />
            <span>{activeNewCount} Active New Alerts</span>
          </div>
        </div>
      </div>

      {/* Decision Support Compliance Notice */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-xs font-mono text-amber-200">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>OPERATIONAL DECISION-SUPPORT NOTICE:</strong> All notifications serve as decision-support recommendations for drilling engineer review. This system does not exercise automatic physical operational control. Final operational decisions remain strictly with the drilling engineer on site.
        </p>
      </div>

      {/* 2. METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans">Active New Alerts</span>
          <p className="text-xl font-black text-rose-400 mt-1">{activeNewCount}</p>
          <span className="text-[10px] text-rose-300">Requires Review</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans">High Priority Risks</span>
          <p className="text-xl font-black text-amber-400 mt-1">{highPriorityCount}</p>
          <span className="text-[10px] text-amber-300">Hazard Corridor</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans">Acknowledged</span>
          <p className="text-xl font-black text-cyan-400 mt-1">{acknowledgedCount}</p>
          <span className="text-[10px] text-slate-400">In Drilling Plan</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-sans">Resolved / Past</span>
          <p className="text-xl font-black text-emerald-400 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-300">Cleared Intervals</span>
        </div>
      </div>

      {/* 3. THE 8 ALERT TYPES TAXONOMY CATEGORY CARDS */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Risk Alert Taxonomy & Categories
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">8 Classification Engines</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
          {[
            { type: 'Historical Risk', count: 5, color: 'text-cyan-400 border-cyan-800/80 bg-cyan-950/20' },
            { type: 'Formation Change', count: 2, color: 'text-purple-400 border-purple-800/80 bg-purple-950/20' },
            { type: 'Torque Spike', count: 3, color: 'text-amber-400 border-amber-800/80 bg-amber-950/20' },
            { type: 'Mud Loss Pattern', count: 4, color: 'text-rose-400 border-rose-800/80 bg-rose-950/20' },
            { type: 'Stuck Pipe Risk', count: 3, color: 'text-red-400 border-red-800/80 bg-red-950/20' },
            { type: 'Pressure Anomaly', count: 2, color: 'text-blue-400 border-blue-800/80 bg-blue-950/20' },
            { type: 'Cementing Risk', count: 1, color: 'text-amber-400 border-amber-800/80 bg-amber-950/20' },
            { type: 'System/Data Alert', count: 1, color: 'text-emerald-400 border-emerald-800/80 bg-emerald-950/20' },
          ].map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTypeFilter(selectedTypeFilter === cat.type ? 'All' : cat.type)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                selectedTypeFilter === cat.type
                  ? 'bg-blue-600 border-blue-400 text-white font-bold ring-1 ring-cyan-400'
                  : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[9px] text-slate-400 block truncate">{cat.type}</span>
              <strong className={`text-xs block font-bold ${cat.color.split(' ')[0]}`}>{cat.count} Events</strong>
            </button>
          ))}
        </div>
      </div>

      {/* 4. ACTIVE ALERT CARDS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Geomechanical Risk Advisories
            </h2>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold">
              {activeCards.length} Active
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Sorted by severity & bit proximity
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activeCards.map((card) => {
            const isHigh = card.severity === 'High Priority';
            const isNew = card.status === 'New';

            return (
              <div
                key={card.id}
                className={`rounded-2xl border bg-[#091122] p-5 shadow-xl transition-all space-y-4 ${
                  isHigh
                    ? 'border-rose-800/90 shadow-rose-950/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Alert Card Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
                        isHigh
                          ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border-amber-700'
                      }`}>
                        {card.severity}
                      </span>

                      <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                        {card.title}
                      </h3>

                      <span className="text-[11px] font-mono text-slate-400">
                        ({card.id} · {card.timestamp})
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {card.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                      isNew
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : card.status === 'Acknowledged'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Affected Well:</span>
                    <strong className="text-white text-xs">{card.affectedWell}</strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Current Depth:</span>
                    <strong className="text-cyan-300 text-xs">{card.currentDepth}</strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Risk Interval:</span>
                    <strong className="text-rose-400 text-xs">{card.riskInterval}</strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Formation:</span>
                    <strong className="text-purple-300 text-xs">{card.formation}</strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Evidence Base:</span>
                    <strong className="text-amber-300 text-xs">{card.evidenceCount} offset wells</strong>
                  </div>
                </div>

                {/* Evidence Details Preview Strip (When available) */}
                {card.evidenceDetails.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800 space-y-2 font-mono text-xs">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                      Correlated Offset Evidence Precedents:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {card.evidenceDetails.map((ev, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <strong className="text-white">{ev.wellName} ({ev.distanceKm} km)</strong>
                            <span className="text-rose-400 font-bold">{ev.depth} m</span>
                          </div>
                          <p className="text-[10px] text-slate-300 font-sans line-clamp-1">{ev.event}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px]">
                            <button
                              onClick={() => handleOpenDocModal(ev.sourceDoc)}
                              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{ev.sourceDoc}</span>
                              <ExternalLink className="h-2 w-2" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Action Buttons: Review Evidence, View Well, Dismiss, Acknowledge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 font-mono">
                  <span className="text-[11px] text-slate-400">
                    Recommended Action: Keep LCM staged on suction pit & enforce &lt;3 min stationary time.
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        if (card.evidenceDetails.length > 0) {
                          handleOpenEventModal(card.evidenceDetails[0]);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Review Evidence</span>
                    </button>

                    <Link
                      href={`/wells/${card.affectedWell}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>View Well</span>
                    </Link>

                    {isNew && (
                      <button
                        onClick={() => handleAcknowledgeAlert(card.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDismissAlert(card.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 hover:border-rose-800 border border-slate-800 text-slate-400 hover:text-rose-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. FILTERABLE ALERT HISTORY TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Filterable Alert History & Audit Trail
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              ({filteredHistory.length} logs)
            </span>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts or reasons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#070c18] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#070c18] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#070c18] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Severities</option>
              <option value="High Priority">High Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Low Priority">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Table: Time, Well, Risk, Depth, Severity, Status */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-[#070c18]/80 uppercase">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Well</th>
                <th className="py-2.5 px-3">Risk Type</th>
                <th className="py-2.5 px-3">Depth</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.isoTime}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{row.affectedWell}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">{row.title}</td>
                  <td className="py-2.5 px-3 text-slate-200">{row.currentDepth}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.severity === 'High Priority'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.status === 'New'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : row.status === 'Acknowledged'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : row.status === 'Under Review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {row.status === 'New' && (
                        <button
                          onClick={() => handleAcknowledgeAlert(row.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissAlert(row.id)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
