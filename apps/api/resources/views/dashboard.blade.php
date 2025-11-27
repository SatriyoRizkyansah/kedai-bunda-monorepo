<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            <i class="fas fa-home mr-2"></i> Dashboard
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Welcome Card -->
            <div class="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 mb-6 text-white">
                <h1 class="text-2xl font-bold mb-2">Selamat Datang, {{ Auth::user()->name }}! 👋</h1>
                <p class="text-red-100">Sistem Manajemen Kedai Bunda - {{ Auth::user()->role === 'super_admin' ? 'Super Admin' : 'Admin' }}</p>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <!-- Total Menu -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total Menu</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">{{ \App\Models\Menu::count() }}</p>
                            <p class="text-green-600 text-sm mt-1">
                                <i class="fas fa-check-circle"></i> {{ \App\Models\Menu::where('tersedia', true)->count() }} Tersedia
                            </p>
                        </div>
                        <div class="bg-red-100 rounded-full p-4">
                            <i class="fas fa-utensils text-red-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Transaksi Hari Ini -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Transaksi Hari Ini</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">{{ \App\Models\Transaksi::whereDate('created_at', today())->count() }}</p>
                            <p class="text-blue-600 text-sm mt-1">
                                <i class="fas fa-chart-line"></i> Status: Selesai
                            </p>
                        </div>
                        <div class="bg-blue-100 rounded-full p-4">
                            <i class="fas fa-cash-register text-blue-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Pendapatan Hari Ini -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Pendapatan Hari Ini</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">Rp {{ number_format(\App\Models\Transaksi::whereDate('created_at', today())->sum('total'), 0, ',', '.') }}</p>
                            <p class="text-green-600 text-sm mt-1">
                                <i class="fas fa-arrow-up"></i> Update Realtime
                            </p>
                        </div>
                        <div class="bg-green-100 rounded-full p-4">
                            <i class="fas fa-money-bill-wave text-green-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Stok Bahan Baku -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Bahan Baku</p>
                            <p class="text-3xl font-bold text-gray-800 mt-2">{{ \App\Models\BahanBaku::count() }}</p>
                            <p class="text-yellow-600 text-sm mt-1">
                                <i class="fas fa-exclamation-triangle"></i> {{ \App\Models\BahanBaku::where('stok_tersedia', '<', 5)->count() }} Stok Rendah
                            </p>
                        </div>
                        <div class="bg-yellow-100 rounded-full p-4">
                            <i class="fas fa-box text-yellow-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Menu Terlaris -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-fire text-red-600 mr-2"></i> Menu Terlaris Hari Ini
                    </h3>
                    @php
                        $menuTerlaris = \App\Models\DetailTransaksi::whereHas('transaksi', function($q) {
                            $q->whereDate('created_at', today());
                        })
                        ->select('menu_id', \DB::raw('SUM(jumlah) as total_terjual'))
                        ->groupBy('menu_id')
                        ->orderBy('total_terjual', 'desc')
                        ->limit(5)
                        ->get();
                    @endphp
                    
                    @if($menuTerlaris->count() > 0)
                        <div class="space-y-3">
                            @foreach($menuTerlaris as $index => $item)
                                @php $menu = \App\Models\Menu::find($item->menu_id); @endphp
                                @if($menu)
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div class="flex items-center space-x-3">
                                        <div class="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                            {{ $index + 1 }}
                                        </div>
                                        <div>
                                            <p class="font-semibold text-gray-800">{{ $menu->nama }}</p>
                                            <p class="text-sm text-gray-500">{{ $menu->kategori }}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold text-red-600">{{ $item->total_terjual }} Porsi</p>
                                        <p class="text-sm text-gray-500">Rp {{ number_format($menu->harga_jual, 0, ',', '.') }}</p>
                                    </div>
                                </div>
                                @endif
                            @endforeach
                        </div>
                    @else
                        <div class="text-center py-8 text-gray-400">
                            <i class="fas fa-chart-line text-4xl mb-2"></i>
                            <p>Belum ada transaksi hari ini</p>
                        </div>
                    @endif
                </div>

                <!-- Stok Bahan Baku Rendah -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i> Peringatan Stok Rendah
                    </h3>
                    @php
                        $stokRendah = \App\Models\BahanBaku::where('stok_tersedia', '<', 10)->orderBy('stok_tersedia', 'asc')->limit(5)->get();
                    @endphp
                    
                    @if($stokRendah->count() > 0)
                        <div class="space-y-3">
                            @foreach($stokRendah as $bahan)
                                <div class="flex items-center justify-between p-3 border-l-4 {{ $bahan->stok_tersedia < 5 ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50' }} rounded">
                                    <div>
                                        <p class="font-semibold text-gray-800">{{ $bahan->nama }}</p>
                                        <p class="text-sm text-gray-600">{{ $bahan->satuan_dasar }}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold {{ $bahan->stok_tersedia < 5 ? 'text-red-600' : 'text-yellow-600' }}">
                                            {{ $bahan->stok_tersedia }} {{ $bahan->satuan_dasar }}
                                        </p>
                                        @if($bahan->stok_tersedia < 5)
                                            <span class="text-xs text-red-600 font-medium">Segera Restock!</span>
                                        @else
                                            <span class="text-xs text-yellow-600 font-medium">Stok Menipis</span>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center py-8 text-gray-400">
                            <i class="fas fa-check-circle text-4xl mb-2 text-green-400"></i>
                            <p class="text-green-600 font-medium">Semua stok aman!</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-bolt text-yellow-500 mr-2"></i> Aksi Cepat
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="#" class="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition group">
                        <i class="fas fa-plus-circle text-red-600 text-3xl mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-sm font-medium text-gray-700">Transaksi Baru</span>
                    </a>
                    
                    @if(auth()->user()->isSuperAdmin())
                    <a href="#" class="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition group">
                        <i class="fas fa-box-open text-blue-600 text-3xl mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-sm font-medium text-gray-700">Tambah Bahan</span>
                    </a>
                    @endif
                    
                    <a href="#" class="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition group">
                        <i class="fas fa-utensils text-green-600 text-3xl mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-sm font-medium text-gray-700">Tambah Menu</span>
                    </a>
                    
                    <a href="#" class="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition group">
                        <i class="fas fa-file-alt text-purple-600 text-3xl mb-2 group-hover:scale-110 transition"></i>
                        <span class="text-sm font-medium text-gray-700">Lihat Laporan</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
