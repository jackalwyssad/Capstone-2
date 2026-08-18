import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

// Zod Schema Validation Form Login
const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional(),
});

/**
 * Halaman Login Autentikasi Pengguna
 * Menggunakan React Hook Form & Zod Validation. Menghubungkan ke API Sanctum Laravel backend.
 * Menyimpan token Bearer dan data profil user ke Zustand authStore.
 */
export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      if (res.success) {
        setAuth(res.data.user, res.data.token);
        toast.success(`Selamat datang kembali, ${res.data.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white font-sans">Masuk ke Akun Anda</h2>
        <p className="text-xs text-slate-400 mt-1">
          Gunakan email dan password terdaftar STMIK Bandung
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="admin@stmikbandung.ac.id"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              className="rounded border-slate-700 bg-slate-900 text-primary-600 focus:ring-primary-600"
              {...register('rememberMe')}
            />
            <span>Ingat Saya</span>
          </label>
          <Link to="/forgot-password" className="text-primary-400 hover:underline">
            Lupa Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={LogIn}
        >
          Masuk Sekarang
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Akun diberikan oleh Administrator STMIK Bandung.
      </div>
    </div>
  );
};
