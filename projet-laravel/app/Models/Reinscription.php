<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reinscription extends Model
{
    use HasFactory;

    protected $table = 'reinscriptions';

    protected $fillable = [
        'no_inscrit',
        'ancien_code_niveau',
        'nouveau_code_niveau',
        'annee_scolaire',
        'date_reinscription',
        'user_id',
        'classe',
    ];

    protected $casts = [
        'date_reinscription' => 'datetime',
    ];

    /**
     * Relation avec l'inscription concernée.
     */
    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'no_inscrit', 'no_inscrit');
    }

    /**
     * Relation avec l'ancien niveau (nullable).
     */
    public function ancienNiveau()
    {
        return $this->belongsTo(Niveau::class, 'ancien_code_niveau', 'code_niveau');
    }

    /**
     * Relation avec le nouveau niveau.
     */
    public function nouveauNiveau()
    {
        return $this->belongsTo(Niveau::class, 'nouveau_code_niveau', 'code_niveau');
    }

    /**
     * Relation avec l'utilisateur qui a effectué la réinscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}