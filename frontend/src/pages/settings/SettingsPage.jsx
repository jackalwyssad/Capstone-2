import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Sun, Moon, ShieldCheck, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Halaman Pengaturan Aplikasi
 * Mengontrol preferensi tampilan tema (Dark Mode/Light Mode), notifikasi toast, dan manajemen role (khusus Admin).
 */
export const SettingsPage = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Pengaturan Sistem" description="Konfigurasi preferensi tampilan dan akses pengguna." />

      <div className="space-y-6 max-w-3xl">
        {/* Preference Theme */}
        <Card hover={false}>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans flex items-center gap-2">
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            Tampilan & Tema Visual
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-900">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode (Mode Gelap)</p>
              <p className="text-[11px] text-slate-500">Mengubah skema warna antarmuka ke mode gelap Linear/Notion dashboard.</p>
            </div>
            <Button size="sm" variant={isDarkMode ? 'primary' : 'outline'} onClick={toggleDarkMode}>
              {isDarkMode ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </Card>

        {/* Access Role Section for Admin */}
        {hasRole('Admin') && (
          <Card hover={false}>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Kelola Pengguna & Hak Akses (Spatie Permissions)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Administrator dapat mengelola akun pengguna, mengatur ulang password, dan memberikan penetapan role (Admin, Dosen Wali, Mahasiswa).
            </p>
            <Button icon={ShieldCheck} onClick={() => navigate('/settings/users')}>
              Buka Kelola User & Role
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
