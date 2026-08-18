import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string().min(8, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

/**
 * Halaman Registrasi Akun Administrator
 */
export const RegisterAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.registerAdmin(data);
      if (res.success) {
        toast.success('Akun Admin berhasil dibuat! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi Admin gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white font-sans">Registrasi Admin Baru</h2>
        <p className="text-xs text-slate-400 mt-1">Khusus pengelola sistem STMIK Bandung</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nama Lengkap" icon={User} placeholder="Administrator STMIK" error={errors.name?.message} {...register('name')} />
        <Input label="Email Official" type="email" icon={Mail} placeholder="admin@stmikbandung.ac.id" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Input label="Konfirmasi Password" type="password" icon={Lock} placeholder="••••••••" error={errors.password_confirmation?.message} {...register('password_confirmation')} />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading} icon={UserPlus}>
          Daftarkan Akun Admin
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Sudah punya akun? <Link to="/login" className="text-primary-400 font-semibold hover:underline">Kembali ke Login</Link>
      </div>
    </div>
  );
};
