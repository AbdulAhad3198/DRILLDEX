'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(trimmedEmail);
      if (res.success) {
        setMessage(res.message || 'If an account exists for this email, password reset instructions have been sent.');
      } else {
        setError(res.error || 'Unable to process request.');
      }
    } catch {
      setError('Unable to connect to the authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#060a14] text-slate-100 font-sans flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="p-6 md:p-8 rounded-2xl bg-[#091122] border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center border border-cyan-400/30 shrink-0">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Forgot Password
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                NWIS Operations Reset
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/80 flex items-start gap-2.5 text-rose-200 text-xs font-mono">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 flex items-start gap-2.5 text-emerald-200 text-xs font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Registered Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@nwisdemo.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'SENDING LINK...' : 'SEND RESET LINK'}</span>
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono">
            <Link href="/login" className="text-cyan-400 hover:underline flex items-center justify-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
