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
        Schema::create('career_paths', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->string('industry')->index();
            $table->string('average_salary_range')->nullable();
            $table->string('growth_outlook')->nullable();
            $table->json('required_skills')->nullable();
            $table->string('recommended_education')->nullable();
            $table->string('difficulty_level')->default('intermediate');
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('order')->default(0)->index();
            $table->timestamps();

            $table->index(['industry', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_paths');
    }
};
