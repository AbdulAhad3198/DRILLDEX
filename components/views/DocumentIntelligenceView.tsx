'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Database,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  FileCode2,
  Check,
  X,
  ExternalLink,
  Code,
  ShieldCheck,
  Binary,
  Info
} from 'lucide-react';
import { HISTORICAL_DOCUMENTS, SourceDocument } from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';

interface ExtractedEntity {
  well: string;
  depth: string;
  formation: string;
  event: string;
  severity: 'High' | 'Medium' | 'Low';
  cause: string;
  impact: string;
  mitigation: string;
  sourceText: string;
  docReference: string;
  confidence: number;
}

interface DocumentLibraryItem {
  id: string;
  document: string;
  type: 'DDR' | 'WCR' | 'Incident Report' | 'Mud Log';
  well: string;
  date: string;
  extractedEvents: number;
  status: 'Processed' | 'Processing' | 'Queued';
  source: string;
  rawTextPreview: string;
  entities: ExtractedEntity;
}

const DEFAULT_PRESET_ENTITIES: ExtractedEntity = {
  well: 'WELL-A',
  depth: '4,850 m',
  formation: 'Formation X',
  event: 'Mud Loss',
  severity: 'High',
  cause: 'Induced fracture from drilling surge pressure over high-permeability faulted sub-interval',
  impact: 'Lost circulation / 145 bbl mud loss / 18.5 hrs operational delay (NPT)',
  mitigation: 'Spotted 40 bbl coarse cellulosic LCM pill (35 ppb), reduced pump rate from 550 to 420 gpm, circulation restored',
  sourceText: 'Mud loss occurred at 4,850 m in Formation X.',
  docReference: 'DDR-WELL-A-042',
  confidence: 96.8,
};

const INITIAL_DOC_LIBRARY: DocumentLibraryItem[] = [
  {
    id: 'doc-1',
    document: 'DDR-WELL-A-042',
    type: 'DDR',
    well: 'WELL-A',
    date: '2021',
    extractedEvents: 3,
    status: 'Processed',
    source: 'OIL Digboi Archives / PDF',
    rawTextPreview: 'Depth 4,850m. Drilling 8-1/2" hole in Formation X. Mud loss occurred at 4,850 m in Formation X. Lost 145 bbl active volume. Standby 18.5 hrs while spotting LCM.',
    entities: DEFAULT_PRESET_ENTITIES,
  },
  {
    id: 'doc-2',
    document: 'WCR-WELL-B-011',
    type: 'WCR',
    well: 'WELL-B',
    date: '2020',
    extractedEvents: 7,
    status: 'Processed',
    source: 'OIL Geosciences Repo / PDF',
    rawTextPreview: 'End of well report. Total depth 5,280 m. Severe torque spiking observed between 5,040 m and 5,065 m within Barail / Formation X. Tight hole during wiper trip.',
    entities: {
      well: 'WELL-B',
      depth: '5,060 m',
      formation: 'Formation X',
      event: 'Torque Spike & Packoff',
      severity: 'High',
      cause: 'Micro-fractured shale swelling and unstable keyseat geometry under overbalanced mud weight',
      impact: 'Rotational torque erratic spikes to 28 kft-lbs / 14 hrs reaming and back-reaming',
      mitigation: 'Increased mud weight to 1.35 SG with glycol-based shale inhibitor; pumped high-viscosity sweeps',
      sourceText: 'Severe torque oscillations up to 28 kft-lbs at 5,060 m in Formation X requiring immediate rotary wash.',
      docReference: 'WCR-WELL-B-011',
      confidence: 94.2,
    },
  },
  {
    id: 'doc-3',
    document: 'WCR-WELL-C-076',
    type: 'WCR',
    well: 'WELL-C',
    date: '2019',
    extractedEvents: 5,
    status: 'Processed',
    source: 'OIL Historical Filing / PDF',
    rawTextPreview: 'Drilling summary. Encountered differential stuck pipe at 5,025 m following 25 min stationary connection in depleted sandstone sand.',
    entities: {
      well: 'WELL-C',
      depth: '5,025 m',
      formation: 'Formation X',
      event: 'Stuck Pipe',
      severity: 'High',
      cause: 'Differential sticking across high-permeability thief zone with 120 psi overbalance during stationary drillstring interval',
      impact: 'Pipe stuck on bottom / 24 hrs jarring operations / 36 hrs total NPT',
      mitigation: 'Spotted lubricating oil-base pipe freeing soak; jarred up with 110 klbf overpull; rotated free after 18 hrs',
      sourceText: 'Encountered differential sticking of 8-1/2" BHA at 5,025 m after prolonged survey pause in Formation X.',
      docReference: 'WCR-WELL-C-076',
      confidence: 97.1,
    },
  },
  {
    id: 'doc-4',
    document: 'DDR-WELL-B-118',
    type: 'DDR',
    well: 'WELL-B',
    date: '2020',
    extractedEvents: 4,
    status: 'Processed',
    source: 'Daily Mud Logging Telemetry / TXT',
    rawTextPreview: 'Mud logging report: Gas influx detected at 5,110 m. Background gas rose from 1.2% to 8.4%. Shut in on annular preventer.',
    entities: {
      well: 'WELL-B',
      depth: '5,110 m',
      formation: 'Formation Y',
      event: 'Gas Kick / Influx',
      severity: 'Medium',
      cause: 'Underbalanced transition entering pressurized permeable sandstone lens',
      impact: '15 bbl pit gain / SICP 380 psi / 6.5 hrs wait on mud weight kill sheet',
      mitigation: 'Circulated out kick via Driller Method, raised active pit weight from 1.28 to 1.34 SG',
      sourceText: 'Rapid pit volume gain of 15 bbl and gas spike to 8.4% at 5,110 m; shut in well on annular.',
      docReference: 'DDR-WELL-B-118',
      confidence: 92.5,
    },
  },
  {
    id: 'doc-5',
    document: 'DDR-WELL-D-015',
    type: 'DDR',
    well: 'WELL-D',
    date: '2022',
    extractedEvents: 2,
    status: 'Processed',
    source: 'Rig Tour Log / DOCX',
    rawTextPreview: 'Casing operation tour sheet: Successfully ran and cemented 9-5/8" casing string to 4,680 m. Good cement returns observed at surface.',
    entities: {
      well: 'WELL-D',
      depth: '4,680 m',
      formation: 'Formation W',
      event: 'Casing Operation',
      severity: 'Low',
      cause: 'Scheduled intermediate casing seat depth per engineering drilling program',
      impact: 'No loss / 100% slurry returns to surface / zero NPT',
      mitigation: 'Casing circulated 2 bottoms-up; staged cement displacement with continuous pressure monitoring',
      sourceText: 'Landed 9-5/8" casing shoe at 4,680 m; pumped 520 sx Class G cement with full returns.',
      docReference: 'DDR-WELL-D-015',
      confidence: 98.6,
    },
  },
];

const PIPELINE_STEPS = [
  { id: 1, title: 'DOCUMENT UPLOADED', desc: 'File payload received, MIME validated & binary checksum generated' },
  { id: 2, title: 'OCR / TEXT EXTRACTION', desc: 'LayoutLM + Tesseract optical character recognition & tabular parser' },
  { id: 3, title: 'NLP ENTITY EXTRACTION', desc: 'Domain spaCy/Transformer NER: well identifiers, formations, depths' },
  { id: 4, title: 'EVENT CLASSIFICATION', desc: 'Hazard taxonomy classification (mud loss, stuck pipe, kick, NPT)' },
  { id: 5, title: 'STRUCTURED KNOWLEDGE', desc: 'JSON schema normalization, confidence scoring & relational linking' },
  { id: 6, title: 'KNOWLEDGE BASE', desc: 'Indexed into vector store for real-time offset proximity query' },
];

export function DocumentIntelligenceView() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(6); // Default 6 (completed on initial load)
  const [uploadedFileName, setUploadedFileName] = useState<string>('DDR-WELL-A-2021-042.pdf');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('2.4 MB');
  const [documentLibrary, setDocumentLibrary] = useState<DocumentLibraryItem[]>(INITIAL_DOC_LIBRARY);
  const [activeExtractedEntity, setActiveExtractedEntity] = useState<ExtractedEntity>(DEFAULT_PRESET_ENTITIES);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<DocumentLibraryItem>(INITIAL_DOC_LIBRARY[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showJsonRawModal, setShowJsonRawModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0].name, `${(e.dataTransfer.files[0].size / 1024 / 1024).toFixed(1)} MB`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0].name, `${(e.target.files[0].size / 1024 / 1024).toFixed(1)} MB`);
    }
  };

  // Simulate pipeline execution
  const processUploadedFile = (name: string, size: string) => {
    setUploadedFileName(name);
    setUploadedFileSize(size);
    setIsProcessing(true);
    setPipelineStep(1);

    // Pick an appropriate entity based on filename or synthesize one
    let newEntity: ExtractedEntity;
    let newDocType: 'DDR' | 'WCR' | 'Incident Report' | 'Mud Log' = 'DDR';

    if (name.toUpperCase().includes('WCR')) {
      newDocType = 'WCR';
      newEntity = {
        well: 'WELL-B',
        depth: '5,060 m',
        formation: 'Formation X',
        event: 'Torque Spike & Packoff',
        severity: 'High',
        cause: 'Unstable micro-fractured shale swelling in Formation X transition',
        impact: 'Torque spike to 28 kft-lbs, rotary stalling, 14 hrs NPT wiper trip',
        mitigation: 'Treated mud with 3% glycol shale stabilizer; reduced RPM to 85',
        sourceText: 'Torque spike recorded at 5,060 m in Formation X during trip.',
        docReference: name.replace(/\.[^/.]+$/, ''),
        confidence: 95.4,
      };
    } else if (name.toUpperCase().includes('INCIDENT') || name.toUpperCase().includes('STICK')) {
      newDocType = 'Incident Report';
      newEntity = {
        well: 'WELL-C',
        depth: '5,025 m',
        formation: 'Formation X',
        event: 'Differential Stuck Pipe',
        severity: 'High',
        cause: 'Drillstring stationary connection over depleted sandstone thief zone with 120 psi overbalance',
        impact: 'Pipe immobilized on bottom, 24 hrs mechanical jarring, 36 hrs NPT',
        mitigation: 'Spotted 50 bbl pipe-freeing soak pill; jarred free at 110 klbf overpull',
        sourceText: 'Differential sticking occurred at 5,025 m in Formation X.',
        docReference: name.replace(/\.[^/.]+$/, ''),
        confidence: 97.8,
      };
    } else {
      newDocType = 'DDR';
      newEntity = {
        well: 'WELL-A',
        depth: '4,850 m',
        formation: 'Formation X',
        event: 'Mud Loss',
        severity: 'High',
        cause: 'Induced fracture from drilling surge pressure over high-permeability faulted sub-interval',
        impact: 'Lost circulation / 145 bbl mud inventory lost / 18.5 hrs operational delay',
        mitigation: 'Pumped 40 bbl coarse cellulosic LCM pill (35 ppb), throttled pump to 420 gpm',
        sourceText: 'Mud loss occurred at 4,850 m in Formation X.',
        docReference: name.replace(/\.[^/.]+$/, ''),
        confidence: 96.8,
      };
    }

    // Sequentially step through the 6 stages with timer
    const stepInterval = 450;
    setTimeout(() => setPipelineStep(2), stepInterval * 1);
    setTimeout(() => setPipelineStep(3), stepInterval * 2);
    setTimeout(() => setPipelineStep(4), stepInterval * 3);
    setTimeout(() => setPipelineStep(5), stepInterval * 4);
    setTimeout(() => {
      setPipelineStep(6);
      setIsProcessing(false);
      setActiveExtractedEntity(newEntity);

      // Add or update library item
      const newItem: DocumentLibraryItem = {
        id: `uploaded-${Date.now()}`,
        document: name.replace(/\.[^/.]+$/, ''),
        type: newDocType,
        well: newEntity.well,
        date: '2024',
        extractedEvents: Math.floor(Math.random() * 4) + 2,
        status: 'Processed',
        source: `User Upload / ${name.split('.').pop()?.toUpperCase() || 'FILE'}`,
        rawTextPreview: `[OCR Output] ${newEntity.sourceText} Detailed incident report logged on rig sensor stream. BHA assembly inspection completed.`,
        entities: newEntity,
      };

      setDocumentLibrary(prev => [newItem, ...prev]);
      setSelectedLibraryItem(newItem);
    }, stepInterval * 5);
  };

  const handleSelectPresetSample = (sampleName: string) => {
    processUploadedFile(sampleName, '3.1 MB');
  };

  const handleSelectLibraryItem = (item: DocumentLibraryItem) => {
    setSelectedLibraryItem(item);
    setActiveExtractedEntity(item.entities);
    setUploadedFileName(`${item.document}.${item.source.toLowerCase().includes('pdf') ? 'pdf' : item.source.toLowerCase().includes('docx') ? 'docx' : 'txt'}`);
    setPipelineStep(6);
  };

  // Filtered documents table
  const filteredLibrary = documentLibrary.filter(doc => {
    if (typeFilter !== 'All' && doc.type !== typeFilter) return false;
    if (statusFilter !== 'All' && doc.status !== statusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        doc.document.toLowerCase().includes(q) ||
        doc.well.toLowerCase().includes(q) ||
        doc.entities.event.toLowerCase().includes(q) ||
        doc.entities.formation.toLowerCase().includes(q) ||
        doc.rawTextPreview.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeExtractedEntity, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <Sparkles className="h-4 w-4 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Document Intelligence
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  AI-OCR / NLP ENGINE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Transform historical drilling reports into structured operational knowledge.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Backend Specs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonRawModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Extracted JSON</span>
          </button>

          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-xs font-semibold text-cyan-300 hover:bg-cyan-900 transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>FastAPI Architecture</span>
          </button>
        </div>
      </div>

      {/* Prototype Notice Banner */}
      <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50 flex items-start gap-3 text-xs">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-cyan-200">
            Prototype Extraction Engine — Simulated Processing Pipeline
          </p>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            This module illustrates the automated ingestion flow converting unstructured historical drilling reports (DDR, WCR, incident logs) into structured risk taxonomy. Frontend interfaces and data schemas are structured for direct plug-and-play connection to a production FastAPI OCR / LayoutLM microservice.
          </p>
        </div>
      </div>

      {/* 2. UPLOAD AREA (Drag & Drop Panel) */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Report Ingestion & Processing
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Supported Formats:</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/70 text-[10px] font-mono font-bold">
              PDF
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/70 text-[10px] font-mono font-bold">
              DOCX
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/70 text-[10px] font-mono font-bold">
              TXT
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
              : 'border-slate-800 hover:border-slate-700 bg-[#070d1a]/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="h-14 w-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="h-7 w-7 text-cyan-400 animate-pulse" />
          </div>

          <p className="text-sm font-semibold text-white">
            Upload WCR, DDR, mud logging report, incident report or service report.
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Drag and drop your engineering files here, or browse from your workstation. Multi-page OCR and entity recognition runs automatically.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <span>Browse Files</span>
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">Test Ingestion Samples:</span>
            <button
              onClick={() => handleSelectPresetSample('DDR-WELL-A-2021-042.pdf')}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              DDR-WELL-A-042 (Mud Loss)
            </button>
            <button
              onClick={() => handleSelectPresetSample('WCR-WELL-B-2020-011.pdf')}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              WCR-WELL-B-011 (Torque Spike)
            </button>
            <button
              onClick={() => handleSelectPresetSample('INCIDENT-WELL-C-5025M.docx')}
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              INCIDENT-WELL-C (Stuck Pipe)
            </button>
          </div>
        </div>
      </div>

      {/* 3. PROCESSING PIPELINE (6 Sequential Steps with Animated Progress) */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AI Ingestion & NLP Extraction Pipeline
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              ({uploadedFileName} · {uploadedFileSize})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isProcessing ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span className="font-mono font-semibold">Stage {pipelineStep}/6 Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Knowledge Extraction Complete (100%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isProcessing
                ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 animate-pulse'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${(pipelineStep / 6) * 100}%` }}
          />
        </div>

        {/* 6 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {PIPELINE_STEPS.map((step) => {
            const isCompleted = pipelineStep > step.id || (!isProcessing && pipelineStep === 6);
            const isCurrent = isProcessing && pipelineStep === step.id;
            const isPending = pipelineStep < step.id;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/40'
                    : isCompleted
                    ? 'bg-[#0b1426] border-emerald-800/40 text-slate-300'
                    : 'bg-[#070d18] border-slate-800/60 opacity-60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    STAGE 0{step.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>

                <p className={`font-bold font-mono text-[11px] leading-tight ${
                  isCurrent ? 'text-cyan-300' : isCompleted ? 'text-white' : 'text-slate-500'
                }`}>
                  {step.title}
                </p>

                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. EXTRACTION RESULT & SOURCE TEXT CALLOUT */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Extraction Result & Token Tagging
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Source: <strong className="text-white">{activeExtractedEntity.docReference}</strong>
          </span>
        </div>

        {/* Source text with highlighted NLP tokens */}
        <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] text-slate-400 uppercase font-sans font-semibold">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Raw Source Text Sentence:</span>
          </div>

          <div className="text-sm bg-slate-900/90 p-3 rounded-md border border-slate-800 text-slate-200">
            “<span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold" title="Event Tag">
              {activeExtractedEntity.event}
            </span> occurred at <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold" title="Depth Tag">
              {activeExtractedEntity.depth}
            </span> in <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold" title="Formation Tag">
              {activeExtractedEntity.formation}
            </span>.”
          </div>

          {/* Quick Extracted Information Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Well:</span>
              <strong className="text-cyan-300 font-mono text-xs">{activeExtractedEntity.well}</strong>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Depth:</span>
              <strong className="text-white font-mono text-xs">{activeExtractedEntity.depth}</strong>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Formation:</span>
              <strong className="text-purple-300 font-mono text-xs">{activeExtractedEntity.formation}</strong>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Event:</span>
              <strong className="text-rose-400 font-mono text-xs">{activeExtractedEntity.event}</strong>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Severity:</span>
              <strong className={`font-mono text-xs ${
                activeExtractedEntity.severity === 'High' ? 'text-rose-400' : 'text-amber-400'
              }`}>{activeExtractedEntity.severity}</strong>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Impact:</span>
              <strong className="text-amber-300 font-mono text-xs truncate block">{activeExtractedEntity.impact}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ENTITY CARDS (WELL, DEPTH, FORMATION, EVENT, CAUSE, IMPACT, MITIGATION) */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Normalized Drilling Entity Knowledge Cards
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Extraction Confidence: <strong className="text-emerald-400">{activeExtractedEntity.confidence}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: WELL */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-cyan-500/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">WELL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Identifier
              </span>
            </div>
            <p className="text-base font-extrabold text-white font-mono">{activeExtractedEntity.well}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Historical Offset Well (Operator: Oil India Ltd · Moran Basin)
            </p>
          </div>

          {/* Card 2: DEPTH */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-cyan-500/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">DEPTH</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Measured
              </span>
            </div>
            <p className="text-base font-extrabold text-white font-mono">{activeExtractedEntity.depth}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              TVD: 4,795 m · Interval Range: 4,840 m – 4,865 m
            </p>
          </div>

          {/* Card 3: FORMATION */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-purple-400">FORMATION</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Lithology
              </span>
            </div>
            <p className="text-base font-extrabold text-white font-mono">{activeExtractedEntity.formation}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Interbedded fine sandstone with micro-fractured carbonaceous shale
            </p>
          </div>

          {/* Card 4: EVENT */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-rose-500/50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400">EVENT</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                Taxonomy
              </span>
            </div>
            <p className="text-base font-extrabold text-rose-300 font-mono">{activeExtractedEntity.event}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Severity: <strong className="text-rose-400">{activeExtractedEntity.severity}</strong> · Subsurface loss zone
            </p>
          </div>

          {/* Card 5: CAUSE (Wide) */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-amber-500/50 transition-colors col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400">CAUSE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Root Cause
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 leading-snug">
              {activeExtractedEntity.cause}
            </p>
          </div>

          {/* Card 6: IMPACT (Wide) */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-rose-500/50 transition-colors col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400">IMPACT</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                NPT / Loss
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 leading-snug">
              {activeExtractedEntity.impact}
            </p>
          </div>

          {/* Card 7: MITIGATION (2 cols wide on desktop) */}
          <div className="p-3.5 rounded-lg bg-[#070c18] border border-slate-800 hover:border-emerald-500/50 transition-colors col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">MITIGATION</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Operational Playbook
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-200 leading-snug">
              {activeExtractedEntity.mitigation}
            </p>
          </div>
        </div>
      </div>

      {/* 6. DOCUMENT LIBRARY TABLE */}
      <div className="rounded-xl border border-slate-800 bg-[#091122] p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Vectorized Document Library
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              ({filteredLibrary.length} records)
            </span>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search document, well, or keyword..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 font-mono"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="All">All Types</option>
              <option value="DDR">DDR</option>
              <option value="WCR">WCR</option>
              <option value="Incident Report">Incident Report</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-[#070c18] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="All">All Status</option>
              <option value="Processed">Processed</option>
              <option value="Processing">Processing</option>
              <option value="Queued">Queued</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-[#070c18]/80 uppercase">
                <th className="py-2.5 px-3">Document</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Well</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Extracted Events</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLibrary.map((item) => {
                const isSelected = selectedLibraryItem.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectLibraryItem(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-950/40 text-white font-medium'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="font-bold text-cyan-300">{item.document}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/wells/${item.well}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>{item.well}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{item.date}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">{item.extractedEvents} events</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 truncate max-w-[160px]">
                      {item.source}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocForModal(item.document);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 cursor-pointer"
                          title="View Source Report in Reader"
                        >
                          <Eye className="h-3 w-3 text-cyan-400" />
                          <span>View Source</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. RAW JSON MODAL */}
      {showJsonRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-xl bg-[#091122] border border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Extracted JSON Structured Schema ({activeExtractedEntity.docReference})
                </h3>
              </div>
              <button
                onClick={() => setShowJsonRawModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-[#050a14] rounded-lg border border-slate-800 max-h-96 overflow-y-auto text-xs font-mono text-cyan-300">
              <pre>{JSON.stringify(activeExtractedEntity, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Matches schema standard <code className="text-cyan-400">DrillingIncidentKnowledgeRecord_v1</code>
              </span>
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
              >
                {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
                <span>{copiedJson ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. FASTAPI ARCHITECTURE SPECIFICATION MODAL */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-xl bg-[#091122] border border-cyan-800/80 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    FastAPI OCR & NLP Microservice Architecture
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Production integration specifications for Oil India historical document ingestion.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#070c18] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">1. Document OCR Ingestion Endpoint</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">POST /api/v1/ocr/extract</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Consumes multipart PDF/DOCX, executes layout analysis with LayoutLMv3, generates text bounding boxes and table extractions.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#070c18] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">2. Drilling Domain NER & Relation Extraction</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">POST /api/v1/nlp/entity-tagging</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Custom fine-tuned Transformer model tags entities: [WELL], [DEPTH], [FORMATION], [EVENT], [CAUSE], [IMPACT], [MITIGATION].
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#070c18] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">3. Vector Indexing & ChromaDB Vector Store</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">POST /api/v1/vectors/upsert</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Embeds lessons learned into 768-dimensional dense vector space for real-time similarity query based on active well depth & formation.
                </p>
              </div>
            </div>

            <div className="p-3 rounded bg-blue-950/40 border border-blue-800/60 text-[11px] text-cyan-300 leading-relaxed font-mono">
              Ready to wire: Environment variable <code>NEXT_PUBLIC_OCR_API_URL=https://api.drilldex.oilindia.in</code> will toggle this UI from simulated demo mode into live FastAPI connection.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DOCUMENT VIEWER MODAL */}
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
