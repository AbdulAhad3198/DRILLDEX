'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Legend
} from 'recharts';
import { DEPTH_DRILLING_PROFILES } from '@/lib/data';
import { Activity, Gauge, TrendingUp, AlertTriangle } from 'lucide-react';

interface DrillingDepthChartsProps {
  currentDepth: number;
}

export function DrillingDepthCharts({ currentDepth }: DrillingDepthChartsProps) {
  const [activeTab, setActiveTab] = useState<'torque' | 'rop' | 'wob' | 'spp' | 'all'>('torque');

  const tabs = [
    { id: 'torque', label: '1. Depth vs Torque', unit: 'kNm', color: '#f59e0b' },
    { id: 'rop', label: '2. Depth vs ROP', unit: 'm/hr', color: '#38bdf8' },
    { id: 'wob', label: '3. Depth vs WOB', unit: 'klbf', color: '#818cf8' },
    { id: 'spp', label: '4. Pressure Trend', unit: 'psi', color: '#10b981' },
    { id: 'all', label: 'Overlay View', unit: 'Multi', color: '#c084fc' },
  ];

  return (
    <div className="flex flex-col h-full rounded-lg bg-[#0b1324] border border-slate-800 p-3.5 space-y-2.5">
      {/* Header & Metric Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
            Technical Drilling Profiles vs Depth
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 bg-[#070c17] p-0.5 rounded border border-slate-800 text-[11px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-header Legend & Risk Interval Indicator */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Current Bit Depth ({currentDepth} m)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-sm bg-rose-500/50 border border-rose-500" />
            Predicted Risk Interval (5,030–5,070 m)
          </span>
        </div>
        <span>Depth Domain: 4,800 m → 5,150 m MD</span>
      </div>

      {/* Recharts Canvas */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DEPTH_DRILLING_PROFILES} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#172238" vertical={false} />
            <XAxis
              dataKey="depth"
              stroke="#64748b"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              domain={[4800, 5150]}
            />

            {/* Dynamic Y Axis domain based on active metric */}
            {activeTab === 'torque' && (
              <YAxis stroke="#f59e0b" fontSize={10} domain={[10, 50]} fontFamily="monospace" tickLine={false} />
            )}
            {activeTab === 'rop' && (
              <YAxis stroke="#38bdf8" fontSize={10} domain={[0, 25]} fontFamily="monospace" tickLine={false} />
            )}
            {activeTab === 'wob' && (
              <YAxis stroke="#818cf8" fontSize={10} domain={[15, 35]} fontFamily="monospace" tickLine={false} />
            )}
            {activeTab === 'spp' && (
              <YAxis stroke="#10b981" fontSize={10} domain={[2800, 3400]} fontFamily="monospace" tickLine={false} />
            )}
            {activeTab === 'all' && (
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 50]} fontFamily="monospace" tickLine={false} />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: '#070c17',
                borderColor: '#1e293b',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#f8fafc',
              }}
            />

            {/* Predicted Risk Interval Warning Zone (5,030 m – 5,070 m) */}
            <ReferenceArea
              x1={5030}
              x2={5070}
              stroke="#ef4444"
              strokeWidth={1}
              strokeOpacity={0.8}
              fill="#ef4444"
              fillOpacity={0.2}
              label={{
                value: 'RISK INTERVAL (5,030–5,070 m)',
                fill: '#fca5a5',
                fontSize: 9,
                position: 'insideTop',
              }}
            />

            {/* Current Bit Depth Vertical Marker Line (4,980 m) */}
            <ReferenceLine
              x={currentDepth}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `BIT: ${currentDepth} m`,
                fill: '#38bdf8',
                fontSize: 9,
                position: 'top',
              }}
            />

            {/* Dynamic Lines */}
            {(activeTab === 'torque' || activeTab === 'all') && (
              <Line
                type="monotone"
                dataKey="torque"
                name="Torque (kNm)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 2 }}
              />
            )}

            {(activeTab === 'rop' || activeTab === 'all') && (
              <Line
                type="monotone"
                dataKey="rop"
                name="ROP (m/hr)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            )}

            {(activeTab === 'wob' || activeTab === 'all') && (
              <Line
                type="monotone"
                dataKey="wob"
                name="WOB (klbf)"
                stroke="#818cf8"
                strokeWidth={1.5}
                dot={false}
              />
            )}

            {activeTab === 'spp' && (
              <Line
                type="monotone"
                dataKey="spp"
                name="SPP (psi)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
