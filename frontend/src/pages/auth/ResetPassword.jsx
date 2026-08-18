import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, KeyRound } from 'lucide-react';

const resetSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string().min(8, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

export const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(data);
      toast.success('Password berhasil diperbarui! Silakan login kembali.');
      navigate('/login');
    } catch (err) {
      toast.error('Gagal memperbarui password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white font-sans">Reset Password Baru</h2>
        <p className="text-xs text-slate-400 mt-1">Buat kata sandi baru untuk akun Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email Akun" type="email" icon={Mail} placeholder="email@stmikbandung.ac.id" error={errors.email?.message} {...register('email')} />
        <Input label="Password Baru" type="password" icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Input label="Konfirmasi Password Baru" type="password" icon={Lock} placeholder="••••••••" error={errors.password_confirmation?.message} {...register('password_confirmation')} />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading} icon={KeyRound}>
          Simpan Password Baru
        </Button>
      </form>
    </div>
  );
};
