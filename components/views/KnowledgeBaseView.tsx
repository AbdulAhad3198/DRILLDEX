'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Layers,
  BrainCircuit,
  Compass,
  Clock,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Info,
  GitFork,
  ArrowDown,
  FileCheck2,
  Database,
  X,
  Copy,
  Check,
  Flame
} from 'lucide-react';
import { HISTORICAL_DOCUMENTS, OFFSET_WELLS, OffsetWell } from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';

interface KnowledgeBaseViewProps {
  onOpenDoc?: (docName: string) => void;
  onOpenAssistant?: (query?: string) => void;
}

export interface KnowledgeItem {
  id: string;
  well: string;
  distance: string;
  distanceKm: number;
  formation: string;
  depth: string;
  depthNum: number;
  event: 'Mud Loss' | 'Kick' | 'Stuck Pipe' | 'High Torque' | 'Cementing' | 'Casing' | 'Fishing' | 'NPT';
  historicalSummary: string;
  mitigation: string;
  sourceDocument: string;
  similarity: string;
  similarityNum: number;
  date: string;
  nptHours: number;
  evidenceQuote: string;
  parameterImpact: string;
}

const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'KB-001',
    well: 'WELL-A',
    distance: '3.0 km from current well',
    distanceKm: 3.0,
    formation: 'Formation X',
    depth: '5,040 m',
    depthNum: 5040,
    event: 'Mud Loss',
    historicalSummary: 'Historical mud-loss event observed in comparable formation interval. Penetration into micro-fractured sandstone member resulted in 78 bbl/hr fluid loss and 350 psi standpipe pressure drop.',
    mitigation: 'Formulated 40 bbl coarse LCM pill (25 ppb nutshell + 15 ppb mica in 1.22 SG polymer mud). Hesitation squeeze over 4.5 hours completely regained circulation.',
    sourceDocument: 'DDR-WELL-A-2021-042',
    similarity: '91%',
    similarityNum: 91,
    date: '2021',
    nptHours: 18.5,
    evidenceQuote: 'DDR-042: At 5,040 m, rate of loss surged to 78 bbl/hr following transition from claystone to faulted sand facies. Mud weight 1.20 SG, SPP dropped from 3,250 to 2,900 psi. Pumped 40 bbl coarse LCM blend.',
    parameterImpact: 'SPP dropped -350 psi, Pit Volume -145 bbl, Flow Out reduced to 420 gpm',
  },
  {
    id: 'KB-002',
    well: 'WELL-B',
    distance: '4.2 km from current well',
    distanceKm: 4.2,
    formation: 'Formation X',
    depth: '5,060 m',
    depthNum: 5060,
    event: 'High Torque',
    historicalSummary: 'Rotary torque jumped from 14 kNm to 38 kNm with top drive stalling during connection in high-stress micro-fractured carbonaceous shale.',
    mitigation: 'Conditioned mud rheology: reduced yield point from 26 to 18 lb/100ft², added 2% liquid lubricant beads, and limited ROP to 6.0 m/hr with wiper trips.',
    sourceDocument: 'WCR-WELL-B-2020-011',
    similarity: '88%',
    similarityNum: 88,
    date: '2020',
    nptHours: 14.0,
    evidenceQuote: 'WCR-011: Encountered severe torsional vibration and top drive stallouts at 5,060 m. Differential pressure increased 400 psi across BHA. Reamed interval 3 times with lubricant pill.',
    parameterImpact: 'Torque spiked from 14 to 38 kNm (+171%), ROP restricted to 4 m/hr',
  },
  {
    id: 'KB-003',
    well: 'WELL-C',
    distance: '2.8 km from current well',
    distanceKm: 2.8,
    formation: 'Formation X',
    depth: '5,025 m',
    depthNum: 5025,
    event: 'Stuck Pipe',
    historicalSummary: 'Drillstring remained stationary for 22 minutes during MWD directional survey in depleted overbalanced sandstone, resulting in differential sticking.',
    mitigation: 'Spotted 50 bbl oil/surfactant freeing pill, allowed 4-hour chemical soak to destroy filter cake, then applied 180 klbf overpull with upward jarring.',
    sourceDocument: 'WCR-WELL-C-2019-076',
    similarity: '94%',
    similarityNum: 94,
    date: '2019',
    nptHours: 36.0,
    evidenceQuote: 'WCR-076: BHA stuck stationary at 5,025 m during survey. Mud weight 1.25 SG (120 psi overbalance). Zero rotation, full pump pressure. Free after 18 hrs jarring.',
    parameterImpact: 'String stalled, Overpull reached 180 klbf, 36 hrs total NPT',
  },
  {
    id: 'KB-004',
    well: 'WELL-B',
    distance: '4.2 km from current well',
    distanceKm: 4.2,
    formation: 'Formation Y',
    depth: '5,110 m',
    depthNum: 5110,
    event: 'Kick',
    historicalSummary: 'Pit volume gain 18 bbl and background gas climbed from 1.2% to 8.4% during connection flow check entering pressurized permeable sandstone lens.',
    mitigation: 'Shut in on annular preventer (SIDPP 190 psi, SICP 280 psi). Circulated kill mud (1.28 SG raised to 1.34 SG) using Driller Method through choke manifold.',
    sourceDocument: 'DDR-WELL-B-2020-118',
    similarity: '82%',
    similarityNum: 82,
    date: '2020',
    nptHours: 8.5,
    evidenceQuote: 'DDR-118: Gas spike to 8.4% at 5,110 m; 18 bbl pit gain observed on trip tank. Well shut in. Killed with 1.34 SG mud.',
    parameterImpact: 'Pit gain +18 bbl, SICP 280 psi, SIDPP 190 psi',
  },
  {
    id: 'KB-005',
    well: 'WELL-D',
    distance: '5.1 km from current well',
    distanceKm: 5.1,
    formation: 'Formation W',
    depth: '4,680 m',
    depthNum: 4680,
    event: 'Casing',
    historicalSummary: 'Landed intermediate 9-5/8" casing string at 4,680 m. Excellent shoe integrity and successful 100% slurry returns to surface with zero formation breakdown.',
    mitigation: 'Circulated 2 bottoms-up prior to cementing; staged slurry displacement with continuous annular pressure monitoring and top rubber wiper plug.',
    sourceDocument: 'DDR-WELL-D-2022-015',
    similarity: '78%',
    similarityNum: 78,
    date: '2022',
    nptHours: 0,
    evidenceQuote: 'DDR-015: 9-5/8" 47# L-80 casing landed at 4,680 m. Pumped 520 sx Class G cement at 1.58 SG. 100% returns at surface.',
    parameterImpact: 'FIT tested to 1.62 SG EMW successfully',
  },
  {
    id: 'KB-006',
    well: 'WELL-E',
    distance: '6.8 km from current well',
    distanceKm: 6.8,
    formation: 'Formation Y',
    depth: '4,890 m',
    depthNum: 4890,
    event: 'Cementing',
    historicalSummary: 'Gas channeling observed post-cementing behind 7" liner across overpressured gas sand interval due to insufficient slurry hydrostatic transition time.',
    mitigation: 'Squeeze cemented perfs at 4,875 m with micro-fine expanding thixotropic cement; held 1,500 psi squeeze pressure for 6 hours.',
    sourceDocument: 'WCR-WELL-E-2018-092',
    similarity: '74%',
    similarityNum: 74,
    date: '2018',
    nptHours: 28.0,
    evidenceQuote: 'WCR-092: Annular pressure buildup after 7" liner cement job. Sustained casing pressure of 450 psi. Remediated via block squeeze.',
    parameterImpact: '450 psi sustained casing pressure, 28 hrs remediation NPT',
  },
  {
    id: 'KB-007',
    well: 'WELL-F',
    distance: '8.4 km from current well',
    distanceKm: 8.4,
    formation: 'Formation X',
    depth: '4,920 m',
    depthNum: 4920,
    event: 'Fishing',
    historicalSummary: 'BHA parted at drill collar box connection following severe torsional slip-stick harmonics while rotating through dogleg interval.',
    mitigation: 'Ran 8-1/8" overshot with spiral grapple, latched fish on first run, circulated heavy pill, and jarred fish free within 14 hours.',
    sourceDocument: 'DDR-WELL-F-2019-033',
    similarity: '71%',
    similarityNum: 71,
    date: '2019',
    nptHours: 24.5,
    evidenceQuote: 'DDR-033: String parted at 4,920 m. Fish top at 4,885 m. Latched with Bowen overshot and recovered complete BHA.',
    parameterImpact: 'Lost string weight -85 klbf, 24.5 hrs fishing NPT',
  },
  {
    id: 'KB-008',
    well: 'WELL-A',
    distance: '3.0 km from current well',
    distanceKm: 3.0,
    formation: 'Formation X',
    depth: '5,180 m',
    depthNum: 5180,
    event: 'NPT',
    historicalSummary: 'Tight hole and hole packoff during 10-stand wiper trip; required 22 hours of back-reaming and high-viscosity sweep circulation to stabilize borehole.',
    mitigation: 'Increased polymer encapsulation mud additive to 4 ppb; circulated dual tandem 30 bbl weighted high-viscosity sweeps.',
    sourceDocument: 'DDR-WELL-A-2021-042',
    similarity: '89%',
    similarityNum: 89,
    date: '2021',
    nptHours: 22.0,
    evidenceQuote: 'DDR-042: Overpull exceeded 90 klbf pulling off bottom at 5,180 m. Required continuous backreaming with 650 gpm flow.',
    parameterImpact: 'Overpull 90 klbf, 22 hrs reaming delay',
  },
];

const GRAPH_TRACKS = [
  {
    id: 'track-well-a',
    title: 'WELL-A Mud Loss Pathway',
    well: 'WELL-A',
    formation: 'Formation X',
    depth: '5,040 m',
    event: 'Mud Loss (78 bbl/hr)',
    mitigation: '40 bbl Coarse Cellulosic LCM Pill',
    sourceDocument: 'DDR-WELL-A-2021-042',
    badgeColor: 'border-rose-500/80 text-rose-300 bg-rose-950/40',
  },
  {
    id: 'track-well-b',
    title: 'WELL-B High Torque Pathway',
    well: 'WELL-B',
    formation: 'Formation X',
    depth: '5,060 m',
    event: 'Torque Spike (38 kNm)',
    mitigation: 'Mud Lubricant + YP Reduction < 20',
    sourceDocument: 'WCR-WELL-B-2020-011',
    badgeColor: 'border-amber-500/80 text-amber-300 bg-amber-950/40',
  },
  {
    id: 'track-well-c',
    title: 'WELL-C Stuck Pipe Pathway',
    well: 'WELL-C',
    formation: 'Formation X',
    depth: '5,025 m',
    event: 'Stuck Pipe (Differential)',
    mitigation: 'Surfactant Soak + 180 klbf Jarring',
    sourceDocument: 'WCR-WELL-C-2019-076',
    badgeColor: 'border-rose-500/80 text-rose-300 bg-rose-950/40',
  },
];

export function KnowledgeBaseView({ onOpenDoc, onOpenAssistant }: KnowledgeBaseViewProps) {
  // Search State
  const [searchQuery, setSearchQuery] = useState('What problems occurred around 5000 m?');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('All');
  const [selectedFormationFilter, setSelectedFormationFilter] = useState<string>('All');
  const [selectedDepthRange, setSelectedDepthRange] = useState<string>('All');
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState<string>('All');
  const [selectedWellFilter, setSelectedWellFilter] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All');

  // Interactive Graph Track Selection
  const [activeGraphTrackIndex, setActiveGraphTrackIndex] = useState(0);

  // Modals state
  const [selectedDocForModal, setSelectedDocForModal] = useState<string | null>(null);
  const [evidenceItemForModal, setEvidenceItemForModal] = useState<KnowledgeItem | null>(null);
  const [copiedEvidence, setCopiedEvidence] = useState(false);

  // Example clickable query chips
  const EXAMPLE_QUERIES = [
    'Show wells near my current well with mud-loss incidents.',
    'What problems occurred around 5000 m?',
    'Find stuck-pipe incidents in Formation X.',
    'Show historical mitigation for high torque.',
  ];

  const handleOpenDocModal = (docName: string) => {
    if (onOpenDoc) {
      onOpenDoc(docName);
    } else {
      setSelectedDocForModal(docName);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEventFilter('All');
    setSelectedFormationFilter('All');
    setSelectedDepthRange('All');
    setSelectedDistanceFilter('All');
    setSelectedWellFilter('All');
    setSelectedDateFilter('All');
  };

  // Filter logic
  const filteredResults = useMemo(() => {
    return KNOWLEDGE_ITEMS.filter((item) => {
      // Event filter
      if (selectedEventFilter !== 'All' && item.event !== selectedEventFilter) {
        return false;
      }
      // Formation filter
      if (selectedFormationFilter !== 'All' && !item.formation.toLowerCase().includes(selectedFormationFilter.toLowerCase())) {
        return false;
      }
      // Well filter
      if (selectedWellFilter !== 'All' && item.well !== selectedWellFilter) {
        return false;
      }
      // Date filter
      if (selectedDateFilter !== 'All' && item.date !== selectedDateFilter) {
        return false;
      }
      // Distance filter
      if (selectedDistanceFilter === '3km' && item.distanceKm > 3.0) return false;
      if (selectedDistanceFilter === '5km' && item.distanceKm > 5.0) return false;
      if (selectedDistanceFilter === '10km' && item.distanceKm > 10.0) return false;

      // Depth range filter
      if (selectedDepthRange === 'critical' && (item.depthNum < 5000 || item.depthNum > 5100)) return false;
      if (selectedDepthRange === 'shallow' && item.depthNum >= 4900) return false;
      if (selectedDepthRange === 'deep' && item.depthNum <= 5100) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        // Check for specific queries like "mud-loss" or "5000"
        if (q.includes('mud-loss') || q.includes('mud loss')) {
          if (!item.event.toLowerCase().includes('mud loss') && !item.historicalSummary.toLowerCase().includes('mud loss')) return false;
        } else if (q.includes('stuck') || q.includes('stuck-pipe')) {
          if (!item.event.toLowerCase().includes('stuck') && !item.historicalSummary.toLowerCase().includes('stuck')) return false;
        } else if (q.includes('torque')) {
          if (!item.event.toLowerCase().includes('torque') && !item.historicalSummary.toLowerCase().includes('torque')) return false;
        } else if (q.includes('5000') || q.includes('5,000')) {
          // Range roughly around 5,000 m (4,950 to 5,150)
          if (item.depthNum < 4950 || item.depthNum > 5150) return false;
        } else {
          const matchWell = item.well.toLowerCase().includes(q);
          const matchFormation = item.formation.toLowerCase().includes(q);
          const matchEvent = item.event.toLowerCase().includes(q);
          const matchSummary = item.historicalSummary.toLowerCase().includes(q);
          const matchMitigation = item.mitigation.toLowerCase().includes(q);
          const matchDoc = item.sourceDocument.toLowerCase().includes(q);
          const matchDepth = item.depth.toLowerCase().includes(q);

          if (!matchWell && !matchFormation && !matchEvent && !matchSummary && !matchMitigation && !matchDoc && !matchDepth) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    searchQuery,
    selectedEventFilter,
    selectedFormationFilter,
    selectedDepthRange,
    selectedDistanceFilter,
    selectedWellFilter,
    selectedDateFilter,
  ]);

  const activeTrack = GRAPH_TRACKS[activeGraphTrackIndex];

  const handleCopyEvidence = (item: KnowledgeItem) => {
    const text = `WELL: ${item.well}\nDEPTH: ${item.depth}\nFORMATION: ${item.formation}\nEVENT: ${item.event}\nSUMMARY: ${item.historicalSummary}\nMITIGATION: ${item.mitigation}\nSOURCE: ${item.sourceDocument}\nEVIDENCE QUOTE: ${item.evidenceQuote}`;
    navigator.clipboard.writeText(text);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <BookOpen className="h-4 w-4 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Drilling Knowledge Base
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  INSTITUTIONAL MEMORY
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Search historical drilling experiences, incidents, lessons and mitigation practices.
              </p>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#091122] border border-slate-800 text-xs font-mono text-slate-300">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span>42 Offset Reports Vectorized</span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR & EXAMPLE QUERIES */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4 shadow-xl">
        <div className="relative">
          <Search className="h-5 w-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search historical drilling knowledge…"
            className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-[#070d1a] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Example Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 block">Example Queries:</span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(query)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left font-mono cursor-pointer flex items-center gap-1.5 ${
                  searchQuery === query
                    ? 'bg-blue-600 text-white border-blue-500 font-medium shadow-md shadow-blue-900/30'
                    : 'bg-[#070d18] text-cyan-300 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80'
                }`}
              >
                <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>“{query}”</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FILTERS TOOLBAR */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Knowledge Filters
            </h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
          {/* 1. Event Type */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Event Type</label>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Events</option>
              <option value="Mud Loss">Mud Loss</option>
              <option value="Kick">Kick</option>
              <option value="Stuck Pipe">Stuck Pipe</option>
              <option value="High Torque">High Torque</option>
              <option value="Cementing">Cementing</option>
              <option value="Casing">Casing</option>
              <option value="Fishing">Fishing</option>
              <option value="NPT">NPT</option>
            </select>
          </div>

          {/* 2. Formation */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Formation</label>
            <select
              value={selectedFormationFilter}
              onChange={(e) => setSelectedFormationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Formations</option>
              <option value="Formation X">Formation X</option>
              <option value="Formation Y">Formation Y</option>
              <option value="Formation W">Formation W</option>
            </select>
          </div>

          {/* 3. Depth Range */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Depth Range</label>
            <select
              value={selectedDepthRange}
              onChange={(e) => setSelectedDepthRange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Depths</option>
              <option value="critical">5,000–5,100 m (Critical)</option>
              <option value="shallow">&lt; 4,900 m</option>
              <option value="deep">&gt; 5,100 m</option>
            </select>
          </div>

          {/* 4. Distance */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Distance</label>
            <select
              value={selectedDistanceFilter}
              onChange={(e) => setSelectedDistanceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Distances</option>
              <option value="3km">≤ 3.0 km (Proximate)</option>
              <option value="5km">≤ 5.0 km</option>
              <option value="10km">≤ 10.0 km</option>
            </select>
          </div>

          {/* 5. Well */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Well</label>
            <select
              value={selectedWellFilter}
              onChange={(e) => setSelectedWellFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Wells</option>
              <option value="WELL-A">WELL-A</option>
              <option value="WELL-B">WELL-B</option>
              <option value="WELL-C">WELL-C</option>
              <option value="WELL-D">WELL-D</option>
              <option value="WELL-E">WELL-E</option>
              <option value="WELL-F">WELL-F</option>
            </select>
          </div>

          {/* 6. Date */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">Date / Year</label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Years</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. AI SEARCH ANSWER PANEL */}
      <div className="rounded-xl border border-cyan-800/80 bg-gradient-to-b from-[#09152a] to-[#070d1a] p-5 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AI Knowledge Synthesis
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              AI-assisted summary · Source-backed information only
            </span>
          </div>

          <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sources: <strong>3 documents</strong></span>
          </div>
        </div>

        {/* User Question */}
        <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2.5">
          <span className="text-cyan-400 font-bold uppercase">Engineer Query:</span>
          <span className="text-white font-medium">“{searchQuery || 'What problems occurred around 5,000 m?'}”</span>
        </div>

        {/* AI Synthesized Answer */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-200">
          <p className="text-sm font-semibold text-cyan-200">
            “Three relevant offset wells contain historical events within a comparable interval (5,025 m – 5,070 m in Formation X).”
          </p>

          <p className="text-slate-300">
            Detailed examination of offset records shows an elevated density of severe geomechanical hazards:
          </p>

          <ul className="space-y-2 pl-3 border-l-2 border-cyan-500/40 font-mono text-xs">
            <li className="text-slate-300">
              <strong className="text-rose-400">1. Mud Loss @ 5,040 m (Well A, 3.0 km offset):</strong> Fractured sandstone thief zone caused 78 bbl/hr loss and 145 bbl mud inventory deficit. Required 40 bbl coarse cellulosic LCM pill and 4.5h hesitation squeeze.
            </li>
            <li className="text-slate-300">
              <strong className="text-amber-400">2. Erratic Torque Spikes @ 5,060 m (Well B, 4.2 km offset):</strong> Micro-fractured shale swelling triggered top-drive stalling with torque oscillations up to 38 kNm. Controlled by lowering mud yield point &lt; 20 lb/100ft² and adding 2% lubricating beads.
            </li>
            <li className="text-slate-300">
              <strong className="text-rose-400">3. Differential Stuck Pipe @ 5,025 m (Well C, 2.8 km offset):</strong> Drillstring remained stationary during 22-min MWD survey with 120 psi overbalance. Remediation required 50 bbl surfactant soak and 180 klbf overpull jarring over 36 hours of NPT.
            </li>
          </ul>

          {/* Institutional Compliance Rule */}
          <div className="p-2.5 rounded bg-blue-950/40 border border-blue-800/60 text-[11px] text-cyan-200 flex items-start gap-2 font-mono">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">IMPORTANT VERIFICATION REQUIREMENT:</span>
              AI answers must always have visible source evidence. Never create unsupported historical claims.
            </div>
          </div>

          {/* Visible Source Citations */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">Verified Grounding Sources:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleOpenDocModal('DDR-WELL-A-2021-042')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="h-3 w-3 text-cyan-400" />
                <span>[1] DDR-WELL-A-2021-042 (Loss Event @ 5,040 m)</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </button>

              <button
                onClick={() => handleOpenDocModal('WCR-WELL-B-2020-011')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="h-3 w-3 text-cyan-400" />
                <span>[2] WCR-WELL-B-2020-011 (Torque Spike @ 5,060 m)</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </button>

              <button
                onClick={() => handleOpenDocModal('WCR-WELL-C-2019-076')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="h-3 w-3 text-cyan-400" />
                <span>[3] WCR-WELL-C-2019-076 (Differential Sticking @ 5,025 m)</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. KNOWLEDGE GRAPH VISUAL RELATIONSHIP */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Institutional Memory Knowledge Graph
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              (Multi-hop Entity Correlation: Well → Formation → Depth → Event → Mitigation → Source)
            </span>
          </div>

          {/* Pathway Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">Track:</span>
            {GRAPH_TRACKS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveGraphTrackIndex(idx)}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  activeGraphTrackIndex === idx
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {t.well}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Relationship Graph */}
        <div className="p-4 rounded-xl bg-[#060a14] border border-slate-800/90 overflow-x-auto">
          <div className="min-w-[780px] flex items-center justify-between relative py-4">
            {/* Background connection line */}
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-cyan-600 via-blue-500 to-purple-600 -translate-y-1/2 z-0 opacity-40" />

            {/* Node 1: WELL */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-cyan-500/80 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:scale-105 transition-transform">
                <Compass className="h-6 w-6 text-cyan-400" />
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-cyan-800">
                1. WELL
              </span>
              <p className="text-xs font-bold text-white font-mono">{activeTrack.well}</p>
              <span className="text-[10px] text-slate-400">Offset Well</span>
            </div>

            <ArrowRight className="h-4 w-4 text-cyan-400 relative z-10 shrink-0" />

            {/* Node 2: FORMATION */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-purple-500/80 flex items-center justify-center shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform">
                <Layers className="h-6 w-6 text-purple-400" />
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-purple-800">
                2. FORMATION
              </span>
              <p className="text-xs font-bold text-white font-mono">{activeTrack.formation}</p>
              <span className="text-[10px] text-slate-400">Lithology Match</span>
            </div>

            <ArrowRight className="h-4 w-4 text-purple-400 relative z-10 shrink-0" />

            {/* Node 3: DEPTH */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-blue-500/80 flex items-center justify-center shadow-lg shadow-blue-950/50 group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-800">
                3. DEPTH
              </span>
              <p className="text-xs font-bold text-white font-mono">{activeTrack.depth}</p>
              <span className="text-[10px] text-slate-400">Measured Depth</span>
            </div>

            <ArrowRight className="h-4 w-4 text-blue-400 relative z-10 shrink-0" />

            {/* Node 4: EVENT */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-rose-500/80 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-rose-800">
                4. EVENT
              </span>
              <p className="text-xs font-bold text-rose-300 font-mono">{activeTrack.event}</p>
              <span className="text-[10px] text-slate-400">Historical Incident</span>
            </div>

            <ArrowRight className="h-4 w-4 text-rose-400 relative z-10 shrink-0" />

            {/* Node 5: MITIGATION */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-emerald-500/80 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-800">
                5. MITIGATION
              </span>
              <p className="text-xs font-bold text-emerald-300 font-mono max-w-[140px] truncate">{activeTrack.mitigation}</p>
              <span className="text-[10px] text-slate-400">Operational Solution</span>
            </div>

            <ArrowRight className="h-4 w-4 text-emerald-400 relative z-10 shrink-0" />

            {/* Node 6: SOURCE DOCUMENT */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-2 group">
              <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-amber-500/80 flex items-center justify-center shadow-lg shadow-amber-950/50 group-hover:scale-105 transition-transform cursor-pointer"
                onClick={() => handleOpenDocModal(activeTrack.sourceDocument)}
                title="Click to view Source Report"
              >
                <FileText className="h-6 w-6 text-amber-400" />
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-800">
                6. SOURCE DOCUMENT
              </span>
              <p className="text-xs font-bold text-white font-mono">{activeTrack.sourceDocument}</p>
              <span className="text-[10px] text-slate-400">Archival Evidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SEARCH RESULTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Knowledge Search Results
            </h2>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 text-xs font-mono">
              {filteredResults.length} records found
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Sorted by relevance & proximity to Active Well (WELL-NWIS-01)
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-800 bg-[#091122] text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No historical records match your filter criteria.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try broadening your search query or reset the filters to inspect all 42 indexed offset wells.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-[#091122] hover:border-slate-700 p-5 space-y-4 shadow-lg transition-all"
              >
                {/* Result Card Top Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                        {item.well}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                          {item.distance}
                        </span>
                      </h3>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        item.event === 'Mud Loss'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                          : item.event === 'Stuck Pipe'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                          : item.event === 'High Torque'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                          : item.event === 'Kick'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                          : 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                      }`}>
                        {item.event}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Formation: <strong className="text-purple-300">{item.formation}</strong></span>
                      <span>Depth: <strong className="text-white">{item.depth}</strong></span>
                      <span>Source: <strong className="text-cyan-300">{item.sourceDocument}</strong></span>
                    </div>
                  </div>

                  {/* Similarity Score Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Similarity</span>
                    <span className="text-base font-black font-mono text-cyan-400">
                      {item.similarity}
                    </span>
                  </div>
                </div>

                {/* Historical Summary Box */}
                <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-slate-400">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Historical Summary:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    “{item.historicalSummary}”
                  </p>

                  <div className="pt-2 border-t border-slate-800/60 flex items-start gap-1.5 text-xs text-emerald-300 font-mono">
                    <span className="text-emerald-400 font-bold shrink-0">Mitigation:</span>
                    <span className="text-slate-300">{item.mitigation}</span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span>NPT: <strong className="text-amber-400">{item.nptHours} hrs</strong></span>
                    <span>Year: <strong className="text-slate-300">{item.date}</strong></span>
                  </div>

                  {/* Required Action Buttons: View Evidence, View Well, Open Source */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEvidenceItemForModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      <span>View Evidence</span>
                    </button>

                    <Link
                      href={`/wells/${item.well}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>View Well</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </Link>

                    <button
                      onClick={() => handleOpenDocModal(item.sourceDocument)}
                      className="px-3 py-1.5 rounded-lg bg-[#070d18] hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Open Source</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. EVIDENCE DETAIL MODAL */}
      {evidenceItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-xl bg-[#091122] border border-cyan-800/80 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    Historical Evidence Log: {evidenceItemForModal.well} ({evidenceItemForModal.event})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Depth: {evidenceItemForModal.depth} · Source: {evidenceItemForModal.sourceDocument}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvidenceItemForModal(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 font-mono space-y-1.5">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                  Original Archival Report Excerpt:
                </span>
                <p className="text-slate-200 leading-relaxed italic">
                  “{evidenceItemForModal.evidenceQuote}”
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-[#070c18] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Telemetry Delta:</span>
                  <strong className="text-rose-400 text-xs">{evidenceItemForModal.parameterImpact}</strong>
                </div>
                <div className="p-2.5 rounded bg-[#070c18] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Recorded NPT:</span>
                  <strong className="text-amber-400 text-xs">{evidenceItemForModal.nptHours} Hours</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 font-mono space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  Preserved Institutional Mitigation:
                </span>
                <p className="text-emerald-200 text-xs leading-relaxed">
                  {evidenceItemForModal.mitigation}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyEvidence(evidenceItemForModal)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedEvidence ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedEvidence ? 'Copied Evidence' : 'Copy Evidence Citation'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const doc = evidenceItemForModal.sourceDocument;
                    setEvidenceItemForModal(null);
                    handleOpenDocModal(doc);
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Open Full Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. DOCUMENT VIEWER MODAL */}
      {selectedDocForModal && (
        <DocumentViewerModal
          documentIdOrName={selectedDocForModal}
          isOpen={!!selectedDocForModal}
          onClose={() => setSelectedDocForModal(null)}
        />
      )}
    </div>
  );
}
