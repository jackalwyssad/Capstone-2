import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Shield,
  GraduationCap,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Camera,
  Upload,
  Check,
  X,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

/**
 * Halaman Profil Pengguna STMIK Bandung
 * Fitur:
 * - Upload file foto profil langsung dari komputer lokal (disimpan di server storage lokal).
 * - Preview foto realtime sebelum diunggah.
 * - Informasi akun, jenis kelamin, dan kartu "Profil Dosen Wali Anda" untuk Mahasiswa.
 */
export const ProfilePage = () => {
  const { user, setUser, hasRole } = useAuthStore();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [jenisKelamin, setJenisKelamin] = useState(user?.mahasiswa?.jenis_kelamin || user?.dosen?.jenis_kelamin || 'Laki-laki');
  const [avatar, setAvatar] = useState(user?.avatar || user?.mahasiswa?.foto || user?.dosen?.foto || '');
  const [alamat, setAlamat] = useState(user?.dosen?.alamat || '');
  const [tempatLahir, setTempatLahir] = useState(user?.dosen?.tempat_lahir || '');
  const [tanggalLahir, setTanggalLahir] = useState(user?.dosen?.tanggal_lahir ? user.dosen.tanggal_lahir.slice(0, 10) : '');
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState(user?.dosen?.pendidikan_terakhir || 'S2');
  const [gelar, setGelar] = useState(user?.dosen?.gelar || '');

  // Sinkronisasi data saat user di-store terupdate
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone_number || '');
      setJenisKelamin(user?.mahasiswa?.jenis_kelamin || user?.dosen?.jenis_kelamin || 'Laki-laki');
      setAvatar(user.avatar || user.mahasiswa?.foto || user.dosen?.foto || '');
      setAlamat(user?.dosen?.alamat || '');
      setTempatLahir(user?.dosen?.tempat_lahir || '');
      setTanggalLahir(user?.dosen?.tanggal_lahir ? user.dosen.tanggal_lahir.slice(0, 10) : '');
      setPendidikanTerakhir(user?.dosen?.pendidikan_terakhir || 'S2');
      setGelar(user?.dosen?.gelar || '');
    }
  }, [user]);

  // State File Upload Lokal
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle pemilihan file foto lokal dari komputer
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      toast.error('Harap pilih file gambar (JPG, PNG, WEBP, GIF).');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file foto maksimal adalah 5MB.');
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    toast.info(`Foto "${file.name}" siap diunggah. Klik "Simpan Foto" untuk menyimpan.`);
  };

  // Batalkan pemilihan file
  const handleCancelFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper format URL avatar
  const formatAvatarUrl = (avatarUrl, fallbackName = 'User') => {
    if (!avatarUrl) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackName)}`;
    }
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }
    return `http://127.0.0.1:8000/${avatarUrl.replace(/^\//, '')}`;
  };

  // Unggah foto ke server lokal
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setIsUploadingPhoto(true);
    try {
      const res = await authService.uploadAvatar(selectedFile);
      if (res.success) {
        const updatedUser = res.data.user || res.data;
        const newAvatarUrl = res.data.avatar_url || updatedUser?.avatar;
        setUser(updatedUser);
        setAvatar(newAvatarUrl);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Foto profil berhasil diunggah dan tersimpan!');
        return newAvatarUrl;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploadingPhoto(false);
    }
    return null;
  };

  // Simpan perubahan informasi biodata teks & foto
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalAvatar = avatar;

      // Jika ada file foto yang dipilih, unggah fotonya terlebih dahulu
      if (selectedFile) {
        const uploadedUrl = await handleUploadPhoto();
        if (uploadedUrl) {
          finalAvatar = uploadedUrl;
        }
      }

      const res = await authService.updateProfile({
        name,
        email,
        phone_number: phone,
        jenis_kelamin: jenisKelamin,
        alamat: hasRole('Dosen') ? alamat : undefined,
        tempat_lahir: hasRole('Dosen') ? tempatLahir : undefined,
        tanggal_lahir: hasRole('Dosen') && tanggalLahir ? tanggalLahir : undefined,
        pendidikan_terakhir: hasRole('Dosen') ? pendidikanTerakhir : undefined,
        gelar: hasRole('Dosen') ? gelar : undefined,
        avatar: finalAvatar || user?.avatar || undefined,
      });

      if (res.success) {
        setUser(res.data);
        toast.success('Informasi profil berhasil diperbarui!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsLoading(false);
    }
  };

  // State & Handler Ganti Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Masukkan password Anda saat ini.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password baru minimal harus 8 karakter.');
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      toast.error('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      if (res.success) {
        toast.success('Password Anda berhasil diperbarui! Gunakan password baru ini untuk login berikutnya.');
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirmation('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password. Pastikan password saat ini benar.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // URL display foto avatar
  const currentAvatarUrl =
    previewUrl ||
    formatAvatarUrl(avatar || user?.avatar || user?.mahasiswa?.foto || user?.dosen?.foto, user?.name);

  return (
    <div>
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi biodata akademik, ganti foto profil lokal, dan lihat data pembimbing Anda"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Card Badge & Photo Upload */}
        <Card hover={false} className="flex flex-col items-center text-center p-6">
          <div className="relative group mb-4">
            <img
              src={currentAvatarUrl}
              alt={user?.name}
              className="w-28 h-28 rounded-3xl object-cover border-4 border-primary-500 shadow-xl bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105"
            />
            
            {/* Tombol Kamera Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              title="Ganti Foto Profil dari Komputer"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Ganti Foto</span>
            </button>

            {/* Hidden Input File */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
          </div>

          {/* Action Buttons saat foto dipilih */}
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 mb-3 w-full animate-fadeIn">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  icon={Upload}
                  onClick={handleUploadPhoto}
                  isLoading={isUploadingPhoto}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5"
                >
                  Simpan Foto
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={X}
                  onClick={handleCancelFile}
                  disabled={isUploadingPhoto}
                  className="text-rose-600 text-xs py-1.5"
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs mb-3"
            >
              Pilih Foto dari Komputer
            </Button>
          )}

          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{user?.name}</h3>
          <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
          {user?.mahasiswa?.nim && (
            <p className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 mt-1">
              NIM: {user.mahasiswa.nim}
            </p>
          )}
          {user?.dosen?.nidn && (
            <p className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 mt-1">
              NIDN: {user.dosen.nidn}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300 border border-primary-300 dark:border-primary-800">
              Role: {user?.roles?.[0] || 'User'}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {user?.mahasiswa?.jenis_kelamin || user?.dosen?.jenis_kelamin || jenisKelamin}
            </span>
            {user?.mahasiswa?.prodi && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200">
                {user.mahasiswa.prodi}
              </span>
            )}
          </div>

          {user?.dosen?.alamat && (
            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full text-left">
              <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{user.dosen.alamat}</span>
            </div>
          )}
        </Card>

        {/* Update Profile Form */}
        <Card hover={false} className="md:col-span-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans">
            Informasi Akun & Identitas
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Field Identitas Akademik Terkunci + Jenis Kelamin */}
            {hasRole('Mahasiswa') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                <Input
                  label="NIM (Terkunci)"
                  value={user?.mahasiswa?.nim || '-'}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed"
                />
                <Input
                  label="Program Studi (Terkunci)"
                  value={user?.mahasiswa?.prodi || '-'}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed"
                />
                <Select
                  label="Jenis Kelamin"
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' },
                  ]}
                />
              </div>
            )}

            {hasRole('Dosen') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                <Input
                  label="NIDN (Terkunci)"
                  value={user?.dosen?.nidn || '-'}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed"
                />
                <Input
                  label="Gelar Akademik"
                  value={gelar}
                  onChange={(e) => setGelar(e.target.value)}
                  placeholder="e.g. M.T., M.Kom."
                />
                <Select
                  label="Jenis Kelamin"
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' },
                  ]}
                />
              </div>
            )}

            {!hasRole('Mahasiswa') && !hasRole('Dosen') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Jenis Kelamin"
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' },
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />
              <div>
                <Input
                  label="Alamat Email (Akun Login & Notifikasi)"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@anda.com"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Anda dapat menggunakan email kampus atau email pribadi (misal: @gmail.com).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nomor Telepon / WhatsApp" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                  Unggah File Foto Profil
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 cursor-pointer bg-slate-50 dark:bg-slate-900/60 transition-colors text-xs text-slate-600 dark:text-slate-400"
                >
                  <span className="truncate">
                    {selectedFile ? `File: ${selectedFile.name}` : 'Klik untuk memilih foto dari perangkat Anda (Maks. 5MB)'}
                  </span>
                  <Upload className="w-4 h-4 text-primary-500 flex-shrink-0 ml-2" />
                </div>
              </div>
            </div>

            {/* Input Alamat & Detail Dosen Tambahan */}
            {hasRole('Dosen') && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Data Tambahan & Alamat Domisili
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Tempat Lahir"
                    icon={MapPin}
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    placeholder="Contoh: Bandung"
                  />
                  <Input
                    label="Tanggal Lahir"
                    type="date"
                    icon={Calendar}
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                  />
                  <Select
                    label="Pendidikan Terakhir"
                    value={pendidikanTerakhir}
                    onChange={(e) => setPendidikanTerakhir(e.target.value)}
                    options={[
                      { value: 'S2', label: 'S2 (Magister)' },
                      { value: 'S3', label: 'S3 (Doktor / Ph.D.)' },
                      { value: 'S1', label: 'S1 (Sarjana)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    Alamat Kantor / Domisili
                  </label>
                  <textarea
                    rows={2}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Contoh: Jl. Cikutra No. 113, Coblong, Kota Bandung"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading || isUploadingPhoto}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Card Ganti Password Akun */}
      <Card hover={false} className="mb-6 border-t-4 border-t-amber-500">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 font-sans flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          Ganti Password Akun
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data perwalian STMIK Bandung.
        </p>

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-2xl">
          <div className="relative">
            <Input
              label="Password Saat Ini"
              type={showCurrentPassword ? 'text' : 'password'}
              icon={Lock}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Password Baru"
                type={showNewPassword ? 'text' : 'password'}
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Konfirmasi Password Baru"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={Lock}
                value={newPasswordConfirmation}
                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password baru"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isChangingPassword} icon={KeyRound} className="bg-amber-600 hover:bg-amber-700 text-white">
              Perbarui Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Profil Dosen Wali Anda (Untuk Mahasiswa) */}
      {hasRole('Mahasiswa') && user?.mahasiswa?.dosen_wali && (
        <Card hover={false} className="border-t-4 border-t-primary-600 mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 font-sans flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Profil Dosen Wali Pembimbing Akademik Anda
            </span>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300">
              Dosen Pembimbing
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center sm:items-start gap-2 sm:border-r sm:border-slate-200 dark:sm:border-slate-800 pr-4">
              <img
                src={
                  user.mahasiswa.dosen_wali.foto ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.mahasiswa.dosen_wali.nama_lengkap)}`
                }
                alt={user.mahasiswa.dosen_wali.nama_lengkap}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-500 shadow-md"
              />
              <div className="text-center sm:text-left">
                <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {user.mahasiswa.dosen_wali.nama_lengkap}
                </p>
                <p className="text-primary-600 dark:text-primary-400 font-bold text-xs">
                  NIDN: {user.mahasiswa.dosen_wali.nidn}
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Pendidikan Terakhir
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {user.mahasiswa.dosen_wali.pendidikan_terakhir || '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Jenis Kelamin
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.mahasiswa.dosen_wali.jenis_kelamin || 'Laki-laki'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Official
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.mahasiswa.dosen_wali.email}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.mahasiswa.dosen_wali.no_hp || '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Tempat, Tgl Lahir
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {user.mahasiswa.dosen_wali.tempat_lahir || '-'}{user.mahasiswa.dosen_wali.tanggal_lahir ? `, ${user.mahasiswa.dosen_wali.tanggal_lahir.slice(0, 10)}` : ''}
                </span>
              </div>
              {user.mahasiswa.dosen_wali.alamat && (
                <div className="py-1">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-3.5 h-3.5" /> Alamat Kantor / Domisili
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {user.mahasiswa.dosen_wali.alamat}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
