import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield } from 'lucide-react';

/**
 * Halaman Profil Pengguna
 * Menampilkan rincian identitas user login dan form update informasi akun.
 */
export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.updateProfile({ name, email, phone_number: phone });
      if (res.success) {
        setUser(res.data);
        toast.success('Profil Anda berhasil diperbarui!');
      }
    } catch (err) {
      toast.error('Gagal memperbarui profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profil Saya" description="Kelola informasi biodata akun Anda" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card Badge */}
        <Card hover={false} className="flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-primary-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-primary-600/30 mb-4">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{user?.name}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-extrabold bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-800">
            Role: {user?.roles?.[0] || 'User'}
          </span>
        </Card>

        {/* Update Profile Form */}
        <Card hover={false} className="md:col-span-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans">
            Informasi Akun
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label="Nama Lengkap" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Official" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Nomor Telepon / WhatsApp" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} />

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
