'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Compass,
  Layers,
  Clock,
  Info,
  Check,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  Sliders,
  Eye
} from 'lucide-react';
import { ActiveWellState, INITIAL_ACTIVE_WELL, OFFSET_WELLS, OffsetWell } from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';

interface WellComparisonViewProps {
  activeWell?: ActiveWellState;
  onOpenDoc?: (docName: string) => void;
  onViewRiskAlert?: () => void;
}

export interface WellComparisonData {
  id: string;
  name: string;
  code: string;
  isActiveWell: boolean;
  distance: string;
  distanceKm: number;
  formation: string;
  totalDepth: string;
  drillingDuration: string;
  avgRop: string;
  avgTorque: string;
  avgWob: string;
  mudWeight: string;
  historicalEvents: string[];
  npt: string;
  nptHours: number;
  casingProgram: string;
  cementing: string;
  similarityScore: number;
  doc: string;
  incidentsByDepth: {
    depth: number;
    depthFormatted: string;
    type: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
}

const ALL_COMPARISON_WELLS: WellComparisonData[] = [
  {
    id: 'ACTIVE-01',
    name: 'WELL-NWIS-01',
    code: 'WELL-NWIS-01',
    isActiveWell: true,
    distance: '0.0 km (Active Rig)',
    distanceKm: 0.0,
    formation: 'Formation X',
    totalDepth: '5,500 m (Target)',
    drillingDuration: 'In Progress (Day 42)',
    avgRop: '18.4 m/hr',
    avgTorque: '31.8 kNm',
    avgWob: '24.0 klbf',
    mudWeight: '1.18 SG',
    historicalEvents: ['Approaching 5,030–5,070 m Corridor'],
    npt: '0.0 hrs',
    nptHours: 0,
    casingProgram: '9-5/8" 47# L-80 @ 4,680 m',
    cementing: 'Primary Class G slurry at 1.58 SG',
    similarityScore: 100,
    doc: 'Live eRTMAC Stream',
    incidentsByDepth: [
      {
        depth: 4980,
        depthFormatted: '4,980 m',
        type: 'Active Bit Depth',
        description: 'Current drilling position in Formation X sandstone',
        severity: 'Low',
      },
    ],
  },
  {
    id: 'WELL-A',
    name: 'WELL-A',
    code: 'OFFSET-A-042',
    isActiveWell: false,
    distance: '3.0 km NW',
    distanceKm: 3.0,
    formation: 'Formation X',
    totalDepth: '5,320 m',
    drillingDuration: '103 days',
    avgRop: '14.2 m/hr',
    avgTorque: '22.4 kNm',
    avgWob: '22.5 klbf',
    mudWeight: '1.22 SG (Raised from 1.18)',
    historicalEvents: ['Mud Loss @ 5,040 m', 'Lost Circulation', 'Tight Hole'],
    npt: '18.5 hrs',
    nptHours: 18.5,
    casingProgram: '9-5/8" 47# L-80 @ 4,720 m',
    cementing: 'Class G slurry + 40 bbl cellulosic LCM squeeze',
    similarityScore: 91,
    doc: 'DDR-WELL-A-2021-042',
    incidentsByDepth: [
      {
        depth: 5040,
        depthFormatted: '5,040 m',
        type: 'Mud Loss',
        description: '78 bbl/hr lost circulation zone requiring 40 bbl coarse LCM pill',
        severity: 'Critical',
      },
    ],
  },
  {
    id: 'WELL-B',
    name: 'WELL-B',
    code: 'OFFSET-B-118',
    isActiveWell: false,
    distance: '4.2 km NE',
    distanceKm: 4.2,
    formation: 'Formation X',
    totalDepth: '5,410 m',
    drillingDuration: '118 days',
    avgRop: '12.8 m/hr',
    avgTorque: '28.5 kNm',
    avgWob: '25.0 klbf',
    mudWeight: '1.19 SG',
    historicalEvents: ['Torque Spike @ 5,060 m', 'Packoff', 'Gas Influx @ 5,110 m'],
    npt: '14.0 hrs',
    nptHours: 14.0,
    casingProgram: '9-5/8" 47# L-80 @ 4,690 m',
    cementing: 'Class G slurry with liquid lubricant additive',
    similarityScore: 88,
    doc: 'WCR-WELL-B-2020-011',
    incidentsByDepth: [
      {
        depth: 5060,
        depthFormatted: '5,060 m',
        type: 'High Torque',
        description: 'Top drive stalling & 38 kNm torque spike due to reactive shale',
        severity: 'High',
      },
      {
        depth: 5110,
        depthFormatted: '5,110 m',
        type: 'Gas Influx',
        description: '18 bbl pit gain controlled via Wait & Weight method (1.34 SG kill mud)',
        severity: 'High',
      },
    ],
  },
  {
    id: 'WELL-C',
    name: 'WELL-C',
    code: 'OFFSET-C-076',
    isActiveWell: false,
    distance: '2.8 km SE',
    distanceKm: 2.8,
    formation: 'Formation X',
    totalDepth: '5,200 m',
    drillingDuration: '92 days',
    avgRop: '16.5 m/hr',
    avgTorque: '24.1 kNm',
    avgWob: '23.5 klbf',
    mudWeight: '1.25 SG',
    historicalEvents: ['Stuck Pipe @ 5,025 m', 'Differential Sticking'],
    npt: '36.0 hrs',
    nptHours: 36.0,
    casingProgram: '9-5/8" 47# L-80 @ 4,650 m',
    cementing: 'Class G slurry + block squeeze at 4,875 m',
    similarityScore: 94,
    doc: 'WCR-WELL-C-2019-076',
    incidentsByDepth: [
      {
        depth: 5025,
        depthFormatted: '5,025 m',
        type: 'Stuck Pipe',
        description: 'Differential sticking during 22-min MWD survey with 120 psi overbalance',
        severity: 'Critical',
      },
    ],
  },
];

export function WellComparisonView({
  activeWell = INITIAL_ACTIVE_WELL,
  onOpenDoc,
  onViewRiskAlert,
}: WellComparisonViewProps) {
  // Selected comparison wells (WELL-A, WELL-B, WELL-C checked by default)
  const [selectedWellIds, setSelectedWellIds] = useState<string[]>(['ACTIVE-01', 'WELL-A', 'WELL-B', 'WELL-C']);
  
  // Interactive current bit depth line for depth alignment (defaults to 4,980 m)
  const [simBitDepth, setSimBitDepth] = useState<number>(activeWell.parameters.depth || 4980);

  // Modals state
  const [selectedDocForModal, setSelectedDocForModal] = useState<string | null>(null);
  const [eventDetailForModal, setEventDetailForModal] = useState<any | null>(null);

  const toggleWellSelection = (id: string) => {
    if (id === 'ACTIVE-01') return; // Cannot uncheck active well
    setSelectedWellIds(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const selectedWells = useMemo(() => {
    return ALL_COMPARISON_WELLS.filter(w => selectedWellIds.includes(w.id));
  }, [selectedWellIds]);

  const handleOpenDocModal = (docName: string) => {
    if (onOpenDoc) {
      onOpenDoc(docName);
    } else {
      setSelectedDocForModal(docName);
    }
  };

  const handleOpenEventModal = (inc: any, wellName: string, doc: string) => {
    setEventDetailForModal({
      wellName,
      distanceKm: wellName.includes('A') ? 3.0 : wellName.includes('B') ? 4.2 : 2.8,
      formation: 'Formation X',
      event: inc.type,
      depth: inc.depth,
      sourceDoc: doc,
      relevancePct: 94,
      mitigationApplied: inc.description,
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <GitCompare className="h-4 w-4 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Side-by-Side Well Comparison
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  STRATIGRAPHIC ALIGNMENT
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare active well against historical offset wells across Formation X.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {onViewRiskAlert && (
            <button
              onClick={onViewRiskAlert}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>View Active Risk Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SELECT WELLS SELECTOR BAR */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Select Wells for Comparison Matrix
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedWells.length} Wells Selected
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {ALL_COMPARISON_WELLS.map((w) => {
            const isSelected = selectedWellIds.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => toggleWellSelection(w.id)}
                className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                  w.isActiveWell
                    ? 'bg-blue-950/80 border-blue-600 text-white font-bold cursor-default'
                    : isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md'
                    : 'bg-[#070c18] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`h-4 w-4 rounded flex items-center justify-center text-[10px] ${
                  isSelected ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isSelected ? <Check className="h-3 w-3" /> : null}
                </div>
                <span>{w.name}</span>
                {w.isActiveWell ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase">Active</span>
                ) : (
                  <span className="text-[10px] text-slate-400">({w.distance})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SIMILARITY SCORES NOTICE */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3 text-xs font-mono text-cyan-200">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-white mb-0.5">HEURISTIC SIMILARITY DISCLAIMER:</strong>
          Similarity scores (e.g. Well A: 91%, Well B: 88%, Well C: 94%) represent prototype multi-parameter proximity metrics based on geographic offset, formation thickness, and telemetry ranges. They are provided as engineering decision support and are not validated statistical probabilities.
        </div>
      </div>

      {/* 4. COMPARISON METRICS MATRIX TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Side-by-Side Comparison Metrics Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Normalized across Formation X
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#060a14] uppercase text-[11px]">
                <th className="py-3 px-4 w-48 font-bold">Metric Category</th>
                {selectedWells.map((w) => (
                  <th key={w.id} className={`py-3 px-4 ${w.isActiveWell ? 'bg-blue-950/40 text-cyan-300 font-extrabold border-x border-blue-800/60' : 'text-white'}`}>
                    <div className="flex items-center justify-between">
                      <span>{w.name}</span>
                      {!w.isActiveWell && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {w.similarityScore}% Similar
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {/* Distance */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Distance</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 font-bold text-white border-x border-blue-900/40' : ''}`}>
                    {w.distance}
                  </td>
                ))}
              </tr>

              {/* Formation */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Formation</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 text-purple-300 border-x border-blue-900/40' : 'text-purple-300'}`}>
                    {w.formation}
                  </td>
                ))}
              </tr>

              {/* Total Depth */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Total Depth (TD)</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 font-bold text-white border-x border-blue-900/40' : ''}`}>
                    {w.totalDepth}
                  </td>
                ))}
              </tr>

              {/* Drilling Duration */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Drilling Duration</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 text-slate-300 border-x border-blue-900/40' : ''}`}>
                    {w.drillingDuration}
                  </td>
                ))}
              </tr>

              {/* Average ROP */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Average ROP</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 text-emerald-400 font-bold border-x border-blue-900/40' : 'text-emerald-400'}`}>
                    {w.avgRop}
                  </td>
                ))}
              </tr>

              {/* Average Torque */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Average Torque</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 text-amber-300 border-x border-blue-900/40' : 'text-amber-300'}`}>
                    {w.avgTorque}
                  </td>
                ))}
              </tr>

              {/* Average WOB */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Average WOB</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 text-cyan-300 border-x border-blue-900/40' : ''}`}>
                    {w.avgWob}
                  </td>
                ))}
              </tr>

              {/* Mud Weight */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Mud Weight</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 text-indigo-300 border-x border-blue-900/40' : ''}`}>
                    {w.mudWeight}
                  </td>
                ))}
              </tr>

              {/* Historical Events */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Historical Events</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 border-x border-blue-900/40' : ''}`}>
                    <div className="flex flex-wrap gap-1">
                      {w.historicalEvents.map((ev, eIdx) => (
                        <span key={eIdx} className={`px-1.5 py-0.5 rounded text-[10px] ${
                          ev.includes('Mud Loss') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          ev.includes('Torque') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          ev.includes('Stuck') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-slate-900 text-slate-300'
                        }`}>
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* NPT */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Recorded NPT</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 ${w.isActiveWell ? 'bg-blue-950/20 font-bold border-x border-blue-900/40' : ''}`}>
                    <span className={w.nptHours > 20 ? 'text-rose-400 font-bold' : w.nptHours > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {w.npt}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Casing Program */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Casing Program</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 text-[11px] ${w.isActiveWell ? 'bg-blue-950/20 border-x border-blue-900/40' : ''}`}>
                    {w.casingProgram}
                  </td>
                ))}
              </tr>

              {/* Cementing */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-2.5 px-4 font-bold text-slate-400 font-sans">Cementing</td>
                {selectedWells.map(w => (
                  <td key={w.id} className={`py-2.5 px-4 text-[11px] ${w.isActiveWell ? 'bg-blue-950/20 border-x border-blue-900/40' : ''}`}>
                    {w.cementing}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. DEPTH ALIGNMENT VISUALIZATION */}
      <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Depth Alignment & Historical Incident Track Plot
            </h2>
            <span className="text-xs text-slate-400 font-mono">(4,500 m to 5,200 m Depth Axis)</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Current Depth Line:</span>
            <input
              type="number"
              value={simBitDepth}
              onChange={(e) => setSimBitDepth(parseInt(e.target.value) || 4980)}
              className="w-20 px-2 py-1 rounded bg-[#060a14] border border-slate-800 text-cyan-300 font-bold text-xs"
            />
            <span className="text-slate-400">m</span>
          </div>
        </div>

        {/* Depth Plot Grid */}
        <div className="p-4 rounded-xl bg-[#060a14] border border-slate-800/90 relative overflow-x-auto">
          <div className="min-w-[700px] relative font-mono text-xs space-y-6">
            {/* Horizontal Moving Bit Depth Line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-cyan-400 z-20 pointer-events-none transition-all duration-300"
              style={{
                top: `${Math.min(92, Math.max(8, ((simBitDepth - 4800) / (5200 - 4800)) * 100))}%`
              }}
            >
              <span className="absolute -top-3 right-2 px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold shadow">
                ACTIVE BIT: {simBitDepth} m
              </span>
            </div>

            {/* Depth Columns for Selected Wells */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10 py-2">
              {selectedWells.map((w) => (
                <div key={w.id} className="p-3 rounded-lg bg-[#080d19] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <strong className="text-white text-xs font-bold">{w.name}</strong>
                    <span className="text-[10px] text-slate-400">{w.distance}</span>
                  </div>

                  <div className="space-y-3 min-h-[220px] relative py-2">
                    {/* Render Incidents Plot Points */}
                    {w.incidentsByDepth.map((inc, iIdx) => (
                      <div
                        key={iIdx}
                        onClick={() => handleOpenEventModal(inc, w.name, w.doc)}
                        className={`p-2 rounded border cursor-pointer transition-transform hover:scale-102 ${
                          inc.type === 'Stuck Pipe'
                            ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                            : inc.type === 'Mud Loss'
                            ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                            : inc.type === 'High Torque'
                            ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                            : 'bg-blue-950/80 border-blue-600 text-cyan-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>{inc.depthFormatted}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-black/40">{inc.type}</span>
                        </div>
                        <p className="text-[10px] font-sans mt-1 leading-tight line-clamp-2">
                          {inc.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between text-slate-400">
                    <span>Source:</span>
                    <button
                      onClick={() => handleOpenDocModal(w.doc)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <span>{w.doc}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. CONCLUSION PANEL — HISTORICAL PATTERN SUMMARY */}
      <div className="rounded-2xl border border-cyan-800/80 bg-gradient-to-b from-[#09152a] to-[#070d1a] p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              HISTORICAL PATTERN SUMMARY
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            SYNTHESIZED PATTERN EVALUATION
          </span>
        </div>

        {/* Supporting Headline Quote */}
        <p className="text-base font-bold text-cyan-200 leading-snug">
          “Comparable historical events are concentrated within the upcoming depth interval (5,025 m – 5,070 m in Formation X).”
        </p>

        {/* Supporting Evidence List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#060a14] border border-rose-800/80 space-y-1">
            <span className="text-rose-400 font-bold block">5,025 m — Stuck Pipe (Well C)</span>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Differential sticking across depleted sandstone following 22-min stationary MWD survey. Required 50 bbl surfactant soak & 36 hrs NPT.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#060a14] border border-rose-800/80 space-y-1">
            <span className="text-rose-400 font-bold block">5,040 m — Mud Loss (Well A)</span>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Fractured thief zone caused 78 bbl/hr fluid loss and 350 psi SPP drop. Mitigated via 40 bbl cellulosic coarse LCM pill.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#060a14] border border-amber-800/80 space-y-1">
            <span className="text-amber-400 font-bold block">5,060 m — High Torque (Well B)</span>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Shale swelling triggered top drive stall & 38 kNm torque spikes. Mitigated by mud lubricant beads & ROP cap &lt; 6 m/hr.
            </p>
          </div>
        </div>

        {/* Non-Autonomous Operational Disclaimer */}
        <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>DECISION SUPPORT NOTICE:</strong> This pattern summary is provided as informational decision-support for engineering evaluation. The system does not execute autonomous drilling control actions. Final operational procedures remain strictly with the drilling engineer.
          </p>
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
