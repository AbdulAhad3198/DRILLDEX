'use client';

import React from 'react';
import { OffsetWell } from '@/lib/data';
import { ChevronRight, ArrowRight, FileText } from 'lucide-react';

interface OffsetWellsTableProps {
  wells: OffsetWell[];
  selectedWellId?: string;
  onSelectWell: (well: OffsetWell) => void;
  onViewAll?: () => void;
  onOpenDoc?: (docName: string) => void;
}

export function OffsetWellsTable({
  wells,
  selectedWellId,
  onSelectWell,
  onViewAll,
  onOpenDoc,
}: OffsetWellsTableProps) {
  return (
    <div className="flex flex-col h-full rounded-lg bg-[#0b1324] border border-slate-800 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-[#0c1629]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase">
            Offset Wells Intelligence
          </h2>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 font-medium bg-[#080e1b]/50">
              <th className="py-2 px-3">Well Name</th>
              <th className="py-2 px-2.5">Distance</th>
              <th className="py-2 px-2.5">Formation</th>
              <th className="py-2 px-3">Last Event</th>
              <th className="py-2 px-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {wells.map((well) => {
              const isSelected = selectedWellId === well.id;
              const primaryIncident = well.incidents[0];

              return (
                <tr
                  key={well.id}
                  onClick={() => onSelectWell(well)}
                  className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-950/40 border-l-2 border-cyan-400' : ''
                  }`}
                >
                  {/* Well Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          primaryIncident?.severity === 'Critical' || primaryIncident?.severity === 'High'
                            ? 'bg-rose-500'
                            : primaryIncident?.severity === 'Medium'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-semibold text-slate-200 font-sans">
                        {well.name}
                      </span>
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="py-2.5 px-2.5 text-slate-300 whitespace-nowrap">
                    {well.distanceKm} km
                  </td>

                  {/* Formation */}
                  <td className="py-2.5 px-2.5">
                    <span className="text-slate-300 font-semibold">{well.formation}</span>
                  </td>

                  {/* Last Event */}
                  <td className="py-2.5 px-3">
                    {primaryIncident ? (
                      <div className="leading-tight">
                        <span
                          className={`font-semibold ${
                            primaryIncident.severity === 'Critical' || primaryIncident.severity === 'High'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {primaryIncident.type}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1">
                          ({primaryIncident.depth.toLocaleString()} m)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-400 font-sans">
                        <span>No Major Issue</span>
                        <span className="text-slate-500">(-)</span>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWell(well);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-[#080e1b] flex items-center justify-between text-[10px] text-slate-400">
        <span>Similarity indexed by stratigraphic depth & fault block</span>
        <span className="text-cyan-400 font-mono">Makum Reservoir Basin</span>
      </div>
    </div>
  );
}
