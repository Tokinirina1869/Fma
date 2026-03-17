<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscrit_academies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('no_inscrit');
            $table->string('code_niveau', 50);
            $table->string('type_inscrit', 200);
            $table->timestamps();

            $table->foreign('no_inscrit')->references('no_inscrit')->on('inscriptions')->onDelete('cascade');
            $table->foreign('code_niveau')->references('code_niveau')->on('niveaux')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscrit_academies');
    }
};
