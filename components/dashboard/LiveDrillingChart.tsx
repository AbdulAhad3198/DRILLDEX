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
  Legend
} from 'recharts';
import { LIVE_DRILLING_TIME_SERIES } from '@/lib/data';
import { Activity, Clock } from 'lucide-react';

interface LiveDrillingChartProps {
  currentDepth: number;
}

export function LiveDrillingChart({ currentDepth }: LiveDrillingChartProps) {
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h'>('6h');
  const [activeChannels, setActiveChannels] = useState({
    rop: true,
    torque: true,
    spp: true,
  });

  return (
    <div className="flex flex-col h-full rounded-lg bg-[#0b1324] border border-slate-800 p-3.5">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase">
            Live Drilling Parameters (eRTMAC Stream)
          </h2>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Channel Toggles */}
          <div className="flex items-center gap-2 text-[10px]">
            <button
              onClick={() => setActiveChannels(prev => ({ ...prev, rop: !prev.rop }))}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                activeChannels.rop
                  ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>ROP</span>
            </button>

            <button
              onClick={() => setActiveChannels(prev => ({ ...prev, torque: !prev.torque }))}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                activeChannels.torque
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Torque</span>
            </button>

            <button
              onClick={() => setActiveChannels(prev => ({ ...prev, spp: !prev.spp }))}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                activeChannels.spp
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>SPP (Pressure)</span>
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => setTimeRange('6h')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                timeRange === '6h' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 6 Hours
            </button>
            <button
              onClick={() => setTimeRange('12h')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                timeRange === '12h' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              12 Hours
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={LIVE_DRILLING_TIME_SERIES} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="monospace"
            />
            {/* Left Y Axis for ROP & Torque */}
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              domain={[0, 30]}
              fontFamily="monospace"
            />
            {/* Right Y Axis for SPP (3,000 - 3,500 psi) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              domain={[3100, 3400]}
              fontFamily="monospace"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#f8fafc',
                fontFamily: 'monospace',
              }}
            />
            {activeChannels.rop && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rop"
                name="ROP (m/hr)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            )}
            {activeChannels.torque && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="torque"
                name="Torque (k·ft-lb)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            )}
            {activeChannels.spp && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="spp"
                name="SPP (psi)"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time WITSML Rig Sensor Data Stream</span>
        </span>
        <span>Latest Sample: 10:30 AM (Depth: {currentDepth.toLocaleString()} m)</span>
      </div>
    </div>
  );
}
