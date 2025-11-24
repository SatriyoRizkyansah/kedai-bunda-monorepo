<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * @OA\Info(
 *     title="Kedai Bunda API",
 *     version="1.0.0",
 *     description="API untuk Sistem Kasir dan Manajemen Stok Kedai Bunda",
 *     @OA\Contact(
 *         email="admin@kedaibunda.com"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Local Development Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     type="http",
 *     securityScheme="bearerAuth",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login pengguna",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@kedaibunda.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login berhasil",
     *         @OA\JsonContent(
     *             @OA\Property(property="sukses", type="boolean", example=true),
     *             @OA\Property(property="pesan", type="string", example="Login berhasil"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nama", type="string", example="Super Admin"),
     *                     @OA\Property(property="email", type="string", example="admin@kedaibunda.com"),
     *                     @OA\Property(property="role", type="string", example="super_admin")
     *                 ),
     *                 @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Email atau password salah"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Akun tidak aktif"
     *     )
     * )
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Email atau password salah'
            ], 401);
        }

        $user = auth()->user();

        if (!$user->aktif) {
            auth()->logout();
            return response()->json([
                'sukses' => false,
                'pesan' => 'Akun Anda tidak aktif. Hubungi administrator.'
            ], 403);
        }

        return response()->json([
            'sukses' => true,
            'pesan' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Logout pengguna",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout berhasil"
     *     )
     * )
     */
    public function logout()
    {
        auth()->logout();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Logout berhasil'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/me",
     *     summary="Get data user yang sedang login",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Data user berhasil diambil"
     *     )
     * )
     */
    public function me()
    {
        $user = auth()->user();

        return response()->json([
            'sukses' => true,
            'data' => [
                'id' => $user->id,
                'nama' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'aktif' => $user->aktif,
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/refresh",
     *     summary="Refresh JWT token",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token berhasil di-refresh"
     *     )
     * )
     */
    public function refresh()
    {
        return response()->json([
            'sukses' => true,
            'data' => [
                'token' => auth()->refresh(),
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register user baru (Hanya Super Admin)",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","role"},
     *             @OA\Property(property="name", type="string", example="Admin Baru"),
     *             @OA\Property(property="email", type="string", format="email", example="admin2@kedaibunda.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
     *             @OA\Property(property="role", type="string", enum={"super_admin", "admin"}, example="admin")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User berhasil didaftarkan"
     *     )
     * )
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:super_admin,admin'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'aktif' => true,
        ]);

        return response()->json([
            'sukses' => true,
            'pesan' => 'User berhasil didaftarkan',
            'data' => [
                'id' => $user->id,
                'nama' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201);
    }
}
