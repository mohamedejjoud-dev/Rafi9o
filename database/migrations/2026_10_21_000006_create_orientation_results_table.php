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
        Schema::create('orientation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('career_path_id')->constrained()->cascadeOnDelete();
            $table->decimal('match_percentage', 5, 2);
            $table->unsignedTinyInteger('ranking')->default(1);
            $table->text('ai_analysis')->nullable();
            $table->json('strengths')->nullable();
            $table->json('growth_areas')->nullable();
            $table->json('recommendations')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['assessment_attempt_id', 'ranking']);
            $table->index('career_path_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orientation_results');
    }
};
