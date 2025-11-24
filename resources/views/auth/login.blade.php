<x-guest-layout>
    <!-- Logo and Title -->
    <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-red-600 mb-2">Kedai Bunda</h1>
        <p class="text-gray-600">Sistem Manajemen Kedai</p>
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" value="Email" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" placeholder="admin@kedaibunda.com" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="mt-4">
            <x-input-label for="password" value="Password" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            name="password"
                            required autocomplete="current-password" 
                            placeholder="********" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-red-600 shadow-sm focus:ring-red-500" name="remember">
                <span class="ms-2 text-sm text-gray-600">Ingat Saya</span>
            </label>
        </div>

        <div class="mt-6">
            <button type="submit" class="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl">
                <i class="fas fa-sign-in-alt mr-2"></i> Masuk
            </button>
        </div>
    </form>

    <!-- Demo Credentials -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-xs text-gray-600 font-semibold mb-2">Demo Akun:</p>
        <div class="text-xs text-gray-500 space-y-1">
            <p><strong>Super Admin:</strong> superadmin@kedaibunda.com / superadmin123</p>
            <p><strong>Admin:</strong> admin@kedaibunda.com / admin123</p>
        </div>
    </div>
</x-guest-layout>
