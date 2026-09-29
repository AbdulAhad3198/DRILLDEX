'use client';

import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  AlertTriangle,
  GitCompare,
  BookOpen,
  Activity,
  Bot,
  Settings,
  Flame,
  Info,
  Layers,
  Database,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  alertCount: number;
}

// User Card & Logout
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export function Sidebar({ activeView, setActiveView, alertCount }: SidebarProps) {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'risk-analysis', label: 'Risk Intelligence', icon: ShieldAlert, badge: 1 },
    { id: 'nearby-wells', label: 'Nearby Wells', icon: MapPin },
    { id: 'alerts', label: 'Risk Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'documents', label: 'Document Intelligence', icon: FileText },
    { id: 'well-comparison', label: 'Well Comparison', icon: GitCompare },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-800 bg-[#060a14] min-h-screen text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#080d1a]">
        <div className="flex items-center gap-3">
          {/* Custom Oil Rig / Derrick Emblem */}
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-cyan-900/30 flex items-center justify-center">
            <div className="h-full w-full bg-[#070c18] rounded-[7px] flex items-center justify-center">
              <Flame className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-wider text-white font-sans">DRILLDEX</span>
            </div>
            <p className="text-[10px] text-cyan-400 font-medium tracking-tight">Nearby Wells Intelligence System</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-mono tracking-tight leading-tight">
          From Past Wells to Safer Drilling
        </p>
      </div>

      {/* Philosophy Banner Pill */}
      <div className="mx-3 my-2.5 p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
        <span className="text-cyan-400 font-semibold">eRTMAC</span>: What is happening now.
        <br />
        <span className="text-amber-400 font-semibold">NWIS</span>: What happened before & matters now.
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-2.5 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (item.id === 'documents' && activeView === 'historical-reports');
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-rose-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* System Status & Authenticated User Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080d19] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-semibold text-emerald-400">System Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0.0</span>
        </div>

        {/* Authenticated User Card */}
        <div className="p-2 rounded bg-slate-900/80 border border-slate-800 font-mono space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">USER</span>
            <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
              {user?.role || 'Drilling Engineer'}
            </span>
          </div>

          <p className="text-xs font-bold text-white truncate">
            {user?.email || 'engineer@nwisdemo.com'}
          </p>

          <button
            onClick={() => signOut()}
            className="w-full py-1 px-2 rounded bg-slate-950 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-700 text-slate-300 hover:text-rose-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
          >
            <LogOut className="h-3 w-3 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
