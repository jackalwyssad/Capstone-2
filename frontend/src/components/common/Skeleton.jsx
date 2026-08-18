import React from 'react';

/**
 * Komponen Reusable Loading Skeleton Screen
 * Memberikan animasi efek placeholder shimmer saat data API sedang di-fetch (TanStack Query loading state).
 */
export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
};
