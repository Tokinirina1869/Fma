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
        Schema::create('reinscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('no_inscrit');
            $table->string('ancien_code_niveau', 7)->nullable();
            $table->string('nouveau_code_niveau', 7);
            $table->string('annee_scolaire', 20);
            $table->timestamp('date_reinscription')->useCurrent();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();

            $table->foreign('no_inscrit')
                ->references('no_inscrit')
                ->on('inscriptions')
                ->onDelete('cascade');
            $table->foreign('ancien_code_niveau')
                ->references('code_niveau')
                ->on('niveaux');
            $table->foreign('nouveau_code_niveau')
                ->references('code_niveau')
                ->on('niveaux');
            $table->foreign('user_id')
                ->references('id')
                ->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reinscriptions');
    }
};
