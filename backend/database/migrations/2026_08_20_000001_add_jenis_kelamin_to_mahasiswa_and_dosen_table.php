<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration untuk menambahkan kolom jenis_kelamin pada tabel mahasiswa dan dosen.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            if (!Schema::hasColumn('mahasiswa', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->default('Laki-laki')->after('nama_lengkap');
            }
        });

        Schema::table('dosen', function (Blueprint $table) {
            if (!Schema::hasColumn('dosen', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->default('Laki-laki')->after('nama_lengkap');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            if (Schema::hasColumn('mahasiswa', 'jenis_kelamin')) {
                $table->dropColumn('jenis_kelamin');
            }
        });

        Schema::table('dosen', function (Blueprint $table) {
            if (Schema::hasColumn('dosen', 'jenis_kelamin')) {
                $table->dropColumn('jenis_kelamin');
            }
        });
    }
};
