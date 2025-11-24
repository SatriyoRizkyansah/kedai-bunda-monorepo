<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login user
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

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Email atau password salah'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'sukses' => true,
            'pesan' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Logout berhasil'
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request)
    {
        return response()->json([
            'sukses' => true,
            'data' => [
                'id' => $request->user()->id,
                'nama' => $request->user()->name,
                'email' => $request->user()->email,
            ]
        ]);
    }

    /**
     * Register user baru (opsional, bisa dibatasi untuk admin saja)
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed'
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
            'password' => Hash::make($request->password)
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'sukses' => true,
            'pesan' => 'Registrasi berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token
            ]
        ], 201);
    }
}
