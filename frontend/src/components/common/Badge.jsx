import React from 'react';
import { getStatusBadgeColor } from '../../utils/formatters';

/**
 * Komponen Reusable Status Badge Pill
 * Menampilkan status ('Pending', 'Disetujui', 'Ditolak') dengan skema warna cerah modern.
 */
export const Badge = ({ status, className = '' }) => {
  const colorStyle = getStatusBadgeColor(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${colorStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {status}
    </span>
  );
};
