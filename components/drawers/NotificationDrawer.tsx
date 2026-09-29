'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  Info,
  ChevronRight,
  Eye,
  Check
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  riskType: string;
  severity: 'High Priority' | 'Medium Priority' | 'Low Priority';
  well: string;
  depth: string;
  interval: string;
  timestamp: string;
  reason: string;
  evidenceCount: number;
  status: 'New' | 'Acknowledged' | 'Under Review' | 'Resolved';
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onAcknowledge: (id: string) => void;
  onOpenDoc?: (docName: string) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onAcknowledge,
  onOpenDoc,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.status === 'New').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#080d19] border-l border-cyan-800/80 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-[#060a14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-rose-950/90 border border-rose-600 flex items-center justify-center text-rose-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Active Risk Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                    {unreadCount} NEW
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time geomechanical risk advisories & offset alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-900/60 text-[11px] text-amber-200 flex items-start gap-2 font-mono">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Alerts provide decision support recommendations. Final operational control remains with the drilling engineer.
          </span>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((item) => {
            const isHigh = item.severity === 'High Priority';
            const isNew = item.status === 'New';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                  isHigh
                    ? 'bg-[#0e1222] border-rose-800/80 shadow-lg'
                    : 'bg-[#091122] border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      isHigh
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {item.severity}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    isNew ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-white font-mono flex items-center gap-1.5">
                    <AlertTriangle className={`h-3.5 w-3.5 ${isHigh ? 'text-rose-400' : 'text-amber-400'}`} />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
                    {item.reason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  <div className="p-1.5 rounded bg-[#060a14] border border-slate-800/80">
                    <span className="text-slate-400 block font-sans">Depth:</span>
                    <strong className="text-white text-[11px]">{item.depth}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-[#060a14] border border-slate-800/80">
                    <span className="text-slate-400 block font-sans">Interval:</span>
                    <strong className="text-rose-300 text-[11px]">{item.interval}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                  <span className="text-slate-400">
                    Evidence: <strong className="text-cyan-300">{item.evidenceCount} offset wells</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isNew && (
                      <button
                        onClick={() => onAcknowledge(item.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    <Link
                      href="/alerts"
                      onClick={onClose}
                      className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060a14] flex items-center justify-between">
          <Link
            href="/alerts"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Go to Global Alert Center (/alerts)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
