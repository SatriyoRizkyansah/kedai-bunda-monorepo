<?php

namespace Tests\Feature\Menu;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuBooleanToggleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_menu_in_bahan_baku_mode(): void
    {
    $user = User::factory()->create(['role' => 'super_admin']);

        $payload = [
            'nama' => 'Menu Bahan',
            'kategori' => 'makanan',
            'harga_jual' => 15000,
            'deskripsi' => 'Menu dengan stok mengikuti bahan baku',
            'tersedia' => 'true',
            'stok' => '0',
            'kelola_stok_mandiri' => 'false',
        ];

        $response = $this
            ->actingAs($user, 'api')
            ->postJson('/api/menu', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('data.kelola_stok_mandiri', false)
            ->assertJsonPath('data.tersedia', true);

        $this->assertDatabaseHas('menu', [
            'nama' => 'Menu Bahan',
            'kelola_stok_mandiri' => 0,
            'tersedia' => 1,
        ]);
    }

    public function test_can_toggle_menu_to_bahan_baku_mode_via_update(): void
    {
    $user = User::factory()->create(['role' => 'super_admin']);

        $menu = Menu::create([
            'nama' => 'Manual Menu',
            'kategori' => 'makanan',
            'harga_jual' => 20000,
            'deskripsi' => null,
            'tersedia' => true,
            'stok' => 10,
            'kelola_stok_mandiri' => true,
        ]);

        $response = $this
            ->actingAs($user, 'api')
            ->putJson("/api/menu/{$menu->id}", [
                'kelola_stok_mandiri' => 'false',
                'tersedia' => 'false',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.kelola_stok_mandiri', false)
            ->assertJsonPath('data.tersedia', false);

        $this->assertDatabaseHas('menu', [
            'id' => $menu->id,
            'kelola_stok_mandiri' => 0,
            'tersedia' => 0,
        ]);
    }
}
