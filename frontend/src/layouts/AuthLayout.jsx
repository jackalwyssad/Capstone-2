import React from 'react';
import { Outlet } from 'react-router-dom';
import { School, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Layout Halaman Autentikasi (Login, Register Admin, Reset Password)
 * Memberikan tampilan visual modern dengan gradien Primary Blue, glassmorphism, dan animasi fade.
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

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
          <h1 className="text-xl font-black text-white tracking-tight">
            STMIK BANDUNG
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Sistem Informasi Pencatatan Perwalian Academic Enterprise
          </p>
        </div>

        {/* Auth Content Box */}
        <div className="glass-panel dark rounded-3xl p-8 shadow-2xl border border-slate-800">
          <Outlet />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} STMIK Bandung. Hak Cipta Dilindungi.
        </p>
      </motion.div>
    </div>
  );
};
