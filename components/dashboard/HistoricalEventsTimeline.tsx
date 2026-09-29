'use client';

import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  Flame, 
  Compass, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { HISTORICAL_TIMELINE_EVENTS, TimelineEvent } from '@/lib/data';

interface HistoricalEventsTimelineProps {
  currentDepth: number;
  onSelectEvent?: (event: TimelineEvent) => void;
  onOpenDoc?: (docName: string) => void;
}

export function HistoricalEventsTimeline({
  currentDepth,
  onSelectEvent,
  onOpenDoc,
}: HistoricalEventsTimelineProps) {
  return (
    <div className="flex flex-col h-full rounded-lg bg-[#0b1324] border border-slate-800 p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
            Depth-Indexed Historical Events Timeline
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Approaching Offset Intervals in Formation X
        </span>
      </div>

      {/* Horizontal / Flowing Timeline */}
      <div className="flex-1 overflow-x-auto py-1">
        <div className="flex items-stretch gap-2.5 min-w-[700px]">
          {HISTORICAL_TIMELINE_EVENTS.map((item, idx) => {
            const isCurrentWell = item.category === 'current';
            const isPast = item.depth <= currentDepth && !isCurrentWell;
            const isAhead = item.depth > currentDepth;

            // Visual styles for distinct event types
            let badgeBg = 'bg-slate-900 border-slate-700 text-slate-300';
            let icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;

            if (item.category === 'current') {
              badgeBg = 'bg-blue-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/60 ring-2 ring-cyan-500/30';
              icon = <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />;
            } else if (item.type === 'Formation change') {
              badgeBg = 'bg-indigo-950/70 border-indigo-700/60 text-indigo-300';
              icon = <Layers className="h-3.5 w-3.5 text-indigo-400" />;
            } else if (item.type === 'Stuck pipe') {
              badgeBg = 'bg-purple-950/80 border-purple-600/70 text-purple-300';
              icon = <AlertTriangle className="h-3.5 w-3.5 text-purple-400" />;
            } else if (item.type === 'Mud loss') {
              badgeBg = 'bg-rose-950/80 border-rose-600/70 text-rose-300';
              icon = <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
            } else if (item.type === 'High torque') {
              badgeBg = 'bg-amber-950/80 border-amber-600/70 text-amber-300';
              icon = <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
            }

            return (
              <div
                key={idx}
                onClick={() => onSelectEvent && onSelectEvent(item)}
                className={`flex-1 min-w-[130px] p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrentWell 
                    ? 'bg-gradient-to-b from-blue-950/70 to-[#070e1c] border-cyan-400 shadow-md shadow-cyan-950/40' 
                    : isAhead
                    ? 'bg-[#091122] hover:bg-[#0e1933] border-slate-800 hover:border-slate-700'
                    : 'bg-[#080d19]/80 border-slate-800/80 opacity-80'
                }`}
              >
                <div>
                  {/* Depth Badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white tracking-tight">
                      {item.depth.toLocaleString()} m
                    </span>
                    {icon}
                  </div>

                  {/* Title */}
                  <h4 className={`text-xs font-bold leading-tight ${
                    isCurrentWell ? 'text-cyan-300' : 'text-slate-100'
                  }`}>
                    {item.title}
                  </h4>

                  {/* Subtitle / Well note */}
                  {item.well && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {item.well}
                    </span>
                  )}

                  <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Status Indicator at bottom */}
                <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono">
                  {isCurrentWell ? (
                    <span className="text-cyan-400 font-bold uppercase animate-pulse">ACTIVE BIT POSITION</span>
                  ) : isAhead ? (
                    <span className="text-amber-400">+{item.depth - currentDepth} m ahead</span>
                  ) : (
                    <span className="text-slate-500">Interval Passed</span>
                  )}
                  <ChevronRight className="h-2.5 w-2.5 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
