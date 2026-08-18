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
}
