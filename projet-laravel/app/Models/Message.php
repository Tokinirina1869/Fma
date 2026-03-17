<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'user_id',
        'content',
        'seen',
        'edited',
    ];

    protected $casts = [
        'seen'      => 'boolean',
        'edited'    => 'boolean',
    ];

    /**
     * L'auteur du message.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * La conversation à laquelle appartient ce message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}