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
        Schema::create('inscrit_formations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('no_inscrit');
            $table->string('duree', 10);
            $table->string('type_formation', 11);
            $table->string('annee_etude')->nullable();
            $table->timestamps();

            $table->foreign('no_inscrit')->references('no_inscrit')->on('inscriptions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscrit_formations');
    }
};
