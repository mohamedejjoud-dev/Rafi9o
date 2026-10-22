<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('subscription_status')->default('free')->index()->after('role');
            $table->timestamp('premium_activated_at')->nullable()->after('subscription_status');
            $table->timestamp('premium_expires_at')->nullable()->after('premium_activated_at');
            $table->string('subscription_notes')->nullable()->after('premium_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_status',
                'premium_activated_at',
                'premium_expires_at',
                'subscription_notes',
            ]);
        });
    }
};
