<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personne extends Model
{
    use HasFactory;

    protected $table = "personnes";
    protected $primaryKey = 'matricule';
    public $incrementing = false; 
    protected $keyType = 'string';

    protected $fillable = [
        'matricule', 'nom', 'prenom', 'naiss', 'lieunaiss', 'sexe',
        'adresse', 'photo', 'cin', 'datedel', 'lieucin',
        'nompere', 'nommere', 'nomtuteur', 'adressparent', 'adresstuteur',
        'phoneparent', 'phonetuteur'
    ];

    // Une personne peut avoir une inscription
    public function inscription()
    {
        return $this->hasMany(Inscription::class, 'matricule', 'matricule');
    }

    // Relation vers les académies
    public function inscriptionacademique()
    {
        return $this->hasOne(InscriptionAcademie::class, 'no_inscrit', 'no_inscrit');
    }

    // Relation vers les formations
    public function inscriptionformation()
    {
        return $this->hasOne(FormationModel::class, 'no_inscrit', 'no_inscrit');
    }

}

