'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email ID.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp(trimmedEmail, password, fullName);
      if (res.success) {
        if (res.message) {
          setSuccessMessage(res.message);
        } else {
          router.replace('/dashboard');
          router.refresh();
        }
      } else {
        setError(res.error || 'Unable to create account. Please try again.');
      }
    } catch {
      setError('Unable to connect to the authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#060a14] text-slate-100 font-sans flex items-center justify-center p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="p-6 md:p-8 rounded-2xl bg-[#091122] border border-slate-800 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center border border-cyan-400/30 shrink-0">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Create NWIS Account
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Nearby Wells Intelligence System
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/80 flex items-start gap-2.5 text-rose-200 text-xs font-mono">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 flex items-start gap-2.5 text-emerald-200 text-xs font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Drilling Engineer Name"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Email ID */}
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#060a14] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs font-mono text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
