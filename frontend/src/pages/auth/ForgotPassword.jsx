import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Send, Clock, ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetData, setResetData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.forgotPassword(data);
      if (res.success) {
        setResetData(res.data);
        toast.success('Link reset password berhasil dikirim ke email Anda!');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        `Email "${data.email}" tidak terdaftar dalam database sistem STMIK Bandung. Silakan periksa kembali email Anda.`;
      setErrorMessage(msg);
      toast.error('Email tidak terdaftar!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white font-sans">Lupa Password?</h2>
        <p className="text-xs text-slate-400 mt-1">
          Masukkan email akun Anda untuk mendapatkan tautan pengaturan ulang kata sandi
        </p>
      </div>

      {/* Tampilan Jika Permintaan Berhasil */}
      {resetData ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Link Reset Password Terkirim!</span>
            </div>
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              Tautan reset password telah diproses dan dikirim ke alamat email{' '}
              <strong className="text-white">{resetData.email}</strong>.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/50 p-2 rounded-xl border border-amber-800/60">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Tautan hanya berlaku selama 5 MENIT dari sekarang.</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center px-2">
            Silakan periksa kotak masuk (inbox) atau folder spam pada email Anda, lalu klik tautan di dalamnya untuk mengatur ulang kata sandi.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setResetData(null);
              setErrorMessage('');
            }}
          >
            Kirim Ulang ke Email Lain
          </Button>
        </div>
      ) : (
        /* Form Input Email dengan Peringatan Jika Email Tidak Terdaftar */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Banner Peringatan Jika Email Tidak Terdaftar */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs space-y-1.5 animate-fadeIn shadow-lg shadow-rose-950/40">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Email Tidak Ditemukan!</span>
              </div>
              <p className="text-[11px] text-rose-200 leading-relaxed">
                {errorMessage}
              </p>
              <div className="pt-1.5 text-[10px] text-rose-300/80 border-t border-rose-900 flex items-start gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  Jika Anda mahasiswa atau dosen baru dan belum memiliki akun terdaftar, silakan hubungi <strong>Bagian IT / Admin Akademik STMIK Bandung</strong> untuk dibuatkan akun.
                </span>
              </div>
            </div>
          )}

          <Input
            label="Email Terdaftar"
            type="email"
            icon={Mail}
            placeholder="contoh: 3200001@student.stmikbandung.ac.id"
            error={errors.email?.message}
            {...register('email')}
            onChange={() => setErrorMessage('')}
          />

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400">
            <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span>
              Tautan reset password akan otomatis aktif selama <strong>5 menit</strong> setelah dikirim.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={Send}
          >
            Kirim Link Reset Password
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Sudah ingat password?</span>
        <Link to="/login" className="text-primary-400 font-semibold hover:underline ml-1">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
};
