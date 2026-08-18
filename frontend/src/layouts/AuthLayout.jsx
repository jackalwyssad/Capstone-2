import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

/**
 * Layout Halaman Autentikasi (Login, Reset Password)
 * Mendukung Dark Mode dan Light Mode secara dinamis via themeStore.
 * Menampilkan glassmorphism card dengan background glow yang adaptif.
 */
export const AuthLayout = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-950'
          : 'bg-slate-100'
      }`}
    >
      {/* Dynamic Background Glow Effects */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow ${
          isDarkMode ? 'bg-primary-600/20' : 'bg-primary-400/25'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow ${
          isDarkMode ? 'bg-indigo-600/20' : 'bg-indigo-400/20'
        }`}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo STMIK Bandung Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-white/95 p-2 flex items-center justify-center shadow-glow mb-3">
            <img
              src="/logo-stmik.png"
              alt="Logo STMIK Bandung"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            STMIK BANDUNG
          </h1>
          <p className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sistem Informasi Pencatatan Perwalian Academic Enterprise
          </p>
        </div>

        {/* Auth Content Box */}
        <div
          className={`rounded-3xl p-8 shadow-2xl border transition-colors duration-300 ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl'
              : 'bg-white/90 border-slate-200 backdrop-blur-xl shadow-slate-200'
          }`}
        >
          <Outlet />
        </div>

        {/* Footer info */}
        <p className={`text-center text-xs mt-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          © {new Date().getFullYear()} STMIK Bandung. Hak Cipta Dilindungi.
        </p>
      </motion.div>
    </div>
  );
};
