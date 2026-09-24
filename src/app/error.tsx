'use client';


import { useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faHome } from '@fortawesome/free-solid-svg-icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50/20 px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-9xl font-black text-red-500/10 select-none">ERR</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-red-600 uppercase tracking-widest">Error</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-black uppercase">Something went wrong!</h2>
          <p className="text-gray-500 font-bold uppercase tracking-tight text-sm">
            We encountered an unexpected error. Don't worry, our team is already on it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button
            onClick={() => reset()}
            className="bg-red-600 text-white font-black px-8 py-4 rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faSync} />
            TRY AGAIN
          </button>
          <Link 
            href="/"
            className="bg-black text-white font-black px-8 py-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faHome} />
            BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
