import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <h1 className="text-4xl font-extrabold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 mb-6 max-w-md text-sm">
        The requested operations view or page could not be located.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
      >
        Return to eRTMAC-NWIS Operations Dashboard
      </Link>
    </div>
  );
}
