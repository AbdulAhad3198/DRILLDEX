'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  WellDossier, 
  TimelineEventItem, 
  ParameterDepthPoint, 
  FormationLayer 
} from '@/lib/wellDossiers';
import { 
  ActiveWellState, 
  INITIAL_ACTIVE_WELL, 
  OFFSET_WELLS 
} from '@/lib/data';
import { AuthGuard } from '@/components/auth/AuthGuard';

import {
  ResponsiveContainer,
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
  FileText,
  Compass,
  Layers,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Bot,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Download,
  Flame,
  Gauge,
  SlidersHorizontal,
  GitCompare,
  Sparkles,
  Info,
  Calendar,
  Building2,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { SimulationDepthModal } from '@/components/modals/SimulationDepthModal';

interface WellDossierViewProps {
  dossier: WellDossier;
}

export function WellDossierView({ dossier }: WellDossierViewProps) {
  // Tabs: Overview | Drilling Timeline | Events | Parameters | Formation | Documents | Lessons Learned
  const [activeTab, setActiveTab] = useState<
    'overview' | 'timeline' | 'events' | 'parameters' | 'formation' | 'documents' | 'lessons'
  >('overview');

  // Selected event for detail drawer / modal
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventItem>(
    dossier.timeline.find(t => t.type === 'MUD LOSS' || t.category === 'incident') || dossier.timeline[2] || dossier.timeline[0]
  );

  // Parameter Chart Toggles
  const [showTorque, setShowTorque] = useState(true);
  const [showROP, setShowROP] = useState(true);
  const [showWOB, setShowWOB] = useState(true);
  const [showSPP, setShowSPP] = useState(true);

  // Modals
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
  const [isSimilarEventsOpen, setIsSimilarEventsOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Current active drilling well reference (WELL-NWIS-01 @ 4,980m)
  const activeWell = INITIAL_ACTIVE_WELL;
  const depthDiff = Math.abs(activeWell.parameters.depth - (selectedEvent?.depth || dossier.timeline[2]?.depth || 5040));

  const handleDownloadDossier = () => {
    const text = `=======================================================
DRILLDEX | eRTMAC-NWIS DIGITAL WELL DOSSIER
=======================================================
Well Name: ${dossier.name} (${dossier.code})
Status: ${dossier.status}
Operator: ${dossier.operator} | Rig: ${dossier.rigName}
Field: ${dossier.field} | Basin: ${dossier.basin}
Location: ${dossier.lat}°N, ${dossier.lng}°E
Distance to Active Well (${activeWell.name}): ${dossier.distanceKm} km (Bearing ${dossier.bearing})
Total Depth: ${dossier.totalDepth} m | Formation: ${dossier.formation}
Similarity Score: ${dossier.similarityScore}% (Geographic: ${dossier.similarityBreakdown.geographic}%, Formation: ${dossier.similarityBreakdown.formation}%, Depth: ${dossier.similarityBreakdown.depth}%, Parameter: ${dossier.similarityBreakdown.parameter}%)
Risk Category: ${dossier.riskHistory}
Total NPT: ${dossier.nptHours} hrs (${dossier.nptPercentage})

CASING PROGRAM:
${dossier.casingProgram.map(c => `- ${c.stringName} (${c.casingSize}) set @ ${c.shoeDepth} m (MW: ${c.mudWeight}, Cement: ${c.cementTop})`).join('\n')}

DRILLING TIMELINE:
${dossier.timeline.map(t => `[${t.depth} m | ${t.date}] ${t.title}: ${t.description}`).join('\n')}

AI HISTORICAL LESSONS LEARNED:
"${dossier.lessonsLearned.historicalLesson}"
Evidence Source: ${dossier.lessonsLearned.evidenceDoc} (Page ${dossier.lessonsLearned.evidencePage})

LEGAL / COMPLIANCE NOTICE:
Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.
=======================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dossier.name}_Digital_Well_Dossier.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#060a14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black pb-16">
      {/* 1. TOP BREADCRUMB & CONTEXT NAVIGATION */}
      <div className="bg-[#080d19] border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <Link 
            href="/nearby-wells" 
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-sans font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Nearby Wells</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold">{dossier.name}</span>
          <span className="text-slate-500 text-[11px]">({dossier.code})</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-sans">
            DIGITAL WELL DOSSIER
          </span>
        </div>

        {/* Quick Offset Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0b1325] px-2.5 py-1 rounded border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">Active Well:</span>
            <strong className="text-white font-bold">{activeWell.name}</strong>
            <span className="text-cyan-400">({activeWell.parameters.depth} m)</span>
          </div>

          <button
            onClick={handleDownloadDossier}
            className="px-2.5 py-1 rounded bg-[#0b1325] hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            title="Download complete well dossier text file"
          >
            <Download className="h-3 w-3 text-cyan-400" />
            <span className="font-semibold text-[11px]">Export Dossier</span>
          </button>
        </div>
      </div>

      {/* 2. DOSSIER HEADER (Matching Prompt Exact Specification) */}
      <div className="bg-gradient-to-b from-[#091122] via-[#070d1a] to-[#060a14] border-b border-slate-800 px-4 md:px-6 py-5 shadow-lg">
        <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Title & Well Identification */}
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-950/40 shrink-0">
              <div className="h-full w-full bg-[#080d19] rounded-[10px] flex items-center justify-center">
                <Flame className="h-7 w-7 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide font-sans">
                  {dossier.name}
                </h1>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#0b1428] border border-cyan-800/80 text-cyan-300">
                  {dossier.code}
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                  dossier.riskHistory === 'CRITICAL' || dossier.riskHistory === 'SIGNIFICANT'
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : dossier.riskHistory === 'MODERATE'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  Risk History: {dossier.riskHistory}
                </span>
              </div>
              <p className="text-xs text-cyan-400/90 font-medium tracking-wide mt-1 flex items-center gap-2">
                <span>{dossier.subtitle}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono">{dossier.operator}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono">{dossier.status}</span>
              </p>
            </div>
          </div>

          {/* Right: Key Header Metric Pills (Distance, Formation, TD, Similarity) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            {/* Distance from Active Well */}
            <div className="p-2.5 rounded-lg bg-[#0b1324] border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Distance from Active Well:</span>
              <strong className="text-cyan-400 font-bold text-sm mt-0.5">
                {dossier.distanceKm.toFixed(1)} km
              </strong>
              <span className="text-[10px] text-slate-500 font-sans">Bearing {dossier.bearing}</span>
            </div>

            {/* Formation */}
            <div className="p-2.5 rounded-lg bg-[#0b1324] border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Formation:</span>
              <strong className="text-white font-bold text-sm mt-0.5 truncate">
                {dossier.formation}
              </strong>
              <span className="text-[10px] text-slate-500 font-sans truncate">{dossier.lithology.slice(0, 20)}...</span>
            </div>

            {/* Total Depth */}
            <div className="p-2.5 rounded-lg bg-[#0b1324] border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Total Depth:</span>
              <strong className="text-amber-300 font-bold text-sm mt-0.5">
                {dossier.totalDepth.toLocaleString()} m
              </strong>
              <span className="text-[10px] text-slate-500 font-sans">Duration {dossier.drillingDuration}</span>
            </div>

            {/* Similarity */}
            <div className="p-2.5 rounded-lg bg-[#0b1324] border border-cyan-800/80 flex flex-col bg-cyan-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-300 uppercase font-sans font-bold">Similarity:</span>
                <span className="text-[9px] font-mono text-slate-400">Score</span>
              </div>
              <strong className="text-cyan-400 font-bold text-sm mt-0.5">
                {dossier.similarityScore}%
              </strong>
              <span className="text-[9px] text-slate-400 font-sans italic">Prototype similarity score</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION BAR */}
      <div className="sticky top-0 z-20 bg-[#080d19]/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-6">
        <div className="max-w-[1720px] mx-auto flex overflow-x-auto no-scrollbar gap-1 py-1.5 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'timeline', label: 'Drilling Timeline', icon: Clock },
            { id: 'events', label: 'Events & Hazards', icon: AlertTriangle, badge: dossier.timeline.filter(t => t.category === 'incident').length },
            { id: 'parameters', label: 'Parameter Curves', icon: Activity },
            { id: 'formation', label: 'Formation & Strata', icon: Layers },
            { id: 'documents', label: 'Archival Documents', icon: FileText, badge: dossier.documents.length },
            { id: 'lessons', label: 'Lessons Learned', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white text-blue-700 font-bold' : 'bg-rose-600 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN TAB CONTENT AREA */}
      <main className="max-w-[1720px] mx-auto p-4 md:p-6 space-y-6">

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Cards: Technical Specifications & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Card */}
              <div className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                  <MapPin className="h-4 w-4" />
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
                    Well Location & Operator
                  </h3>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Coordinates:</span>
                    <strong className="text-slate-200">{dossier.lat.toFixed(4)}°N, {dossier.lng.toFixed(4)}°E</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Field:</span>
                    <strong className="text-white">{dossier.field}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Block:</span>
                    <span className="text-slate-300">{dossier.block}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Basin:</span>
                    <span className="text-slate-300">{dossier.basin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Operator:</span>
                    <strong className="text-cyan-300">{dossier.operator}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Drilling Rig:</span>
                    <span className="text-slate-300">{dossier.rigName}</span>
                  </div>
                </div>
              </div>

              {/* Well Type & Durations */}
              <div className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
                    Operational Metrics & NPT
                  </h3>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Well Type:</span>
                    <strong className="text-white">Development Offset</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Spud Date:</span>
                    <span className="text-slate-200">{dossier.spudDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Completion Date:</span>
                    <span className="text-slate-200">{dossier.completedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Total Duration:</span>
                    <strong className="text-cyan-300">{dossier.drillingDuration}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Total Depth (TD):</span>
                    <strong className="text-amber-300">{dossier.totalDepth.toLocaleString()} m</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400 font-sans">Historical NPT:</span>
                    <strong className="text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800">
                      {dossier.nptHours} hrs ({dossier.nptPercentage})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Historical Risk Events Quick Card */}
              <div className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
                      Logged Incident Summary
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Formation X</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/60">
                    <div className="flex items-center justify-between">
                      <strong className="text-rose-300 font-mono text-xs">
                        {dossier.timeline.find(t => t.category === 'incident')?.title || 'MUD LOSS'}
                      </strong>
                      <span className="font-mono text-amber-300 font-bold text-xs">
                        @ {dossier.timeline.find(t => t.category === 'incident')?.depth || 5040} m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      {dossier.timeline.find(t => t.category === 'incident')?.description.slice(0, 110)}...
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Event Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="text-amber-400 hover:text-amber-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <GitCompare className="h-3 w-3" />
                      <span>Compare vs Active Well</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Casing Program Table */}
            <div className="rounded-xl bg-[#0b1324] border border-slate-800 overflow-hidden shadow-lg">
              <div className="px-4 py-3 bg-[#091122] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                    Casing Program Architecture
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {dossier.casingProgram.length} Casing Strings Engineered
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#070c17] text-[10px] text-slate-400 uppercase font-sans border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">String Name</th>
                      <th className="py-2 px-2.5">Hole Size</th>
                      <th className="py-2 px-2.5">Casing Size</th>
                      <th className="py-2 px-2.5">Shoe Depth (m)</th>
                      <th className="py-2 px-2.5">Mud Weight</th>
                      <th className="py-2 px-2.5">Cement Top</th>
                      <th className="py-2 px-3 font-sans">Engineering Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {dossier.casingProgram.map((casing, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-bold text-white font-sans">{casing.stringName}</td>
                        <td className="py-2 px-2.5 text-cyan-300">{casing.holeSize}</td>
                        <td className="py-2 px-2.5 text-slate-200">{casing.casingSize}</td>
                        <td className="py-2 px-2.5 text-amber-300 font-bold">{casing.shoeDepth.toLocaleString()} m</td>
                        <td className="py-2 px-2.5 text-slate-300">{casing.mudWeight}</td>
                        <td className="py-2 px-2.5 text-slate-400">{casing.cementTop}</td>
                        <td className="py-2 px-3 text-slate-300 font-sans text-[11px]">{casing.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mud Program Table */}
            <div className="rounded-xl bg-[#0b1324] border border-slate-800 overflow-hidden shadow-lg">
              <div className="px-4 py-3 bg-[#091122] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                    Drilling Fluid (Mud) Program
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  HPWBM / Rheology Control Records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#070c17] text-[10px] text-slate-400 uppercase font-sans border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Interval Depth</th>
                      <th className="py-2 px-2.5">Mud System Type</th>
                      <th className="py-2 px-2.5">Density Range</th>
                      <th className="py-2 px-2.5">PV / YP Rheology</th>
                      <th className="py-2 px-2.5">pH / Fluid Loss</th>
                      <th className="py-2 px-3 font-sans">Target Operational Objective</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {dossier.mudProgram.map((mud, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-bold text-amber-300">{mud.interval}</td>
                        <td className="py-2 px-2.5 text-cyan-300 font-sans">{mud.mudType}</td>
                        <td className="py-2 px-2.5 text-slate-200">{mud.densityRange}</td>
                        <td className="py-2 px-2.5 text-slate-300">{mud.pvYp}</td>
                        <td className="py-2 px-2.5 text-slate-400">{mud.phFilterCake}</td>
                        <td className="py-2 px-3 text-slate-300 font-sans text-[11px]">{mud.targetObjective}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DRILLING TIMELINE ================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-[#0b1324] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider font-sans">
                  Depth-Stratigraphic Drilling Timeline
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Click any timeline node to inspect historical event details and mitigation logs
              </span>
            </div>

            {/* Vertical Depth Timeline */}
            <div className="relative pl-6 md:pl-8 border-l-2 border-slate-800 ml-4 md:ml-6 space-y-6 my-6">
              {dossier.timeline.map((event, idx) => {
                const isSelected = selectedEvent.id === event.id;
                const isCritical = event.category === 'incident';

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setActiveTab('events');
                    }}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-950/40 border-cyan-400 shadow-lg shadow-cyan-950/30'
                        : isCritical
                        ? 'bg-rose-950/20 border-rose-800/80 hover:border-rose-600'
                        : 'bg-[#0b1324] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Node Dot on vertical rail */}
                    <div className={`absolute -left-[31px] md:-left-[39px] top-5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isCritical
                        ? 'bg-rose-600 border-white shadow-lg shadow-rose-600/60 animate-pulse'
                        : isSelected
                        ? 'bg-cyan-400 border-white'
                        : 'bg-slate-900 border-slate-700'
                    }`}>
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>

                    {/* Timeline Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#070c17] border border-cyan-800 text-cyan-300">
                          {event.depth.toLocaleString()} m
                        </span>
                        <h4 className="font-bold text-white text-sm font-sans">{event.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-slate-400">{event.date}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Incident Mitigation Callout if applicable */}
                    {event.mitigation && (
                      <div className="mt-3 p-2.5 rounded bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-300 font-mono text-[11px] uppercase block">Applied Mitigation:</strong>
                          <span className="text-slate-300">{event.mitigation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: EVENTS & EVENT DETAIL ================= */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
            {/* Left Rail: List of Events (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Historical Events Register ({dossier.timeline.length})</span>
              </h3>

              <div className="space-y-2">
                {dossier.timeline.map((evt) => {
                  const isSelected = selectedEvent.id === evt.id;
                  const isIncident = evt.category === 'incident';

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/60 border-cyan-400 shadow-md'
                          : isIncident
                          ? 'bg-rose-950/20 border-rose-800/80 hover:bg-rose-950/30'
                          : 'bg-[#0b1324] border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-300 font-bold text-xs">{evt.depth.toLocaleString()} m</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isIncident ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {evt.severity || 'Nominal'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">{evt.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{evt.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Detailed Inspection Dossier Card (7 cols) - Exact Prompt Requirements */}
            <div className="lg:col-span-7">
              <div className="rounded-xl bg-[#0b1324] border border-cyan-900/80 p-5 space-y-4 shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                      Historical Event Detail
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5 tracking-wide">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
                    selectedEvent.severity === 'Critical' || selectedEvent.severity === 'High'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    {selectedEvent.severity || 'High'} Severity
                  </span>
                </div>

                {/* Specs Grid: Depth, Formation, Severity */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Event Depth</span>
                    <strong className="text-cyan-400 text-sm">{selectedEvent.depth.toLocaleString()} m</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Formation</span>
                    <strong className="text-white text-xs truncate block">{dossier.formation}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Logged Date</span>
                    <strong className="text-slate-300 text-xs">{selectedEvent.date}</strong>
                  </div>
                </div>

                {/* Cause */}
                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Cause:</span>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {selectedEvent.cause || 'Prototype historical classification: Sub-hydrostatic depleted sandstone member penetration with fracture opening.'}
                  </p>
                </div>

                {/* Impact */}
                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Operational Impact:</span>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {selectedEvent.impact || 'Lost circulation (78 bbl/hr) / operational delay / 26 hrs Non-Productive Time (NPT).'}
                  </p>
                </div>

                {/* Mitigation */}
                <div className="p-3 rounded-lg bg-[#070c17] border border-emerald-900/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold uppercase">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Historical Mitigation Extracted from Source:</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans mt-1">
                    {selectedEvent.mitigation || 'Historical mitigation extracted from source report: Spotted 40 bbl coarse LCM pill (calcium carbonate + nutplug + mica) with 4.5h hesitation squeeze. Total circulation regained.'}
                  </p>
                </div>

                {/* Source Reference Document */}
                <div className="p-3 rounded-lg bg-[#070c17] border border-cyan-900/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Source Report:</span>
                    <strong className="text-cyan-300 font-mono">{selectedEvent.sourceDoc || 'DDR-2021-WELL-A-042'}</strong>
                    {selectedEvent.sourceDocPage && (
                      <span className="text-slate-500 font-mono ml-2">(Page {selectedEvent.sourceDocPage})</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDocName(selectedEvent.sourceDoc || 'DDR-2021-WELL-A-042')}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Source Document</span>
                  </button>
                </div>

                {/* Action Buttons (Prompt Requirement: View Source | View Similar Events | Compare with Current Well) */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setSelectedDocName(selectedEvent.sourceDoc || 'DDR-2021-WELL-A-042')}
                    className="py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>View Source</span>
                  </button>

                  <button
                    onClick={() => setIsSimilarEventsOpen(true)}
                    className="py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>View Similar Events</span>
                  </button>

                  <button
                    onClick={() => setIsCompareModalOpen(true)}
                    className="py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                    <span>Compare vs Current Well</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PARAMETER CHART ================= */}
        {activeTab === 'parameters' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Parameter Chart Controls & Toggles */}
            <div className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Depth vs Telemetry Parameter Curves ({dossier.name})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recharts drilling telemetry curves across 4,700 m to 5,300 m interval.
                </p>
              </div>

              {/* Toggles (Allow selecting/deselecting parameters - Prompt Requirement) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setShowTorque(!showTorque)}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showTorque
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${showTorque ? 'bg-rose-500' : 'bg-slate-600'}`} />
                  <span>Torque (kNm)</span>
                </button>

                <button
                  onClick={() => setShowROP(!showROP)}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showROP
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${showROP ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>ROP (m/hr)</span>
                </button>

                <button
                  onClick={() => setShowWOB(!showWOB)}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showWOB
                      ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${showWOB ? 'bg-blue-400' : 'bg-slate-600'}`} />
                  <span>WOB (klbf)</span>
                </button>

                <button
                  onClick={() => setShowSPP(!showSPP)}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showSPP
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${showSPP ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span>SPP (psi)</span>
                </button>
              </div>
            </div>

            {/* Recharts Curve Visualization */}
            <div className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 shadow-xl h-[440px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dossier.parameters}
                  margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                >
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
                      fontFamily: 'monospace'
                    }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a101f',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

                  {/* Highlight Critical Hazard Zone (5,020 - 5,080 m) */}
                  <ReferenceArea
                    x1={5020}
                    x2={5080}
                    fill="#f43f5e"
                    fillOpacity={0.12}
                    label={{
                      value: 'CRITICAL HAZARD ZONE (5,020 - 5,080 m)',
                      position: 'top',
                      fill: '#fda4af',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                    }}
                  />

                  {/* Critical Event Depth Marker */}
                  <ReferenceLine
                    x={5040}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: '5,040 m (Mud Loss Event)',
                      position: 'insideTopRight',
                      fill: '#fca5a5',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  />

                  {/* Active Well Reference Depth Marker */}
                  <ReferenceLine
                    x={4980}
                    stroke="#38bdf8"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    label={{
                      value: 'Current Active Well @ 4,980 m',
                      position: 'insideTopLeft',
                      fill: '#7dd3fc',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  />

                  {showTorque && (
                    <Line
                      type="monotone"
                      dataKey="torque"
                      name="Torque (kNm)"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  )}

                  {showROP && (
                    <Line
                      type="monotone"
                      dataKey="rop"
                      name="ROP (m/hr)"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  )}

                  {showWOB && (
                    <Line
                      type="monotone"
                      dataKey="wob"
                      name="WOB (klbf)"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  )}

                  {showSPP && (
                    <Line
                      type="monotone"
                      dataKey="spp"
                      name="SPP (psi)"
                      stroke="#fbbf24"
                      strokeWidth={1.8}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ================= TAB 5: FORMATION & STRATA ================= */}
        {activeTab === 'formation' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-[#0b1324] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider font-sans">
                  Stratigraphic Geomechanics & Reservoir Characteristics
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Formation X Depletion Evaluation
              </span>
            </div>

            <div className="space-y-3.5">
              {dossier.formations.map((layer, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-cyan-500" />
                      <h4 className="font-bold text-white text-sm font-sans">{layer.formation}</h4>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold text-xs">
                      {layer.topDepth.toLocaleString()} m – {layer.bottomDepth.toLocaleString()} m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Lithology</span>
                      <strong className="text-white text-xs">{layer.lithology}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Pore Pressure (PP)</span>
                      <strong className="text-amber-300 text-xs">{layer.porePressureEquivalent}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Fracture Gradient (FG)</span>
                      <strong className="text-rose-300 text-xs">{layer.fractureGradient}</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Permeability</span>
                      <strong className="text-cyan-300 text-xs">{layer.permeability}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300">
                    <strong className="text-slate-400 font-mono text-[10px] uppercase block">Drilling Characteristics & Hazards:</strong>
                    <p className="mt-0.5 leading-snug">{layer.drillingCharacteristics}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: DOCUMENTS ================= */}
        {activeTab === 'documents' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-[#0b1324] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider font-sans">
                  Archival Well Reports & OCR OCR Extracts
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Click any report to launch the interactive OCR PDF document viewer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dossier.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-[#0b1324] border border-slate-800 hover:border-cyan-800/80 transition-all space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm font-sans">{doc.title}</h4>
                        <span className="font-mono text-cyan-400 text-xs">{doc.name}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                      {doc.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Official operational report logged by rig supervisors and mud engineers. Contains complete telemetry stamps, lost circulation treatments, and final casing tallies.
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">{doc.date}</span>
                    <button
                      onClick={() => setSelectedDocName(doc.name)}
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Open in Viewer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: LESSONS LEARNED ================= */}
        {activeTab === 'lessons' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Primary AI Knowledge Card (Exact Prompt Specification) */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1830] via-[#091122] to-[#070c18] border border-cyan-800/90 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-cyan-950 border border-cyan-600/80 text-cyan-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base font-sans">
                      AI Knowledge Card: Historical Lessons Learned
                    </h3>
                    {/* Exact Prompt Requirement Badge */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                        AI-assisted summary
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Source-backed information only
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDocName(dossier.lessonsLearned.evidenceDoc)}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Evidence: {dossier.lessonsLearned.evidenceDoc}</span>
                </button>
              </div>

              {/* Exact Quotation Callout */}
              <div className="p-4 rounded-lg bg-cyan-950/30 border-l-4 border-cyan-400 text-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider block">
                  Core Historical Synthesis:
                </span>
                <p className="text-sm md:text-base font-sans font-medium text-white italic">
                  “{dossier.lessonsLearned.historicalLesson}”
                </p>
                <span className="text-[11px] font-mono text-slate-400 block pt-1">
                  Evidence Citation: {dossier.lessonsLearned.evidenceDoc} (Page {dossier.lessonsLearned.evidencePage})
                </span>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
                  Key Operational Takeaways for Current Well (WELL-NWIS-01)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {dossier.lessonsLearned.keyTakeaways.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Playbook */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
                  Mitigation Action Playbook
                </h4>
                <div className="space-y-2">
                  {dossier.lessonsLearned.mitigationPlaybook.map((play, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#070c17] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <strong className="text-white block font-sans">{play.action}</strong>
                        <span className="text-[11px] text-slate-400">{play.protocol}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase self-start sm:self-auto shrink-0 border ${
                        play.result === 'Worked'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : play.result === 'Partially Worked'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-rose-950 text-rose-300 border-rose-700'
                      }`}>
                        {play.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Decision-Support Compliance Footer */}
              <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed font-sans">
                <strong>ENGINEER REVIEW NOTICE:</strong> Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDocName)}
        onClose={() => setSelectedDocName(null)}
        documentIdOrName={selectedDocName}
      />

      {/* MODAL 2: Similar Events Across Other Offset Wells */}
      {isSimilarEventsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-xl bg-[#080d19] border border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Similar Historical Events Across Field</h3>
              </div>
              <button
                onClick={() => setIsSimilarEventsOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <div className="flex justify-between font-mono">
                  <strong className="text-white">Well A (3.0 km)</strong>
                  <span className="text-rose-400 font-bold">5,040 m · Mud Loss</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  78 bbl/hr lost circulation. Regained with 40 bbl coarse LCM pill and 4.5h hesitation squeeze.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <div className="flex justify-between font-mono">
                  <strong className="text-white">Well B (4.7 km)</strong>
                  <span className="text-amber-400 font-bold">5,060 m · High Torque</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  Torque surged to 38 kNm with top drive stalls. Mitigated with lubricant beads & ROP cap.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <div className="flex justify-between font-mono">
                  <strong className="text-white">Well C (6.2 km)</strong>
                  <span className="text-rose-400 font-bold">5,025 m · Stuck Pipe</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">
                  Differential sticking after 22 min stationary connection. Freed with surfactant soak & jar.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSimilarEventsOpen(false)}
              className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Compare with Active Well */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-xl bg-[#080d19] border border-cyan-800/80 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  Comparative Analysis: {activeWell.name} vs {dossier.name}
                </h3>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              {/* Active Well */}
              <div className="p-3.5 rounded-lg bg-[#0b1325] border border-cyan-800/80 space-y-2">
                <span className="text-[10px] text-cyan-400 uppercase font-sans font-bold block">
                  Active Well: {activeWell.name}
                </span>
                <p><span className="text-slate-400 font-sans">Current Depth:</span> <strong className="text-white">{activeWell.parameters.depth} m</strong></p>
                <p><span className="text-slate-400 font-sans">Formation:</span> <strong className="text-white">{activeWell.currentFormation}</strong></p>
                <p><span className="text-slate-400 font-sans">Torque:</span> <strong className="text-amber-300">{activeWell.parameters.torque} kNm</strong></p>
                <p><span className="text-slate-400 font-sans">ROP:</span> <strong className="text-emerald-300">{activeWell.parameters.rop} m/hr</strong></p>
                <p><span className="text-slate-400 font-sans">Mud Weight:</span> <strong className="text-cyan-300">{activeWell.parameters.mudWeight} SG</strong></p>
              </div>

              {/* Offset Well */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 uppercase font-sans font-bold block">
                  Historical Offset: {dossier.name}
                </span>
                <p><span className="text-slate-400 font-sans">Critical Depth:</span> <strong className="text-rose-400">5,040 m (In 60 m!)</strong></p>
                <p><span className="text-slate-400 font-sans">Formation:</span> <strong className="text-white">{dossier.formation}</strong></p>
                <p><span className="text-slate-400 font-sans">Event Torque:</span> <strong className="text-rose-400">32.5 kNm</strong></p>
                <p><span className="text-slate-400 font-sans">Event Mud Weight:</span> <strong className="text-slate-300">1.22 SG</strong></p>
                <p><span className="text-slate-400 font-sans">Outcome:</span> <strong className="text-rose-400">Lost Circulation (78 bbl/hr)</strong></p>
              </div>
            </div>

            <div className="p-3 rounded bg-amber-950/30 border border-amber-800/60 text-xs text-amber-300">
              <strong>OPERATIONAL TAKEAWAY:</strong> Active well is currently at 4,980 m, only 60 m above the critical depth (5,040 m) where {dossier.name} encountered total mud loss. Recommended action: Pre-treat with 15 ppb calcium carbonate and test LCM lines before drilling ahead.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href="/alerts"
                className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Go to Active Risk Alert</span>
              </Link>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
