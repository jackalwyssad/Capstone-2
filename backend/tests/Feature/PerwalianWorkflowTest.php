<?php

namespace Tests\Feature;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Perwalian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Class PerwalianWorkflowTest
 * Feature Test untuk pengajuan perwalian oleh Mahasiswa dan approval/rejection oleh Dosen Wali.
 */
class PerwalianWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'Mahasiswa']);
        Role::create(['name' => 'Dosen']);
    }

    public function test_mahasiswa_can_create_perwalian(): void
    {
        $dosenUser = User::factory()->create();
        $dosenUser->assignRole('Dosen');
        $dosen = Dosen::create([
            'user_id' => $dosenUser->id,
            'nidn' => '04001',
            'nama_lengkap' => 'Dosen Test',
            'gelar' => 'M.T.',
            'email' => 'dosen@test.com',
        ]);

        $mhsUser = User::factory()->create();
        $mhsUser->assignRole('Mahasiswa');
        $mhs = Mahasiswa::create([
            'user_id' => $mhsUser->id,
            'nim' => '321001',
            'nama_lengkap' => 'Mahasiswa Test',
            'prodi' => 'Teknik Informatika',
            'angkatan' => '2022',
            'dosen_wali_id' => $dosen->id,
        ]);

        $response = $this->actingAs($mhsUser, 'sanctum')
            ->postJson('/api/v1/perwalian', [
                'semester' => '2025/2026 Ganjil',
                'ipk_semester' => 3.50,
                'sks_diambil' => 20,
                'matakuliah_rencana' => [
                    ['kode' => 'IF-101', 'nama' => 'Algoritma', 'sks' => 4],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'Pending');
    }
}
