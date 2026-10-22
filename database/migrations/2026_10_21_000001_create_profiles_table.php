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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->text('bio')->nullable();
            $table->string('education_level')->nullable()->index();
            $table->string('field_of_study')->nullable();
            $table->string('institution')->nullable();
            $table->unsignedSmallInteger('graduation_year')->nullable();
            $table->string('target_role')->nullable()->index();
            $table->json('skills')->nullable();
            $table->json('interests')->nullable();
            $table->string('location')->nullable();
            $table->string('preferred_language', 10)->default('en');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
