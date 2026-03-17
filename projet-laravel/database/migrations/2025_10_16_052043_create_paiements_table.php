<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->string('no_paie',50)->primary();
            $table->string('idfrais', 255);
            $table->unsignedBigInteger('no_inscrit');
            $table->string('matricule', 50);
            $table->date('datepaie');
            $table->string('modepaie', 50);
            $table->integer('montantpaie');
            $table->text('nomfraispayés')->nullable();
            $table->timestamps();

            $table->foreign('matricule')->references('matricule')->on('personnes')->onDelete('cascade');
            $table->foreign('no_inscrit')->references('no_inscrit')->on('inscriptions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
