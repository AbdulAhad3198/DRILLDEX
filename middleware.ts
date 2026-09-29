import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Direct access to eRTMAC-NWIS Operations Dashboard without authentication middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
