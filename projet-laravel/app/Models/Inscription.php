<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscription extends Model
{
    use HasFactory;

    protected $table = 'inscriptions';
    protected $primaryKey = 'no_inscrit';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['matricule', 'dateinscrit', 'anneesco'];

    public function secretaire()
    {
        return $this->belongsTo(User::class, 'secretaire_id');
    }
    
    public function inscriptionformation()
    {
        return $this->hasOne(FormationModel::class, 'no_inscrit', 'no_inscrit');
    }

    public function inscriptionacademique()
    {
        return $this->hasOne(InscriptionAcademie::class, 'no_inscrit', 'no_inscrit');
    }

    public function getNoInscritAttribute($value)
    {
        // Doit retourner la valeur de la colonne no_inscrit (l'ID numérique)
        return $value; 
    }
    public function personne()
    {
        return $this->belongsTo(Personne::class, 'matricule', 'matricule');
    }

    public function parcours()
    {
        return $this->belongsToMany(
            Parcours::class,
            'suivres',
            'no_inscrit',
            'code_formation',
            'no_inscrit',
            'code_formation',
        );
    }

    public function niveau()
    {
        return $this->belongsTo(Niveau::class, 'code_niveau', 'code_niveau');
    }
    
    public function reinscriptions()
    {
        return $this->hasMany(Reinscription::class, 'no_inscrit', 'no_inscrit');
    }
    
}
