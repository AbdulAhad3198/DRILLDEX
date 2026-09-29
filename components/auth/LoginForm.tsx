'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Layers, 
  Compass, 
  Activity,
  CheckCircle2
} from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get safe internal redirect target with strict open-redirect protection
  const rawRedirectParam = searchParams ? searchParams.get('redirectTo') : null;
  const rawRedirect = rawRedirectParam ? decodeURIComponent(rawRedirectParam) : null;
  const isSafeRelativePath = (path: string | null): boolean => {
    if (!path) return false;
    return (
      path.startsWith('/') &&
      !path.startsWith('//') &&
      !path.includes('\\') &&
      !path.includes(':')
    );
  };
  const safeRedirectTo = isSafeRelativePath(rawRedirect) ? (rawRedirect as string) : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(trimmedEmail, password);
      if (res.success) {
        router.replace(safeRedirectTo);
        router.refresh();
      } else {
        setError(res.error || 'Unable to sign in right now. Please try again.');
      }
    } catch {
      setError('Unable to connect to the authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#060a14] text-slate-100 font-sans flex items-center justify-center p-4 md:p-8 relative">
      {/* Background Grid & Geological Tech Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: NWIS BRANDING & SYSTEM INFO */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Badge */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/60 border border-cyan-400/30">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                eRTMAC-NWIS
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  OIL ASSAM
                </span>
              </span>
              <p className="text-xs text-slate-400 font-mono">
                Nearby Wells Intelligence System
              </p>
            </div>
          </div>

          {/* Philosophy Banner */}
          <div className="p-4 rounded-xl bg-[#091122] border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Core Operational Philosophy</span>
            </div>
            <p className="text-sm md:text-base font-semibold text-cyan-100 leading-relaxed font-sans">
              “<strong className="text-cyan-300">eRTMAC</strong> tells what is happening now; <strong className="text-amber-300">NWIS</strong> tells what happened before and what may matter now.”
            </p>
          </div>

          {/* 4 Technical Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 flex items-start gap-2.5">
              <Activity className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">AI-POWERED DRILLING</strong>
                <span className="text-[11px] text-slate-400 font-sans">Real-time hazard prediction & depth correlation</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 flex items-start gap-2.5">
              <Compass className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">OFFSET WELL KNOWLEDGE</strong>
                <span className="text-[11px] text-slate-400 font-sans">Indexed historical DDR & WCR report database</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 flex items-start gap-2.5">
              <Layers className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">REAL-TIME RISK CONTEXT</strong>
                <span className="text-[11px] text-slate-400 font-sans">Geomechanical corridor risk alerts</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">EVIDENCE DECISION SUPPORT</strong>
                <span className="text-[11px] text-slate-400 font-sans">Report citations for engineering review</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN CARD */}
        <div className="lg:col-span-5">
          <div className="p-6 md:p-8 rounded-2xl bg-[#091122] border border-slate-800 shadow-2xl space-y-6 relative">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Sign in to your NWIS Drilling Operations account
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/80 flex items-start gap-2.5 text-rose-200 text-xs font-mono animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Email ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@nwisdemo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {/* Bottom Footer Links */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Don&apos;t have an account?</span>
              <Link
                href="/signup"
                className="text-cyan-400 hover:underline font-bold"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
