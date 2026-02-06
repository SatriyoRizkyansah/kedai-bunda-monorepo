<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        // For MySQL, we need to modify the enum by dropping and recreating the constraint
        Schema::table('users', function (Blueprint $table) {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin', 'admin', 'kasir') DEFAULT 'admin'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin', 'admin') DEFAULT 'admin'");
        });
    }
};
