<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversation_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')
                  ->constrained('conversations')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->timestamps();

            // Un utilisateur ne peut être qu'une seule fois dans une conversation
            $table->unique(['conversation_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_user');
    }
};