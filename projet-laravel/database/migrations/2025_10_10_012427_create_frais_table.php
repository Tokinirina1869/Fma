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
        Schema::create('frais', function (Blueprint $table) {
            $table->text('idfrais')->primary();
            $table->string('nomfrais', 200);
            $table->integer('montant');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frais');
    }
};
