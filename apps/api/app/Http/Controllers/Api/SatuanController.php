<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satuan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SatuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Satuan::query();

        // Filter by tipe
        if ($request->has('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        // Filter aktif only
        if ($request->has('aktif')) {
            $query->where('aktif', $request->boolean('aktif'));
        }

        // Filter satuan dasar only
        if ($request->boolean('satuan_dasar_only')) {
            $query->where('is_satuan_dasar', true);
        }

        $satuan = $query->orderBy('tipe')->orderBy('nama')->get();

        return response()->json([
            'sukses' => true,
            'data' => $satuan,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'singkatan' => 'required|string|max:20',
            'tipe' => 'required|in:berat,volume,jumlah',
            'satuan_dasar' => 'nullable|string|max:20',
            'faktor_konversi' => 'required|numeric|min:0',
            'is_satuan_dasar' => 'boolean',
            'aktif' => 'boolean',
        ]);

        $satuan = Satuan::create($validated);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Satuan berhasil ditambahkan',
            'data' => $satuan,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Satuan $satuan): JsonResponse
    {
        return response()->json([
            'sukses' => true,
            'data' => $satuan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Satuan $satuan): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'singkatan' => 'sometimes|string|max:20',
            'tipe' => 'sometimes|in:berat,volume,jumlah',
            'satuan_dasar' => 'nullable|string|max:20',
            'faktor_konversi' => 'sometimes|numeric|min:0',
            'is_satuan_dasar' => 'boolean',
            'aktif' => 'boolean',
        ]);

        $satuan->update($validated);

        return response()->json([
            'sukses' => true,
            'pesan' => 'Satuan berhasil diupdate',
            'data' => $satuan,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Satuan $satuan): JsonResponse
    {
        // Check if satuan is used
        if ($satuan->bahanBaku()->count() > 0 || $satuan->menu()->count() > 0) {
            return response()->json([
                'sukses' => false,
                'pesan' => 'Satuan tidak dapat dihapus karena masih digunakan',
            ], 422);
        }

        $satuan->delete();

        return response()->json([
            'sukses' => true,
            'pesan' => 'Satuan berhasil dihapus',
        ]);
    }

    /**
     * Get satuan grouped by tipe
     */
    public function groupedByTipe(): JsonResponse
    {
        $satuan = Satuan::aktif()
            ->orderBy('nama')
            ->get()
            ->groupBy('tipe');

        return response()->json([
            'sukses' => true,
            'data' => $satuan,
        ]);
    }
}
