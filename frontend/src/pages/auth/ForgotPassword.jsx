import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Send } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data);
      toast.success('Permintaan reset password dikirim! Silakan periksa email Anda.');
    } catch (err) {
      toast.error('Email tidak ditemukan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white font-sans">Lupa Password?</h2>
        <p className="text-xs text-slate-400 mt-1">Masukkan email terdaftar untuk mengatur ulang kata sandi Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email Terdaftar" type="email" icon={Mail} placeholder="email@stmikbandung.ac.id" error={errors.email?.message} {...register('email')} />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading} icon={Send}>
          Kirim Link Reset
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Ingat password Anda? <Link to="/login" className="text-primary-400 font-semibold hover:underline">Kembali ke Login</Link>
      </div>
    </div>
  );
};
