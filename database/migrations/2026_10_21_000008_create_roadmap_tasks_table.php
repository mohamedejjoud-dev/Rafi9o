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
        Schema::create('roadmap_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('roadmap_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('stage')->default('Phase 1: Foundations')->index();
            $table->unsignedInteger('order')->default(0);
            $table->unsignedSmallInteger('estimated_hours')->default(5);
            $table->json('resource_links')->nullable();
            $table->json('skills_covered')->nullable();
            $table->timestamps();

            $table->index(['roadmap_id', 'stage', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roadmap_tasks');
    }
};
