import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Komponen Reusable Input Text & Form Field
 * Digunakan untuk form pendaftaran, login, dan pencarian data di seluruh UI.
 * Mendukung pesan error validasi Zod / React Hook Form, label, icon Lucide,
 * serta fitur show/hide password built-in.
 */
export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`w-full text-sm rounded-xl border bg-white/80 dark:bg-slate-900/80 px-3.5 py-2.5 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10' : ''
          } ${
            isPassword ? 'pr-10' : ''
          } ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
              : 'border-slate-300 dark:border-slate-700/80 focus:border-primary-600 focus:ring-primary-600/20'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs font-medium text-rose-500 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
