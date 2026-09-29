'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { OffsetWell, ActiveWellState } from '@/lib/data';
import { NearbyWellsMap } from '../dashboard/NearbyWellsMap';
import { 
  MapPin, 
  Search, 
  Filter, 
  RotateCcw, 
  FileText, 
  Compass, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  Info,
  Clock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';

interface NearbyWellsViewProps {
  activeWell: ActiveWellState;
  wells: OffsetWell[];
  selectedWell: OffsetWell | null;
  onSelectWell: (well: OffsetWell) => void;
  onOpenDoc: (docName: string) => void;
  onViewRiskAlert: () => void;
}

export function NearbyWellsView({
  activeWell,
  wells,
  selectedWell,
  onSelectWell,
  onOpenDoc,
  onViewRiskAlert,
}: NearbyWellsViewProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusFilter, setRadiusFilter] = useState<number>(10); // 1, 3, 5, 10, 25 km
  const [formationFilter, setFormationFilter] = useState('All');
  const [wellTypeFilter, setWellTypeFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [minDepth, setMinDepth] = useState<number>(4500);
  const [maxDepth, setMaxDepth] = useState<number>(5600);
  const [docFilter, setDocFilter] = useState('All');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Sorting State for Table
  const [sortField, setSortField] = useState<'distanceKm' | 'similarityScore' | 'totalDepth' | 'criticalDepth'>('distanceKm');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Active displayed well (defaults to selectedWell or first in list)
  const currentSelectedWell = selectedWell || wells[0];

  // Filtering Logic
  const filteredWells = useMemo(() => {
    return wells.filter((w) => {
      // Radius filter
      if (w.distanceKm > radiusFilter) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q);
        const matchesFormation = w.formation.toLowerCase().includes(q);
        const matchesEvent = w.historicalEventsList.some(e => e.toLowerCase().includes(q));
        if (!matchesName && !matchesFormation && !matchesEvent) return false;
      }
      // Formation filter
      if (formationFilter !== 'All' && !w.formation.toLowerCase().includes(formationFilter.toLowerCase())) {
        return false;
      }
      // Well Type filter
      if (wellTypeFilter !== 'All' && w.wellType !== wellTypeFilter) {
        return false;
      }
      // Historical Event filter
      if (eventFilter !== 'All') {
        const hasEvent = w.historicalEventsList.some(e => e.toLowerCase().includes(eventFilter.toLowerCase()));
        if (!hasEvent) return false;
      }
      // Risk Level filter
      if (riskFilter !== 'All' && w.riskCategory !== riskFilter) {
        return false;
      }
      // Max Distance slider
      if (w.distanceKm > maxDistance) return false;
      // Total Depth bounds
      if (w.totalDepth < minDepth || w.totalDepth > maxDepth) return false;
      // Documents filter
      if (docFilter !== 'All') {
        const hasDoc = w.relevantDocuments.some(d => d.type === docFilter);
        if (!hasDoc) return false;
      }
      return true;
    });
  }, [
    wells, 
    radiusFilter, 
    searchQuery, 
    formationFilter, 
    wellTypeFilter, 
    eventFilter, 
    riskFilter, 
    maxDistance, 
    minDepth, 
    maxDepth, 
    docFilter
  ]);

  // Sorted Wells for Table
  const sortedWells = useMemo(() => {
    return [...filteredWells].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredWells, sortField, sortAsc]);

  const handleSort = (field: 'distanceKm' | 'similarityScore' | 'totalDepth' | 'criticalDepth') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRadiusFilter(10);
    setFormationFilter('All');
    setWellTypeFilter('All');
    setEventFilter('All');
    setRiskFilter('All');
    setMaxDistance(25);
    setMinDepth(4500);
    setMaxDepth(5600);
    setDocFilter('All');
  };

  const handleDownloadCSV = () => {
    const headers = ['Well Name', 'Code', 'Distance (km)', 'Bearing', 'Formation', 'TD (m)', 'Critical Depth (m)', 'Similarity (%)', 'Risk Category', 'Events'];
    const rows = sortedWells.map(w => [
      w.name,
      w.code,
      w.distanceKm,
      w.bearing,
      `"${w.formation}"`,
      w.totalDepth,
      w.criticalDepth,
      w.similarityScore,
      w.riskCategory,
      `"${w.historicalEventsList.join(', ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `offset_wells_directory_${activeWell.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWellSummary = (well: OffsetWell) => {
    const text = `=======================================================
eRTMAC-NWIS OFFSET WELL INTELLIGENCE DOSSIER
=======================================================
Target Active Well: ${activeWell.name} (Current Depth: ${activeWell.parameters.depth} m)
Offset Well: ${well.name} (${well.code})
Distance: ${well.distanceKm} km | Bearing: ${well.bearing}
Coordinates: ${well.lat}°N, ${well.lng}°E
Formation: ${well.formation} | Lithology: ${well.lithology}
Total Depth: ${well.totalDepth} m | Critical Depth: ${well.criticalDepth} m
Drilling Duration: ${well.drillingDuration} | Status: ${well.status}

PROTOTYPE SIMILARITY SCORE: ${well.similarityScore}%
- Geographic Proximity: ${well.similarityBreakdown.geographic}%
- Formation Match: ${well.similarityBreakdown.formation}%
- Depth Profile: ${well.similarityBreakdown.depth}%
- Drilling Parameter Correlation: ${well.similarityBreakdown.parameter}%

HISTORICAL DRILLING INCIDENTS:
${well.incidents.map(i => `* Depth: ${i.depth} m | Type: ${i.type} (${i.severity})
  Description: ${i.description}
  Mitigation Applied: ${i.mitigation}
  Outcome: ${i.outcome} | NPT: ${i.nptHours} hrs
  Source: ${i.sourceDocName} (Page ${i.sourceDocPage})`).join('\n\n')}

RISK HISTORY:
${well.riskHistory}

RELEVANT ARCHIVAL DOCUMENTS:
${well.relevantDocuments.map(d => `- ${d.name} (${d.type})`).join('\n')}

OPERATIONAL ADVISORY:
Recommendations provided for engineer review. Final operational decisions remain with the drilling engineer.
=======================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${well.code}_Offset_Intelligence_Summary.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = (well: OffsetWell) => {
    const summaryText = `[eRTMAC-NWIS] Well ${well.name} (${well.code}): Distance ${well.distanceKm} km, Formation ${well.formation}, TD ${well.totalDepth} m, Critical Depth ${well.criticalDepth} m. Similarity: ${well.similarityScore}%. Major Incidents: ${well.historicalEventsList.join(', ')}. Risk Category: ${well.riskCategory}.`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* 1. PAGE HEADER (Exact Prompt Requirements) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-400" />
            <span>Nearby Wells Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore historical drilling knowledge from geographically and geologically relevant offset wells.
          </p>
        </div>

        {/* Status Indicators Pill Strip */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1 rounded bg-[#0b1325] border border-cyan-800/80 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-sans">Current Well:</span>
            <strong className="text-white font-bold">{activeWell.name}</strong>
          </div>

          <div className="px-3 py-1 rounded bg-blue-950/60 border border-blue-700/60 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-sans">Current Depth:</span>
            <strong className="text-cyan-400 font-bold">{activeWell.parameters.depth.toLocaleString()} m</strong>
          </div>

          <div className="px-3 py-1 rounded bg-amber-950/60 border border-amber-600/60 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-sans">Search Radius:</span>
            <strong className="text-amber-300 font-bold">{radiusFilter} km</strong>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1 rounded bg-[#0b1325] hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export all matching offset wells to CSV"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-sans font-semibold text-[11px]">Export Directory</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-ZONE LAYOUT: (Left: Filter Panel) + (Center: Map & Table) + (Right: Well Detail Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* LEFT FILTER PANEL (3 cols) */}
        <div className="lg:col-span-3 rounded-lg bg-[#0b1324] border border-slate-800 p-3.5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-cyan-400" />
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] font-sans">
                Offset Filters
              </h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Well input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Search Well
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Well name, code, event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-[#070c17] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Radius segmented selector (1km, 3km, 5km, 10km, 25km) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                Search Radius
              </label>
              <span className="font-mono text-cyan-400 text-[11px]">{radiusFilter} km</span>
            </div>
            <div className="grid grid-cols-5 gap-1 p-0.5 rounded bg-[#070c17] border border-slate-800 text-[10px] font-mono">
              {[1, 3, 5, 10, 25].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilter(r)}
                  className={`py-1 rounded text-center transition-colors cursor-pointer ${
                    radiusFilter === r
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}k
                </button>
              ))}
            </div>
          </div>

          {/* Formation Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Formation
            </label>
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070c17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="All">All Formations</option>
              <option value="Formation X">Formation X (Barail Sandstone)</option>
              <option value="Surma">Formation F-2 (Surma / Bokabil)</option>
              <option value="Tipam">Formation F-1 (Tipam)</option>
            </select>
          </div>

          {/* Well Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Well Type
            </label>
            <select
              value={wellTypeFilter}
              onChange={(e) => setWellTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070c17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="All">All Well Types</option>
              <option value="Development">Development Well</option>
              <option value="Exploration">Exploration / Wildcat</option>
              <option value="Appraisal">Appraisal Step-out</option>
              <option value="Abandoned">Plugged & Abandoned</option>
            </select>
          </div>

          {/* Historical Event Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Historical Event
            </label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070c17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="All">All Historical Events</option>
              <option value="Mud Loss">Mud Loss / Lost Circulation</option>
              <option value="High Torque">High Torque / Tight Hole</option>
              <option value="Stuck Pipe">Stuck Pipe / Differential</option>
              <option value="Normal">Normal Drilling</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070c17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Significant">Significant (Red)</option>
              <option value="Moderate">Moderate (Amber)</option>
              <option value="Low">Low / Nominal (Green)</option>
            </select>
          </div>

          {/* Available Documents */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Available Documents
            </label>
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070c17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="All">All Reports</option>
              <option value="DDR">Daily Drilling Reports (DDR)</option>
              <option value="WCR">Well Completion Reports (WCR)</option>
            </select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                Distance Limit
              </label>
              <span className="font-mono text-cyan-400 text-[11px] font-semibold">{maxDistance} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Total Depth Range */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                Total Depth (TD)
              </label>
              <span className="font-mono text-cyan-400 text-[10px]">{minDepth} - {maxDepth} m</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block mb-0.5">Min (m)</span>
                <input
                  type="number"
                  value={minDepth}
                  onChange={(e) => setMinDepth(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded bg-[#070c17] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block mb-0.5">Max (m)</span>
                <input
                  type="number"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded bg-[#070c17] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {}}
              className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm text-center"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* CENTER / MAIN WORKSPACE: MAP & WELL LIST (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Interactive React Leaflet Map */}
          <div className="h-[400px] rounded-lg overflow-hidden border border-slate-800 shadow-lg">
            <NearbyWellsMap
              activeWell={activeWell}
              offsetWells={filteredWells}
              selectedWellId={currentSelectedWell.id}
              onSelectWell={onSelectWell}
              radiusKm={radiusFilter}
            />
          </div>

          {/* Quick Active Selection Banner */}
          <div className="p-2.5 rounded bg-[#0b1324] border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-sans">Active Map Selection:</span>
              <strong className="text-white">{currentSelectedWell.name}</strong>
              <span className="text-slate-400">({currentSelectedWell.distanceKm} km)</span>
            </div>
            <span className="text-cyan-400 font-bold">{currentSelectedWell.similarityScore}% Similarity</span>
          </div>
        </div>

        {/* RIGHT: WELL DETAIL PANEL & SIMILARITY BREAKDOWN (4 cols) */}
        <div className="lg:col-span-4 rounded-lg bg-[#0b1324] border border-slate-800 p-4 space-y-3.5 text-xs shadow-xl">
          {/* Well ID & Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">{currentSelectedWell.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300">
                  {currentSelectedWell.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {currentSelectedWell.distanceKm.toFixed(1)} km · Bearing {currentSelectedWell.bearing}
              </p>
            </div>

            {/* Risk Category Badge */}
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono border ${
              currentSelectedWell.riskCategory === 'Significant'
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : currentSelectedWell.riskCategory === 'Moderate'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
            }`}>
              {currentSelectedWell.riskCategory} Risk
            </span>
          </div>

          {/* Coordinates & Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Coordinates</span>
              <strong className="text-slate-200 text-[11px]">{currentSelectedWell.lat.toFixed(4)}°N, {currentSelectedWell.lng.toFixed(4)}°E</strong>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Formation</span>
              <strong className="text-white text-xs">{currentSelectedWell.formation}</strong>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Total Depth (TD)</span>
              <strong className="text-cyan-400 text-xs">{currentSelectedWell.totalDepth.toLocaleString()} m</strong>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Drilling Duration</span>
              <strong className="text-slate-200 text-xs">{currentSelectedWell.drillingDuration}</strong>
            </div>
          </div>

          {/* SIMILARITY BREAKDOWN (Exact Prompt Requirements) */}
          <div className="p-3 rounded-lg bg-[#070c17] border border-cyan-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs font-sans">
                Well Similarity: <strong className="text-cyan-400 font-mono text-sm">{currentSelectedWell.similarityScore}%</strong>
              </span>
              <span className="text-[9px] font-mono text-cyan-400/90 uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                Prototype similarity score
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Geographic similarity</span>
                  <span className="font-bold text-white">{currentSelectedWell.similarityBreakdown.geographic}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-cyan-400" style={{ width: `${currentSelectedWell.similarityBreakdown.geographic}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Formation similarity</span>
                  <span className="font-bold text-white">{currentSelectedWell.similarityBreakdown.formation}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-teal-400" style={{ width: `${currentSelectedWell.similarityBreakdown.formation}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Depth similarity</span>
                  <span className="font-bold text-white">{currentSelectedWell.similarityBreakdown.depth}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-blue-400" style={{ width: `${currentSelectedWell.similarityBreakdown.depth}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Drilling parameter similarity</span>
                  <span className="font-bold text-white">{currentSelectedWell.similarityBreakdown.parameter}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-indigo-400" style={{ width: `${currentSelectedWell.similarityBreakdown.parameter}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[9px] text-slate-500 font-sans italic pt-1 border-t border-slate-800/80 leading-tight">
              *Prototype similarity score computed via spatial multi-factor distance and stratigraphic correlation. Not a statistical probability.
            </p>
          </div>

          {/* Historical Events & Critical Depth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                Historical Events & Critical Depth
              </span>
              <span className="font-mono text-rose-400 font-bold text-xs">
                Critical Depth: {currentSelectedWell.criticalDepth.toLocaleString()} m
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {currentSelectedWell.historicalEventsList.map((evt, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-950/70 border border-rose-800/70 text-rose-300"
                >
                  {evt}
                </span>
              ))}
            </div>
          </div>

          {/* Risk History Narrative */}
          <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Risk History:</span>
            <p className="leading-snug text-slate-300">{currentSelectedWell.riskHistory}</p>
          </div>

          {/* Relevant Documents (Clickable pills) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              Relevant Historical Documents
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentSelectedWell.relevantDocuments.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => onOpenDoc(doc.name)}
                  className="px-2.5 py-1 rounded bg-[#070c17] hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1.5 cursor-pointer"
                  title="Open source PDF in viewer"
                >
                  <FileText className="h-3 w-3 text-cyan-400" />
                  <span>{doc.name}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Investigate Risk & Generate Offset Summary (Prompt Requirements) */}
          {/* Action Buttons: Open Dossier, Investigate Risk & Generate Offset Summary */}
          <div className="pt-2.5 border-t border-slate-800 space-y-2">
            <Link
              href={`/wells/${currentSelectedWell.id}`}
              className="w-full py-2.5 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/40 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-white" />
              <span>Open Digital Well Dossier ({currentSelectedWell.name})</span>
              <ExternalLink className="h-3.5 w-3.5 ml-auto text-blue-200" />
            </Link>

            <button
              onClick={onViewRiskAlert}
              className="w-full py-2 px-3 rounded bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer group"
            >
              <AlertTriangle className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
              <span>Investigate Risk</span>
              <ChevronRight className="h-3.5 w-3.5 ml-auto text-rose-200" />
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full py-2 px-3 rounded bg-[#070c17] hover:bg-slate-800 border border-cyan-800/80 text-cyan-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
              <span>Generate Offset Summary / Export Well Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. WELL LIST (SORTABLE TABLE) - Exact Prompt Columns:
          Well | Distance | Formation | TD | Similarity | Major Event | Critical Depth | Documents | Risk */}
      <div className="rounded-lg bg-[#0b1324] border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-4 py-2.5 bg-[#091122] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              Offset Wells Directory ({sortedWells.length} wells in {radiusFilter} km radius)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Click row to synchronize map marker and view full intelligence breakdown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070c17] text-[10px] text-slate-400 uppercase font-sans">
                <th className="py-2.5 px-3 font-semibold">Well</th>
                <th 
                  onClick={() => handleSort('distanceKm')}
                  className="py-2.5 px-2.5 font-semibold cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Distance</span>
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-2.5 px-2.5 font-semibold">Formation</th>
                <th 
                  onClick={() => handleSort('totalDepth')}
                  className="py-2.5 px-2.5 font-semibold cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>TD</span>
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('similarityScore')}
                  className="py-2.5 px-2.5 font-semibold cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Similarity</span>
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold">Major Event</th>
                <th 
                  onClick={() => handleSort('criticalDepth')}
                  className="py-2.5 px-2.5 font-semibold cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Critical Depth</span>
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-2.5 px-2.5 font-semibold">Documents</th>
                <th className="py-2.5 px-3 text-right font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {sortedWells.map((well) => {
                const isSelected = currentSelectedWell.id === well.id;
                const primaryDoc = well.relevantDocuments[0];

                return (
                  <tr
                    key={well.id}
                    onClick={() => onSelectWell(well)}
                    className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-950/40 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    {/* Well */}
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${
                          well.riskCategory === 'Significant' ? 'bg-rose-500' : well.riskCategory === 'Moderate' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                        <span>{well.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">({well.code})</span>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-2.5 px-2.5 text-slate-200">
                      {well.distanceKm.toFixed(1)} km
                    </td>

                    {/* Formation */}
                    <td className="py-2.5 px-2.5 text-slate-300">
                      {well.formation}
                    </td>

                    {/* TD */}
                    <td className="py-2.5 px-2.5 text-slate-300">
                      {well.totalDepth.toLocaleString()} m
                    </td>

                    {/* Similarity */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyan-400">{well.similarityScore}%</span>
                        <div className="w-10 h-1 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${well.similarityScore >= 90 ? 'bg-cyan-400' : well.similarityScore >= 80 ? 'bg-teal-400' : 'bg-amber-400'}`} 
                            style={{ width: `${well.similarityScore}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Major Event */}
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`font-semibold ${
                        well.riskCategory === 'Significant' ? 'text-rose-400' : well.riskCategory === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {well.historicalEventsList[0] || 'Normal Drilling'}
                      </span>
                    </td>

                    {/* Critical Depth */}
                    <td className="py-2.5 px-2.5 text-amber-300 font-bold">
                      {well.criticalDepth.toLocaleString()} m
                    </td>

                    {/* Documents */}
                    <td className="py-2.5 px-2.5">
                      {primaryDoc ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDoc(primaryDoc.name);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          <span>{primaryDoc.name.slice(0, 16)}</span>
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Risk Badge */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${
                        well.riskCategory === 'Significant'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : well.riskCategory === 'Moderate'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {well.riskCategory}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. OFFSET SUMMARY / EXPORT WELL DATA MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl rounded-xl bg-[#080d19] border border-cyan-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a1224] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-cyan-950/80 border border-cyan-700/80 text-cyan-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Offset Well Intelligence Dossier</span>
                    <span className="font-mono text-cyan-400 text-xs">({currentSelectedWell.name} / {currentSelectedWell.code})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Compiled historical drilling intelligence for active well planning (WELL-NWIS-01 @ {activeWell.parameters.depth} m)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Distance & Bearing</span>
                  <strong className="text-white text-xs">{currentSelectedWell.distanceKm} km</strong>
                  <span className="text-[10px] text-slate-400 block">Bearing {currentSelectedWell.bearing}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Formation</span>
                  <strong className="text-cyan-300 text-xs truncate block">{currentSelectedWell.formation}</strong>
                  <span className="text-[10px] text-slate-400 block">{currentSelectedWell.lithology}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Total / Critical Depth</span>
                  <strong className="text-white text-xs">{currentSelectedWell.totalDepth} m</strong>
                  <span className="text-[10px] text-rose-400 block">Crit: {currentSelectedWell.criticalDepth} m</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Similarity Score</span>
                  <strong className="text-cyan-400 text-xs">{currentSelectedWell.similarityScore}% Match</strong>
                  <span className="text-[10px] text-slate-400 block">{currentSelectedWell.riskCategory} Risk</span>
                </div>
              </div>

              {/* Similarity Breakdown Graphic */}
              <div className="p-3 rounded-lg bg-[#070c17] border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white uppercase text-[11px] tracking-wider">Multi-Factor Similarity Decomposition</span>
                  <span className="text-[10px] font-mono text-cyan-400">Prototype similarity score</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-sans block">Geographic</span>
                    <strong className="text-white">{currentSelectedWell.similarityBreakdown.geographic}%</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-sans block">Formation Match</span>
                    <strong className="text-teal-300">{currentSelectedWell.similarityBreakdown.formation}%</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-sans block">Depth Stratigraphy</span>
                    <strong className="text-blue-300">{currentSelectedWell.similarityBreakdown.depth}%</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-sans block">Drilling Dynamics</span>
                    <strong className="text-indigo-300">{currentSelectedWell.similarityBreakdown.parameter}%</strong>
                  </div>
                </div>
              </div>

              {/* Historical Incidents Table */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Logged Drilling Incidents & Mitigation Outcomes</span>
                </h4>
                <div className="rounded border border-slate-800 overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#091122] text-[10px] text-slate-400 uppercase font-sans border-b border-slate-800">
                      <tr>
                        <th className="py-1.5 px-2.5">Depth</th>
                        <th className="py-1.5 px-2">Type</th>
                        <th className="py-1.5 px-2">Mitigation Applied</th>
                        <th className="py-1.5 px-2">Outcome</th>
                        <th className="py-1.5 px-2 text-right">Source Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentSelectedWell.incidents.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-800/30">
                          <td className="py-2 px-2.5 font-bold text-rose-300">{inc.depth} m</td>
                          <td className="py-2 px-2 text-white font-semibold">{inc.type}</td>
                          <td className="py-2 px-2 text-slate-300 text-[10px]">{inc.mitigation}</td>
                          <td className="py-2 px-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              inc.outcome === 'Worked' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {inc.outcome} ({inc.nptHours}h NPT)
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => {
                                setIsExportModalOpen(false);
                                onOpenDoc(inc.sourceDocName);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 underline text-[10px] cursor-pointer"
                            >
                              {inc.sourceDocName}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compliance & Engineering Disclaimer */}
              <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed">
                <strong>ENGINEERING DECISION-SUPPORT NOTICE:</strong> Recommendations and historical offset insights are provided for engineer review. Final operational decisions remain with the drilling engineer.
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-3.5 bg-[#0a1224] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadWellSummary(currentSelectedWell)}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Well Dossier (.txt)</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Export All to CSV</span>
                </button>
                <button
                  onClick={() => handleCopySummary(currentSelectedWell)}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsExportModalOpen(false);
                    onViewRiskAlert();
                  }}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Investigate Risk</span>
                </button>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
