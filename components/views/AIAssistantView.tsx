'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  User, 
  RefreshCw,
  Lightbulb,
  ExternalLink,
  Info,
  Database,
  Layers,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Copy,
  Check,
  ChevronRight,
  Building2,
  FileCheck2
} from 'lucide-react';
import { ActiveWellState, INITIAL_ACTIVE_WELL } from '@/lib/data';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';

interface AIAssistantViewProps {
  activeWell?: ActiveWellState;
  currentDepth?: number;
  onOpenDoc?: (docName: string) => void;
  initialQuery?: string;
}

export interface OffsetEvidenceCard {
  well: string;
  wellId: string;
  distance: string;
  distanceKm: number;
  event: string;
  depth: string;
  depthNum: number;
  formation: string;
  sourceDoc: string;
  summary: string;
  mitigation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  evidenceCards?: OffsetEvidenceCard[];
  sourceCitations?: {
    docName: string;
    well: string;
    event: string;
    depth: string;
  }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-default-1',
    sender: 'user',
    text: 'Show nearby wells that experienced mud loss around 5000 m.',
    timestamp: '10:14 AM',
  },
  {
    id: 'msg-default-2',
    sender: 'assistant',
    text: '3 relevant offset wells were identified.',
    timestamp: '10:14 AM',
    evidenceCards: [
      {
        well: 'Well A',
        wellId: 'WELL-A',
        distance: '3.0 km',
        distanceKm: 3.0,
        event: 'Mud Loss',
        depth: '5,040 m',
        depthNum: 5040,
        formation: 'Formation X',
        sourceDoc: 'DDR-WELL-A-042',
        summary: 'Encountered fractured sandstone thief zone with 78 bbl/hr lost circulation and standpipe pressure drop of 350 psi.',
        mitigation: 'Spotted 40 bbl coarse cellulosic LCM pill (35 ppb), performed hesitation squeeze, throttled pump to 420 gpm.',
      },
      {
        well: 'Well B',
        wellId: 'WELL-B',
        distance: '4.7 km',
        distanceKm: 4.7,
        event: 'Mud Loss',
        depth: '5,015 m',
        depthNum: 5015,
        formation: 'Formation X Transition',
        sourceDoc: 'DDR-WELL-B-017',
        summary: 'Partial losses of 45 bbl/hr recorded upon entering permeable sand lenses; background gas climbed to 4.2%.',
        mitigation: 'Mixed 30 bbl calcium carbonate blend (medium/coarse) and increased active pit weight from 1.18 to 1.22 SG.',
      },
      {
        well: 'Well C',
        wellId: 'WELL-C',
        distance: '6.2 km',
        distanceKm: 6.2,
        event: 'Mud Loss',
        depth: '5,080 m',
        depthNum: 5080,
        formation: 'Formation X',
        sourceDoc: 'WCR-WELL-C-076',
        summary: 'Total lost circulation occurred during coring run; dynamic pit volume drop of 110 bbl before blind drilling stopped.',
        mitigation: 'Set 250 sx Class G balanced cement plug across thief zone; tagged solid plug after 12 hrs WOC.',
      },
    ],
    sourceCitations: [
      { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'Mud Loss', depth: '5,040 m' },
      { docName: 'DDR-WELL-B-017', well: 'Well B', event: 'Mud Loss', depth: '5,015 m' },
      { docName: 'WCR-WELL-C-076', well: 'Well C', event: 'Mud Loss', depth: '5,080 m' },
    ],
  },
];

const SUGGESTED_QUESTIONS = [
  'What happened around 5000 m?',
  'Which nearby wells had stuck pipe?',
  'Show high-torque events in Formation X.',
  'What historical mitigation was used?',
  'Compare Well A and Well B.',
];

export function AIAssistantView({
  activeWell = INITIAL_ACTIVE_WELL,
  currentDepth = 4980,
  onOpenDoc,
  initialQuery,
}: AIAssistantViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<string | null>(null);
  const [eventDetailForModal, setEventDetailForModal] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(100);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleOpenDocModal = (docName: string) => {
    if (onOpenDoc) {
      onOpenDoc(docName);
    } else {
      setSelectedDocForModal(docName);
    }
  };

  const handleViewEventModal = (card: OffsetEvidenceCard) => {
    setEventDetailForModal({
      wellName: card.well,
      distanceKm: card.distanceKm,
      formation: card.formation,
      event: card.event,
      depth: card.depthNum,
      sourceDoc: card.sourceDoc,
      relevancePct: 92,
      mitigationApplied: card.mitigation,
    });
  };

  const handleSend = async (queryToSend?: string) => {
    const query = (queryToSend || input).trim();
    if (!query || loading) return;

    idCounter.current += 1;
    const userMsg: ChatMessage = {
      id: `usr-${idCounter.current}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const qLower = query.toLowerCase();

    // Check specific suggested questions or domain patterns for immediate high-fidelity evidence
    setTimeout(async () => {
      let assistantMsg: ChatMessage;
      idCounter.current += 1;

      if (qLower.includes('mud loss') && (qLower.includes('5000') || qLower.includes('5,000') || qLower.includes('nearby'))) {
        assistantMsg = {
          id: `ast-${idCounter.current}`,
          sender: 'assistant',
          text: '3 relevant offset wells were identified.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidenceCards: [
            {
              well: 'Well A',
              wellId: 'WELL-A',
              distance: '3.0 km',
              distanceKm: 3.0,
              event: 'Mud Loss',
              depth: '5,040 m',
              depthNum: 5040,
              formation: 'Formation X',
              sourceDoc: 'DDR-WELL-A-042',
              summary: 'Encountered fractured sandstone thief zone with 78 bbl/hr lost circulation and standpipe pressure drop of 350 psi.',
              mitigation: 'Spotted 40 bbl coarse cellulosic LCM pill (35 ppb), performed hesitation squeeze, throttled pump to 420 gpm.',
            },
            {
              well: 'Well B',
              wellId: 'WELL-B',
              distance: '4.7 km',
              distanceKm: 4.7,
              event: 'Mud Loss',
              depth: '5,015 m',
              depthNum: 5015,
              formation: 'Formation X Transition',
              sourceDoc: 'DDR-WELL-B-017',
              summary: 'Partial losses of 45 bbl/hr recorded upon entering permeable sand lenses; background gas climbed to 4.2%.',
              mitigation: 'Mixed 30 bbl calcium carbonate blend (medium/coarse) and increased active pit weight from 1.18 to 1.22 SG.',
            },
            {
              well: 'Well C',
              wellId: 'WELL-C',
              distance: '6.2 km',
              distanceKm: 6.2,
              event: 'Mud Loss',
              depth: '5,080 m',
              depthNum: 5080,
              formation: 'Formation X',
              sourceDoc: 'WCR-WELL-C-076',
              summary: 'Total lost circulation occurred during coring run; dynamic pit volume drop of 110 bbl before blind drilling stopped.',
              mitigation: 'Set 250 sx Class G balanced cement plug across thief zone; tagged solid plug after 12 hrs WOC.',
            },
          ],
          sourceCitations: [
            { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'Mud Loss', depth: '5,040 m' },
            { docName: 'DDR-WELL-B-017', well: 'Well B', event: 'Mud Loss', depth: '5,015 m' },
            { docName: 'WCR-WELL-C-076', well: 'Well C', event: 'Mud Loss', depth: '5,080 m' },
          ],
        };
      } else if (qLower.includes('around 5000') || qLower.includes('around 5,000') || qLower.includes('happened around')) {
        assistantMsg = {
          id: `ast-${idCounter.current}`,
          sender: 'assistant',
          text: '3 distinct drilling hazard events occurred within the 5,010 m – 5,080 m interval across 3 offset wells:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidenceCards: [
            {
              well: 'Well A',
              wellId: 'WELL-A',
              distance: '3.0 km',
              distanceKm: 3.0,
              event: 'Mud Loss',
              depth: '5,040 m',
              depthNum: 5040,
              formation: 'Formation X',
              sourceDoc: 'DDR-WELL-A-042',
              summary: '78 bbl/hr lost circulation zone requiring 40 bbl coarse LCM pill and 4.5h hesitation squeeze.',
              mitigation: 'Spotted 40 bbl cellulosic LCM pill (35 ppb), flow throttle to 420 gpm.',
            },
            {
              well: 'Well B',
              wellId: 'WELL-B',
              distance: '4.2 km',
              distanceKm: 4.2,
              event: 'High Torque',
              depth: '5,060 m',
              depthNum: 5060,
              formation: 'Formation X',
              sourceDoc: 'WCR-WELL-B-2020-011',
              summary: 'Severe torque oscillations up to 38 kNm (+171%) and top-drive stalling due to micro-fractured shale swelling.',
              mitigation: 'Conditioned mud rheology: reduced yield point to 18 lb/100ft², added 2% lubricant beads, capped ROP < 6 m/hr.',
            },
            {
              well: 'Well C',
              wellId: 'WELL-C',
              distance: '2.8 km',
              distanceKm: 2.8,
              event: 'Stuck Pipe',
              depth: '5,025 m',
              depthNum: 5025,
              formation: 'Formation X',
              sourceDoc: 'WCR-WELL-C-076',
              summary: 'Differential sticking after 22 minutes stationary connection across depleted sandstone with 120 psi overbalance.',
              mitigation: 'Spotted 50 bbl surfactant soak; jarred upwards with 180 klbf overpull for 18 hours until string freed.',
            },
          ],
          sourceCitations: [
            { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'Mud Loss', depth: '5,040 m' },
            { docName: 'WCR-WELL-B-2020-011', well: 'Well B', event: 'High Torque', depth: '5,060 m' },
            { docName: 'WCR-WELL-C-076', well: 'Well C', event: 'Stuck Pipe', depth: '5,025 m' },
          ],
        };
      } else if (qLower.includes('stuck') || qLower.includes('stuck pipe')) {
        assistantMsg = {
          id: `ast-${idCounter.current}`,
          sender: 'assistant',
          text: 'Historical database indicates 1 severe differential stuck pipe incident proximate to current location:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidenceCards: [
            {
              well: 'Well C',
              wellId: 'WELL-C',
              distance: '2.8 km',
              distanceKm: 2.8,
              event: 'Stuck Pipe',
              depth: '5,025 m',
              depthNum: 5025,
              formation: 'Formation X',
              sourceDoc: 'WCR-WELL-C-076',
              summary: 'Differential sticking occurred during 22-min MWD survey with 120 psi overbalance. Resulted in 36 hours total NPT.',
              mitigation: 'Spotted 50 bbl oil-base pipe-freeing soak pill; applied 180 klbf overpull upward jarring. Protocol mandates <3 min stationary limit.',
            },
          ],
          sourceCitations: [
            { docName: 'WCR-WELL-C-076', well: 'Well C', event: 'Differential Sticking', depth: '5,025 m' },
          ],
        };
      } else if (qLower.includes('torque') || qLower.includes('high-torque')) {
        assistantMsg = {
          id: `ast-${idCounter.current}`,
          sender: 'assistant',
          text: 'Offset records document severe torsional vibration and packoff events in Formation X:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidenceCards: [
            {
              well: 'Well B',
              wellId: 'WELL-B',
              distance: '4.2 km',
              distanceKm: 4.2,
              event: 'High Torque',
              depth: '5,060 m',
              depthNum: 5060,
              formation: 'Formation X',
              sourceDoc: 'WCR-WELL-B-2020-011',
              summary: 'Torque spiked from 14 kNm to 38 kNm with frequent top-drive stalling due to reactive shale stringers.',
              mitigation: 'Reduced mud yield point from 26 to 18 lb/100ft², added 2% liquid lubricant, capped rotary speed to 90 RPM.',
            },
          ],
          sourceCitations: [
            { docName: 'WCR-WELL-B-2020-011', well: 'Well B', event: 'High Torque & Packoff', depth: '5,060 m' },
          ],
        };
      } else if (qLower.includes('mitigation') || qLower.includes('mitigations')) {
        assistantMsg = {
          id: `ast-${idCounter.current}`,
          sender: 'assistant',
          text: 'Preserved institutional mitigation procedures for the upcoming 5,030–5,070 m Formation X interval:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidenceCards: [
            {
              well: 'Well A',
              wellId: 'WELL-A',
              distance: '3.0 km',
              distanceKm: 3.0,
              event: 'Mud Loss Protocol',
              depth: '5,040 m',
              depthNum: 5040,
              formation: 'Formation X',
              sourceDoc: 'DDR-WELL-A-042',
              summary: 'Proven lost circulation procedure: Stage 40 bbl cellulosic coarse LCM pill (35 ppb) on suction standby before 5,020 m.',
              mitigation: 'Reduce flow rate to 420 gpm upon first loss indicator; perform hesitation squeeze at 300 psi.',
            },
            {
              well: 'Well B',
              wellId: 'WELL-B',
              distance: '4.2 km',
              distanceKm: 4.2,
              event: 'Torque Suppression Protocol',
              depth: '5,060 m',
              depthNum: 5060,
              formation: 'Formation X',
              sourceDoc: 'WCR-WELL-B-2020-011',
              summary: 'Borehole stability protocol: Condition mud with 3% glycol shale stabilizer and lubricant beads.',
              mitigation: 'Maintain Yield Point < 20 lb/100ft²; schedule 5-stand wiper trips every 60 m drilled.',
            },
          ],
          sourceCitations: [
            { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'LCM Playbook', depth: '5,040 m' },
            { docName: 'WCR-WELL-B-2020-011', well: 'Well B', event: 'Torque Management', depth: '5,060 m' },
          ],
        };
      } else if (qLower.includes('compare well a and well b') || (qLower.includes('well a') && qLower.includes('well b'))) {
        assistantMsg = {
          id: `ast-${idCounter.current}`,
          sender: 'assistant',
          text: 'Comparative engineering breakdown between Well A (3.0 km NW) and Well B (4.2 km NE):',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidenceCards: [
            {
              well: 'Well A',
              wellId: 'WELL-A',
              distance: '3.0 km',
              distanceKm: 3.0,
              event: 'Mud Loss Dominant',
              depth: '5,040 m',
              depthNum: 5040,
              formation: 'Formation X',
              sourceDoc: 'DDR-WELL-A-042',
              summary: 'Key characteristic: High permeability thief zone; experienced severe fluid loss (78 bbl/hr) but minimal drillstring torque issues.',
              mitigation: 'Controlled by coarse LCM pill and flow throttling.',
            },
            {
              well: 'Well B',
              wellId: 'WELL-B',
              distance: '4.2 km',
              distanceKm: 4.2,
              event: 'Torque & Kick Dominant',
              depth: '5,060 m & 5,110 m',
              depthNum: 5060,
              formation: 'Formation X & Y',
              sourceDoc: 'WCR-WELL-B-2020-011',
              summary: 'Key characteristic: Reactive carbonaceous shale causing 38 kNm torque spikes at 5,060 m followed by 18 bbl gas influx at 5,110 m.',
              mitigation: 'Controlled by mud weight increase to 1.34 SG and lubricant sweeps.',
            },
          ],
          sourceCitations: [
            { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'Loss Profile', depth: '5,040 m' },
            { docName: 'WCR-WELL-B-2020-011', well: 'Well B', event: 'Torque/Kick Profile', depth: '5,060 m' },
          ],
        };
      } else {
        // Fallback or API call
        try {
          const res = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query, currentDepth }),
          });

          if (res.ok) {
            const data = await res.json();
            assistantMsg = {
              id: `ast-${idCounter.current}`,
              sender: 'assistant',
              text: data.reply || 'Synthesized historical drilling intelligence based on indexed offset records.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              evidenceCards: [
                {
                  well: 'Well A',
                  wellId: 'WELL-A',
                  distance: '3.0 km',
                  distanceKm: 3.0,
                  event: 'Mud Loss',
                  depth: '5,040 m',
                  depthNum: 5040,
                  formation: 'Formation X',
                  sourceDoc: 'DDR-WELL-A-042',
                  summary: 'Historical lost circulation precedent at 5,040 m.',
                  mitigation: '40 bbl cellulosic LCM pill (35 ppb).',
                },
                {
                  well: 'Well B',
                  wellId: 'WELL-B',
                  distance: '4.2 km',
                  distanceKm: 4.2,
                  event: 'High Torque',
                  depth: '5,060 m',
                  depthNum: 5060,
                  formation: 'Formation X',
                  sourceDoc: 'WCR-WELL-B-2020-011',
                  summary: 'Historical torque oscillations up to 38 kNm.',
                  mitigation: 'Conditioned mud rheology and lubricant beads.',
                },
              ],
              sourceCitations: [
                { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'Mud Loss', depth: '5,040 m' },
                { docName: 'WCR-WELL-B-2020-011', well: 'Well B', event: 'High Torque', depth: '5,060 m' },
              ],
            };
          } else {
            throw new Error('API unavailable');
          }
        } catch {
          assistantMsg = {
            id: `ast-${idCounter.current}`,
            sender: 'assistant',
            text: `Based on indexed NWIS records for current depth (${currentDepth} m in Formation X), 2 proximate offset wells contain relevant operational precedent:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evidenceCards: [
              {
                well: 'Well A',
                wellId: 'WELL-A',
                distance: '3.0 km',
                distanceKm: 3.0,
                event: 'Mud Loss',
                depth: '5,040 m',
                depthNum: 5040,
                formation: 'Formation X',
                sourceDoc: 'DDR-WELL-A-042',
                summary: 'Lost circulation event observed in comparable formation interval.',
                mitigation: '40 bbl coarse cellulosic LCM pill.',
              },
              {
                well: 'Well B',
                wellId: 'WELL-B',
                distance: '4.2 km',
                distanceKm: 4.2,
                event: 'High Torque',
                depth: '5,060 m',
                depthNum: 5060,
                formation: 'Formation X',
                sourceDoc: 'WCR-WELL-B-2020-011',
                summary: 'Torque spike observed in micro-fractured shale stringers.',
                mitigation: 'Reduced mud yield point and added liquid lubricant.',
              },
            ],
            sourceCitations: [
              { docName: 'DDR-WELL-A-042', well: 'Well A', event: 'Mud Loss', depth: '5,040 m' },
              { docName: 'WCR-WELL-B-2020-011', well: 'Well B', event: 'High Torque', depth: '5,060 m' },
            ],
          };
        }
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[640px] rounded-2xl bg-[#080d19] border border-cyan-800/60 shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* 1. HEADER */}
      <div className="p-4 md:p-5 border-b border-slate-800/90 bg-[#060a14] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <div className="h-full w-full bg-[#070c18] rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>NWIS Intelligence Assistant</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ENGINEERING COPILOT
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Ask questions about historical wells, drilling events and operational knowledge.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[11px] text-slate-400">Current Depth:</span>
            <span className="px-2.5 py-1 rounded bg-[#0a1122] text-cyan-300 border border-slate-800 font-bold">
              {currentDepth} m MD
            </span>
          </div>
        </div>

        {/* Header Knowledge Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-[#091122] border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>Knowledge Sources:</span>
            </span>
            <strong className="text-white text-xs font-bold">1,284 documents</strong>
          </div>

          <div className="p-2.5 rounded-lg bg-[#091122] border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Indexed Wells:</span>
            </span>
            <strong className="text-cyan-300 text-xs font-bold">146</strong>
          </div>

          <div className="p-2.5 rounded-lg bg-[#091122] border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Historical Events:</span>
            </span>
            <strong className="text-amber-300 text-xs font-bold">2,842</strong>
          </div>
        </div>
      </div>

      {/* 2. DISCLAIMER BANNER */}
      <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/60 text-[11px] text-amber-200/90 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            “AI-generated responses are grounded in indexed prototype documents. Verify source reports before operational use.”
          </span>
        </div>
        <span className="text-[10px] text-amber-400/80 uppercase font-semibold hidden md:inline">
          Decision Support System
        </span>
      </div>

      {/* 3. CHAT MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-[#060c18] border border-cyan-800 text-cyan-400'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-4 rounded-xl space-y-3 shadow-lg ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#091122] border border-slate-800 text-slate-200 w-full'
                }`}
              >
                <div className="text-xs font-medium leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Evidence Cards Grid (When present) */}
                {msg.evidenceCards && msg.evidenceCards.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {msg.evidenceCards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-lg bg-[#060b17] border border-slate-800 hover:border-slate-700 p-3 space-y-2.5 font-mono shadow transition-colors"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            {card.well}
                          </span>
                          <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                            {card.distance}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 uppercase font-sans">Event:</span>
                            <span className="text-xs font-bold text-rose-400">{card.event}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 uppercase font-sans">Depth:</span>
                            <span className="text-xs font-bold text-white">{card.depth}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 uppercase font-sans">Formation:</span>
                            <span className="text-xs text-purple-300">{card.formation}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 font-sans leading-snug line-clamp-2">
                          {card.summary}
                        </p>

                        {/* Action Buttons for Evidence Card */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <button
                            onClick={() => handleOpenDocModal(card.sourceDoc)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Open Source Document"
                          >
                            <FileText className="h-3 w-3 text-cyan-400" />
                            <span>Open Source</span>
                          </button>

                          <Link
                            href={`/wells/${card.wellId}`}
                            className="px-2 py-1 rounded bg-blue-900/60 hover:bg-blue-800 text-cyan-200 transition-colors flex items-center gap-1"
                          >
                            <span>View Well</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>

                          <button
                            onClick={() => handleViewEventModal(card)}
                            className="px-2 py-1 rounded bg-[#0b1426] hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 cursor-pointer"
                            title="View Full Event Record"
                          >
                            <Eye className="h-3 w-3 text-amber-400" />
                            <span>View Event</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Source Citations Section */}
                {msg.sourceCitations && msg.sourceCitations.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                      Sources ({msg.sourceCitations.length} Citations)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sourceCitations.map((cite, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#060a14] border border-slate-700/80 text-xs font-mono text-cyan-300"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="font-bold">{cite.docName}</span>
                          <span className="text-[10px] text-slate-400">({cite.well} @ {cite.depth})</span>

                          <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-800">
                            <button
                              onClick={() => handleOpenDocModal(cite.docName)}
                              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] cursor-pointer"
                              title="Open Source"
                            >
                              Open Source
                            </button>
                            <Link
                              href={`/wells/${cite.well.replace(' ', '-').toUpperCase()}`}
                              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[10px]"
                              title="View Well"
                            >
                              View Well
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Grounding Confidence: 96.4%</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#060c18] border border-cyan-800 flex items-center justify-center text-cyan-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#091122] border border-slate-800 text-xs text-slate-300 flex items-center gap-2 font-mono">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Cross-referencing 1,284 reports across 146 offset wells for geomechanical precedents...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. SUGGESTED QUESTIONS STRIP */}
      <div className="px-4 py-2.5 border-t border-slate-800/80 bg-[#070c17] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold shrink-0 flex items-center gap-1">
          <Lightbulb className="h-3 w-3 text-amber-400" />
          <span>Quick Prompts:</span>
        </span>
        <div className="flex items-center gap-1.5">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-full bg-[#0a1224] hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors cursor-pointer font-mono"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 5. INPUT BOX */}
      <div className="p-4 border-t border-slate-800 bg-[#060a14]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask questions about historical wells, drilling events and operational knowledge…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-[#0a1122] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
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
