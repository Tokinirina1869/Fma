<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reinscriptions_formation', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('no_inscrit');
            $table->json('anciens_parcours')->nullable(); // Liste des anciens parcours (noms ou codes)
            $table->string('nouveau_parcours');           // Nom du parcours choisi pour la réinscription
            $table->string('ancienne_annee_etude')->nullable();
            $table->string('nouvelle_annee_etude')->nullable();
            $table->string('annee_scolaire', 20);
            $table->timestamp('date_reinscription')->useCurrent();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();

            $table->foreign('no_inscrit')
                  ->references('no_inscrit')
                  ->on('inscriptions')
                  ->onDelete('cascade');
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reinscriptions_formation');
    }
};