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
        // For MySQL, we need to modify the enum by dropping and recreating the constraint
        // First, get all current data with new default
        Schema::table('users', function (Blueprint $table) {
            // Change the enum to include 'kasir' role
            // For MySQL, we use raw SQL to alter enum values
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin', 'admin', 'kasir') DEFAULT 'admin'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert back to original enum (this will fail if there are kasir users, which is expected)
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin', 'admin') DEFAULT 'admin'");
        });
    }
};
