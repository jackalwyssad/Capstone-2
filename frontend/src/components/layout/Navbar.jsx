import React from 'react';
import { Menu, Sun, Moon, Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate } from 'react-router-dom';

/**
 * Komponen Navbar Layout Topbar Glassmorphism
 * Berisi tombol hamburger mobile, indikator nama user login, toggle tema, dan profil dropdown.
 */
export const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Sistem Informasi Perwalian Academic STMIK Bandung
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tahun Akademik 2025/2026 Ganjil
          </span>
        </div>
      </div>

      {/* Right Topbar User Profile & Dark Mode */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Info Capsule */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-primary-600 font-semibold dark:text-primary-400">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-primary-600/20 hover:scale-105 transition-transform"
          >
            {user?.name ? user.name.charAt(0) : 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};
