<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = ['name'];

    /**
     * Les utilisateurs participants à cette conversation.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_user')
                    ->withTimestamps();
    }

    /**
     * Tous les messages de cette conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Le dernier message de la conversation (pour la sidebar).
     */
    public function lastMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
}