<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_forgot_password_and_token_expires_in_5_minutes(): void
    {
        $user = User::factory()->create([
            'email' => 'testmhs@student.stmikbandung.ac.id',
            'password' => bcrypt('OldPassword123'),
        ]);

        // 1. Request Forgot Password
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'testmhs@student.stmikbandung.ac.id',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'testmhs@student.stmikbandung.ac.id',
                    'expires_in_minutes' => 5,
                ],
            ]);

        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', 'testmhs@student.stmikbandung.ac.id')
            ->first();

        $this->assertNotNull($tokenRecord);
        $token = $tokenRecord->token;

        // 2. Verify token is valid within 5 minutes
        $verifyRes = $this->getJson("/api/v1/auth/verify-reset-token?email={$user->email}&token={$token}");
        $verifyRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'valid' => true,
                'expired' => false,
            ]);

        // 3. Reset password successfully
        $resetRes = $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $resetRes->assertStatus(200)
            ->assertJson(['success' => true]);

        // 4. Token should be deleted after use
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $user->email,
        ]);
    }

    public function test_expired_token_after_5_minutes_is_rejected(): void
    {
        $user = User::factory()->create([
            'email' => 'expiredmhs@student.stmikbandung.ac.id',
        ]);

        $token = 'expired-token-12345';
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => Carbon::now()->subMinutes(6), // 6 minutes ago (expired)
        ]);

        // Verification should return 410 Expired
        $verifyRes = $this->getJson("/api/v1/auth/verify-reset-token?email={$user->email}&token={$token}");
        $verifyRes->assertStatus(410)
            ->assertJson([
                'success' => false,
                'expired' => true,
            ]);

        // Attempting to reset should also fail with 410 Expired
        $resetRes = $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $resetRes->assertStatus(410)
            ->assertJson([
                'success' => false,
                'expired' => true,
            ]);
    }
}
