import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck,
  History,
  UserCheck,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  School,
} from 'lucide-react';

/**
 * Komponen Sidebar Layout Navigasi Responsive
 * Menampilkan menu navigasi yang secara dinamis disesuaikan dengan Hak Akses Role (Admin, Dosen Wali, Mahasiswa).
 */
export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, hasRole } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigasi menu dinamis per role
  const getNavItems = () => {
    const items = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['Admin', 'Dosen', 'Mahasiswa'],
      },
    ];

    if (hasRole('Admin')) {
      items.push(
        { label: 'Data Mahasiswa', path: '/mahasiswa', icon: GraduationCap, roles: ['Admin'] },
        { label: 'Data Dosen Wali', path: '/dosen', icon: Users, roles: ['Admin'] },
        { label: 'Rekap Perwalian', path: '/perwalian', icon: FileCheck, roles: ['Admin'] },
        { label: 'Kelola User & Role', path: '/settings/users', icon: ShieldCheck, roles: ['Admin'] }
      );
    } else if (hasRole('Dosen')) {
      items.push(
        { label: 'Perwalian Bimbingan', path: '/perwalian', icon: FileCheck, roles: ['Dosen'] },
        { label: 'Mahasiswa Bimbingan', path: '/mahasiswa', icon: GraduationCap, roles: ['Dosen'] },
        { label: 'Riwayat Approval', path: '/riwayat', icon: History, roles: ['Dosen'] }
      );
    } else if (hasRole('Mahasiswa')) {
      items.push(
        { label: 'Pengajuan Perwalian', path: '/perwalian', icon: FileCheck, roles: ['Mahasiswa'] },
        { label: 'Riwayat Bimbingan', path: '/riwayat', icon: History, roles: ['Mahasiswa'] }
      );
    }

    items.push(
      { label: 'Profil Saya', path: '/profile', icon: User, roles: ['Admin', 'Dosen', 'Mahasiswa'] },
      { label: 'Pengaturan', path: '/settings', icon: Settings, roles: ['Admin', 'Dosen', 'Mahasiswa'] }
    );

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay Backdrop Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header Brand STMIK Bandung */}
          <div className="h-16 flex items-center px-5 border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shadow-sm">
              <img
                src="/logo-stmik.png"
                alt="Logo STMIK Bandung"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
                PERWALIAN STMIK
              </h1>
              <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                STMIK BANDUNG
              </p>
            </div>
          </div>

          {/* User Profile Mini Badge */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 font-bold flex items-center justify-center text-sm border border-primary-300 dark:border-primary-800">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'User'}
              </p>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-primary-600 text-white">
                {user?.roles?.[0] || 'User'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/settings' || item.path === '/dashboard'}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions Sidebar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800">
              {isDarkMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
