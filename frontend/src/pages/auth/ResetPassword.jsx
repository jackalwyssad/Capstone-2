import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Mail,
  Lock,
  KeyRound,
  AlertTriangle,
  Clock,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(8, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password baru tidak cocok',
    path: ['password_confirmation'],
  });

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  // Verifikasi keabsahan token dan masa berlaku 5 menit pada server
  useEffect(() => {
    if (!token || !email) {
      setIsCheckingToken(false);
      setIsTokenExpired(true);
      setErrorMessage('Tautan reset password tidak valid atau parameter tidak lengkap.');
      return;
    }

    const checkToken = async () => {
      setIsCheckingToken(true);
      try {
        const res = await authService.verifyResetToken(email, token);
        if (res.success && res.valid) {
          setIsTokenExpired(false);
        } else {
          setIsTokenExpired(true);
          setErrorMessage(res.message || 'Link reset password sudah tidak berlaku.');
        }
      } catch (err) {
        setIsTokenExpired(true);
        const serverMsg =
          err.response?.data?.message ||
          'Link reset password ini sudah kadaluarsa (expired lebih dari 5 menit).';
        setErrorMessage(serverMsg);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [token, email]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        email,
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      if (res.success) {
        toast.success('Password berhasil diperbarui! Silakan login dengan kata sandi baru.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.data?.expired || err.response?.status === 410) {
        setIsTokenExpired(true);
        setErrorMessage('Tautan ini telah kadaluarsa saat proses pengiriman. Silakan minta tautan baru.');
        toast.error('Tautan reset password telah kadaluarsa (melebihi 5 menit).');
      } else {
        toast.error(err.response?.data?.message || 'Gagal mengatur ulang password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // State 1: Sedang Memverifikasi Token
  if (isCheckingToken) {
    return (
      <div className="space-y-4 text-center py-4">
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
          <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
          <span>Memverifikasi masa berlaku tautan (5 Menit)...</span>
        </div>
      </div>
    );
  }

  // State 2: Tampilan Ketika Link SUDAH EXPIRED / KADALUARSA (Lebih dari 5 Menit)
  if (isTokenExpired) {
    return (
      <div className="text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center mx-auto text-rose-500 shadow-xl shadow-rose-950/50">
          <Clock className="w-8 h-8 text-rose-400" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-800 mb-2">
            Link Telah Kadaluarsa (Expired)
          </span>
          <h2 className="text-lg font-extrabold text-white font-sans">
            Tautan Reset Password Sudah Tidak Berlaku
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed px-2">
            {errorMessage ||
              'Tautan reset password ini hanya berlaku selama 5 menit. Demi keamanan akun Anda, tautan yang melebihi batas waktu 5 menit dinonaktifkan secara otomatis.'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Solusi Keamanan Akun:</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Silakan ajukan permintaan reset password baru melalui halaman lupa password untuk mendapatkan link aktif terbaru.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to="/forgot-password"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-lg shadow-primary-600/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Minta Link Reset Password Baru</span>
          </Link>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Login</span>
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Token Valid & Masih dalam 5 Menit -> Render Form Reset Password
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white font-sans">Reset Password Baru</h2>
        <p className="text-xs text-slate-400 mt-1">
          Buat kata sandi baru untuk akun <strong className="text-primary-400">{email}</strong>
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Tautan valid! Silakan masukkan kata sandi baru Anda.</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Password Baru"
          type="password"
          icon={Lock}
          placeholder="Minimal 8 karakter..."
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Konfirmasi Password Baru"
          type="password"
          icon={Lock}
          placeholder="Ulangi password baru..."
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={KeyRound}
        >
          Simpan Password Baru
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" />
        <Link to="/login" className="text-primary-400 font-semibold hover:underline">
          Batal & Kembali ke Login
        </Link>
      </div>
    </div>
  );
};
