<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReinscriptionFormation extends Model
{
    use HasFactory;

    protected $table = 'reinscriptions_formation';

    protected $fillable = [
        'no_inscrit',
        'anciens_parcours',
        'nouveau_parcours',
        'ancienne_annee_etude',
        'nouvelle_annee_etude',
        'annee_scolaire',
        'date_reinscription',
        'user_id',
    ];

    protected $casts = [
        'anciens_parcours' => 'array',
        'date_reinscription' => 'datetime',
    ];

    /**
     * Relation avec la nouvelle inscription.
     */
    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'no_inscrit', 'no_inscrit');
    }

    /**
     * Relation avec l'utilisateur qui a effectué la réinscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}