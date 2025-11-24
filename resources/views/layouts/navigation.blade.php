<nav x-data="{ open: false }" class="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
    <!-- Primary Navigation Menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('dashboard') }}" class="text-2xl font-bold text-white hover:text-red-100 transition">
                        Kedai Bunda
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden md:ml-10 md:flex md:space-x-1">
                    <a href="{{ route('dashboard') }}" class="px-4 py-2 rounded-md text-sm font-medium {{ request()->routeIs('dashboard') ? 'bg-red-800 text-white' : 'text-red-100 hover:bg-red-700 hover:text-white' }} transition">
                        <i class="fas fa-home mr-1"></i> Dashboard
                    </a>
                    
                    @if(auth()->user()->isSuperAdmin())
                    <a href="#" class="px-4 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700 hover:text-white transition">
                        <i class="fas fa-box mr-1"></i> Bahan Baku
                    </a>
                    @endif

                    <a href="#" class="px-4 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700 hover:text-white transition">
                        <i class="fas fa-utensils mr-1"></i> Menu
                    </a>

                    <a href="#" class="px-4 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700 hover:text-white transition">
                        <i class="fas fa-cash-register mr-1"></i> Transaksi
                    </a>

                    <a href="#" class="px-4 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700 hover:text-white transition">
                        <i class="fas fa-chart-bar mr-1"></i> Laporan
                    </a>

                    @if(auth()->user()->isSuperAdmin())
                    <a href="#" class="px-4 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700 hover:text-white transition">
                        <i class="fas fa-users mr-1"></i> Pengguna
                    </a>
                    @endif
                </div>
            </div>

            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white hover:text-red-100 focus:outline-none transition ease-in-out duration-150">
                            <div class="text-right mr-3">
                                <div class="font-medium">{{ Auth::user()->name }}</div>
                                <div class="text-xs text-red-200">{{ Auth::user()->role === 'super_admin' ? 'Super Admin' : 'Admin' }}</div>
                            </div>

                            <div class="ms-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile.edit')">
                            <i class="fas fa-user-circle mr-2"></i> Profil
                        </x-dropdown-link>

                        <!-- Authentication -->
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf

                            <x-dropdown-link :href="route('logout')"
                                    onclick="event.preventDefault();
                                                this.closest('form').submit();"
                                    class="text-red-600">
                                <i class="fas fa-sign-out-alt mr-2"></i> Keluar
                            </x-dropdown-link>
                        </form>
                    </x-slot>
                </x-dropdown>
            </div>

            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-red-100 hover:text-white hover:bg-red-700 focus:outline-none focus:bg-red-700 focus:text-white transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            <a href="{{ route('dashboard') }}" class="block px-3 py-2 rounded-md text-base font-medium {{ request()->routeIs('dashboard') ? 'bg-red-800 text-white' : 'text-red-100 hover:bg-red-700' }}">
                <i class="fas fa-home mr-2"></i> Dashboard
            </a>
            @if(auth()->user()->isSuperAdmin())
            <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700">
                <i class="fas fa-box mr-2"></i> Bahan Baku
            </a>
            @endif
            <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700">
                <i class="fas fa-utensils mr-2"></i> Menu
            </a>
            <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700">
                <i class="fas fa-cash-register mr-2"></i> Transaksi
            </a>
            <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700">
                <i class="fas fa-chart-bar mr-2"></i> Laporan
            </a>
            @if(auth()->user()->isSuperAdmin())
            <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700">
                <i class="fas fa-users mr-2"></i> Pengguna
            </a>
            @endif
        </div>

        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-red-800">
            <div class="px-4">
                <div class="font-medium text-base text-white">{{ Auth::user()->name }}</div>
                <div class="font-medium text-sm text-red-200">{{ Auth::user()->email }}</div>
            </div>

            <div class="mt-3 space-y-1">
                <a href="{{ route('profile.edit') }}" class="block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-700">
                    <i class="fas fa-user-circle mr-2"></i> Profil
                </a>

                <!-- Authentication -->
                <form method="POST" action="{{ route('logout') }}">
                    @csrf

                    <button type="submit" class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-red-700">
                        <i class="fas fa-sign-out-alt mr-2"></i> Keluar
                    </button>
                </form>
            </div>
        </div>
    </div>
</nav>
