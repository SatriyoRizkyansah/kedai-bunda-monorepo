<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Menampilkan daftar user (hanya super_admin)",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Daftar user berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil data user"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Super Admin"),
     *                     @OA\Property(property="email", type="string", example="admin@kedaibunda.com"),
     *                     @OA\Property(property="role", type="string", example="super_admin"),
     *                     @OA\Property(property="aktif", type="boolean", example=true),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     )
     * )
     *
     * Menampilkan daftar user (hanya super_admin)
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil data user',
            'data' => $users
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{id}",
     *     summary="Menampilkan detail user",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID User",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail user berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Berhasil mengambil detail user"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Super Admin"),
     *                 @OA\Property(property="email", type="string", example="admin@kedaibunda.com"),
     *                 @OA\Property(property="role", type="string", example="super_admin"),
     *                 @OA\Property(property="aktif", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User tidak ditemukan",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="User tidak ditemukan")
     *         )
     *     )
     * )
     *
     * Menampilkan detail user
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'User tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Berhasil mengambil detail user',
            'data' => $user
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Mengupdate user (hanya super_admin)",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID User",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         description="Data user yang ingin diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="nama", type="string", example="Admin Updated"),
     *             @OA\Property(property="email", type="string", format="email", example="admin.updated@kedaibunda.com"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="role", type="string", enum={"super_admin", "admin"}, example="admin")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="User berhasil diupdate"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User tidak ditemukan"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validasi gagal"
     *     )
     * )
     *
     * Mengupdate user
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'User tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:super_admin,admin'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['nama', 'email', 'role']);
        
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'sukses' => true,
            'pesan' => 'User berhasil diupdate',
            'data' => $user
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Menghapus user (hanya super_admin)",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID User",
     *         required=true,
     *         @OA\Schema(type="integer", example=2)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User berhasil dihapus",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="User berhasil dihapus")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Tidak dapat menghapus akun sendiri",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Tidak dapat menghapus akun sendiri")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User tidak ditemukan"
     *     )
     * )
     *
     * Menghapus user
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'User tidak ditemukan'
            ], 404);
        }

        // Tidak bisa hapus diri sendiri
        if ($user->id === auth()->id()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Tidak dapat menghapus akun sendiri'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'User berhasil dihapus'
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/users/profil",
     *     summary="Update profil sendiri",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         description="Data profil yang ingin diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="nama", type="string", example="Nama Baru"),
     *             @OA\Property(property="email", type="string", format="email", example="email.baru@kedaibunda.com"),
     *             @OA\Property(property="password_lama", type="string", format="password", example="oldpassword", description="Required jika ingin ganti password"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profil berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Profil berhasil diupdate"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Password lama tidak sesuai",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=false),
     *             @OA\Property(property="pesan", type="string", example="Password lama tidak sesuai")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validasi gagal"
     *     )
     * )
     *
     * Update profil sendiri
     */
    public function updateProfil(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password_lama' => 'required_with:password|string',
            'password' => 'sometimes|string|min:6|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['nama', 'email']);

        // Update password jika diminta
        if ($request->has('password')) {
            if (!Hash::check($request->password_lama, $user->password)) {
                return response()->json([
                    'sukses' => false,
                    'pesan' => 'Password lama tidak sesuai'
                ], 400);
            }
            
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Profil berhasil diupdate',
            'data' => $user
        ]);
    }
}
