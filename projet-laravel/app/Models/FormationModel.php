<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormationModel extends Model
{
    use HasFactory;
    protected $table = 'inscrit_formations';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'no_inscrit',
        'duree',
        'annee_etude',
        'type_formation',
    ];
    
    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'no_inscrit', 'no_inscrit');
    }
    

    public function parcours()
    {
        return $this->hasManyThrough(
            Parcours::class,
            Suivre::class,          // modèle pivot
            'no_inscrit',           // clé étrangère sur la table "suivres"
            'code_formation',       // clé étrangère sur la table "parcours"
            'no_inscrit',           // clé locale sur "inscrit_formations"
            'code_formation'        // clé locale sur "suivres"
        );
    }

}
