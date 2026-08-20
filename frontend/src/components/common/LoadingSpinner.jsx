import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Komponen Reusable Loading Spinner dengan animasi halus & varian ukuran.
 * Mendukung inline, centered container, dan full-overlay dengan teks deskripsi.
 */
export const LoadingSpinner = ({
  size = 'md',
  text = 'Memuat data...',
  fullHeight = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-[2.5px]',
    lg: 'w-10 h-10 border-3',
    xl: 'w-14 h-14 border-4',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-6 ${
        fullHeight ? 'min-h-[300px]' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow halo ring */}
        <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-md animate-pulse" />
        
        {/* Animated Spin Icon */}
        <Loader2
          className={`${sizeMap[size] || sizeMap.md} animate-spin text-primary-600 dark:text-primary-400 relative z-10`}
        />
      </div>

      {text && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse tracking-wide font-sans">
          {text}
        </p>
      )}
    </div>
  );
};
