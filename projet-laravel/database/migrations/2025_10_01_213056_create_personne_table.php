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
        Schema::create('personnes', function (Blueprint $table) {
            $table->string('matricule',50)->primary();
            $table->string('nom', 255)->nullable();
            $table->string('prenom', 255)->nullable();
            $table->date('naiss')->nullable();
            $table->string('lieunaiss')->nullable();
            $table->string('sexe', 20)->nullable();
            $table->string('adresse', 255)->nullable();
            $table->string('photo')->nullable();
            $table->string('cin', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->date('datedel', 20)->nullable();
            $table->string('lieucin', 20)->nullable();
            $table->string('nompere', 255)->nullable();
            $table->string('nommere', 255)->nullable();
            $table->string('nomtuteur', 255)->nullable();
            $table->string('adressparent', 100)->nullable();
            $table->string('adresstuteur', 100)->nullable();
            $table->string('phoneparent', 20)->nullable();
            $table->string('phonetuteur', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personnes');
    }
};
