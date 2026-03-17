<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('parcours', function (Blueprint $table) {
            $table->string('code_formation',50)->primary();
            $table->string('nomformation', 200);
            $table->date('datedebut');
            $table->string('duree');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parcours');
    }
};
