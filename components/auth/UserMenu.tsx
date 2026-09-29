'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Settings, ShieldCheck, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative font-mono" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#080d19] border border-slate-800 hover:border-slate-700 transition-colors text-xs text-slate-200 cursor-pointer"
      >
        <div className="h-6 w-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300 font-bold text-[10px]">
          {user.fullName.substring(0, 2).toUpperCase() || 'DE'}
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="font-bold text-white text-[11px] truncate max-w-[130px]">
            {user.email}
          </span>
          <span className="text-[9px] text-cyan-400">
            {user.role}
          </span>
        </div>

        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#091122] border border-slate-800 shadow-2xl p-2 z-50 space-y-2 animate-in fade-in duration-150 text-xs">
          {/* User Info Card */}
          <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase block">Signed in as</span>
            <strong className="text-white text-xs truncate block font-bold">{user.email}</strong>
            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {user.role}
            </span>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-cyan-400" />
              <span>User Profile & Settings</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-400 hover:bg-rose-950/60 hover:text-rose-200 transition-colors cursor-pointer text-left"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
