<?php

namespace Tests\Feature;

use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Class MahasiswaCrudTest
 * Feature Test untuk operasi CRUD Data Mahasiswa oleh Admin.
 */
class MahasiswaCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $role = Role::create(['name' => 'Admin']);
        Role::create(['name' => 'Mahasiswa']);

        $this->adminUser = User::factory()->create(['name' => 'Admin']);
        $this->adminUser->assignRole($role);
    }

    public function test_admin_can_create_mahasiswa(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/mahasiswa', [
                'nim' => '322001',
                'nama_lengkap' => 'Budi Mhs Test',
                'prodi' => 'Teknik Informatika',
                'angkatan' => '2023',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.nim', '322001');

        $this->assertDatabaseHas('mahasiswa', ['nim' => '322001']);
    }

    public function test_generate_nim_for_teknik_informatika_and_sistem_informasi(): void
    {
        // 1. Test IF angkatan 2026 pertama -> harus 1226001
        $resIF1 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/mahasiswa/generate-nim?prodi=Teknik Informatika&angkatan=2026');

        $resIF1->assertStatus(200)
            ->assertJsonPath('data.nim', '1226001');

        // 2. Buat mahasiswa IF dengan NIM 1226001
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/mahasiswa', [
                'nim' => '1226001',
                'nama_lengkap' => 'Mahasiswa IF 1',
                'prodi' => 'Teknik Informatika',
                'angkatan' => '2026',
            ]);

        // 3. Test IF angkatan 2026 kedua -> harus 1226002
        $resIF2 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/mahasiswa/generate-nim?prodi=Teknik Informatika&angkatan=2026');

        $resIF2->assertStatus(200)
            ->assertJsonPath('data.nim', '1226002');

        // 4. Buat mahasiswa IF ke-9 dengan NIM 1226009
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/mahasiswa', [
                'nim' => '1226009',
                'nama_lengkap' => 'Mahasiswa IF 9',
                'prodi' => 'Teknik Informatika',
                'angkatan' => '2026',
            ]);

        // 5. Test IF angkatan 2026 ke-10 -> harus 1226010 (0 di depan tidak terhapus)
        $resIF10 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/mahasiswa/generate-nim?prodi=Teknik Informatika&angkatan=2026');

        $resIF10->assertStatus(200)
            ->assertJsonPath('data.nim', '1226010');

        // 6. Test SI angkatan 2026 pertama -> harus 3226001
        $resSI1 = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/mahasiswa/generate-nim?prodi=Sistem Informasi&angkatan=2026');

        $resSI1->assertStatus(200)
            ->assertJsonPath('data.nim', '3226001');
    }

    public function test_import_mahasiswa_with_auto_nim_and_safe_duplicate_protection(): void
    {
        // 1. Buat mahasiswa awal dengan NIM 1226001 atas nama 'Gita Hidayat'
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/mahasiswa', [
                'nim' => '1226001',
                'nama_lengkap' => 'Gita Hidayat',
                'jenis_kelamin' => 'Perempuan',
                'prodi' => 'Teknik Informatika',
                'angkatan' => '2026',
            ]);

        // 2. Import 3 data:
        //    - Item 1: NIM 1226001 nama 'Budi Santoso' (Nama berbeda / human error) -> HARUS DILEWATI (TIDAK BOLEH MENIMPA DATA GITA HIDAYAT!)
        //    - Item 2: NIM 1226001 nama 'Gita Hidayat' (Nama sama) -> HARUS DIUPDATE (sinkronisasi)
        //    - Item 3: NIM kosong nama 'Rahmat' -> HARUS DIBUAT DENGAN NIM OTOMATIS (1226002)
        $importPayload = [
            'data' => [
                [
                    'nim' => '1226001',
                    'nama_lengkap' => 'Budi Santoso Salah Ketik',
                    'jenis_kelamin' => 'Laki-laki',
                    'prodi' => 'Teknik Informatika',
                    'angkatan' => '2026',
                ],
                [
                    'nim' => '1226001',
                    'nama_lengkap' => 'Gita Hidayat',
                    'jenis_kelamin' => 'Perempuan',
                    'prodi' => 'Teknik Informatika',
                    'angkatan' => '2026',
                    'ipk_terakhir' => 3.85,
                    'sks_lulus' => 72,
                ],
                [
                    'nama_lengkap' => 'Rahmat Baru Tanpa NIM',
                    'jenis_kelamin' => 'Laki-laki',
                    'prodi' => 'Teknik Informatika',
                    'angkatan' => '2026',
                ],
            ],
        ];

        $res = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/mahasiswa/import', $importPayload);

        $res->assertStatus(200)
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.created_count', 1)
            ->assertJsonPath('data.updated_count', 1)
            ->assertJsonPath('data.skipped_count', 1);

        // Verifikasi Gita Hidayat tidak tertimpa oleh Budi Santoso
        $this->assertDatabaseHas('mahasiswa', [
            'nim' => '1226001',
            'nama_lengkap' => 'Gita Hidayat',
            'sks_lulus' => 72,
        ]);
        $this->assertDatabaseMissing('mahasiswa', [
            'nama_lengkap' => 'Budi Santoso Salah Ketik',
        ]);

        // Verifikasi Rahmat terbuat otomatis dengan NIM 1226002
        $this->assertDatabaseHas('mahasiswa', [
            'nim' => '1226002',
            'nama_lengkap' => 'Rahmat Baru Tanpa NIM',
        ]);
    }
}
