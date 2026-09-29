'use client';

import React from 'react';
import { OffsetWell } from '@/lib/data';
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SimilarWellsSummaryProps {
  wells: OffsetWell[];
  onSelectWell: (well: OffsetWell) => void;
  onViewAll?: () => void;
}

export function SimilarWellsSummary({
  wells,
  onSelectWell,
  onViewAll,
}: SimilarWellsSummaryProps) {
  // Sort by similarity descending
  const sorted = [...wells].sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 3);

  return (
    <div className="flex flex-col h-full rounded-lg bg-[#0b1324] border border-slate-800 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-bold text-white tracking-wide uppercase">
          Similar Historical Wells
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-medium font-sans">
              <th className="pb-1.5 font-semibold">Well</th>
              <th className="pb-1.5 font-semibold">Event</th>
              <th className="pb-1.5 font-semibold">Depth (m)</th>
              <th className="pb-1.5 font-semibold text-right">Similarity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {sorted.map((well) => {
              const primaryIncident = well.incidents[0];
              const score = well.similarityScore;

              return (
                <tr
                  key={well.id}
                  onClick={() => onSelectWell(well)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-2 font-sans font-bold text-slate-200">
                    {well.name}
                  </td>
                  <td className="py-2">
                    <span
                      className={`text-[10px] font-semibold ${
                        primaryIncident?.severity === 'Critical' || primaryIncident?.severity === 'High'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {primaryIncident ? primaryIncident.type : 'Normal'}
                    </span>
                  </td>
                  <td className="py-2 text-slate-300">
                    {primaryIncident ? primaryIncident.depth.toLocaleString() : well.totalDepth.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${
                            score >= 90
                              ? 'bg-cyan-400'
                              : score >= 85
                              ? 'bg-teal-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="font-bold text-cyan-400">{score}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>RAG Embedding correlation</span>
        <span className="text-slate-400">Cosine metric: 0.92</span>
      </div>
    </div>
  );
}
