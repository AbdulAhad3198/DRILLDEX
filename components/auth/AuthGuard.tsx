'use client';

import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // Direct operational access: render main dashboard without authentication gating
  return <>{children}</>;
}
