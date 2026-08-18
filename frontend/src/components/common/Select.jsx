import React from 'react';

/**
 * Komponen Reusable Select Dropdown
 * Digunakan untuk pilihan Prodi, Dosen Wali, Semester, dan Status Filter.
 */
export const Select = React.forwardRef(({
  label,
  error,
  options = [],
  className = '',
  placeholder = 'Pilih opsi...',
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full text-sm rounded-xl border bg-white/80 dark:bg-slate-900/80 px-3.5 py-2.5 transition-all text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 dark:border-slate-700/80 focus:border-primary-600 focus:ring-primary-600/20'
        } ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
