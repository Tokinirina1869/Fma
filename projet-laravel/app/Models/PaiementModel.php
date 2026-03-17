<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Assurez-vous d'importer les modèles liés si nécessaire (Personne, Inscription, FraisModel)
use App\Models\Personne;
use App\Models\Inscription;
use App\Models\FraisModel; // Si ce modèle existe

class PaiementModel extends Model
{
    use HasFactory;

    protected $table = 'paiements';
    protected $primaryKey = 'no_paie';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        // Conserver ceci oblige Eloquent à le traiter comme une chaîne
        'idfrais' => 'string',
        'montantpaie' => 'integer',
    ];
    
    protected $fillable = [
        'no_paie', 'no_inscrit', 'idfrais', 'matricule', 'datepaie', 'modepaie', 'montantpaie', 'nomfraispayés'
    ];

    public function personne()
    {
        return $this->belongsTo(Personne::class, 'matricule', 'matricule');
    }

    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'no_inscrit', 'no_inscrit');
    }

    public function fraisAssocies()
    {
        if (empty($this->idfrais)) {
            return collect([]);
        }

        // 🎯 CORRECTION: Nous supposons maintenant que idfrais est une chaîne simple 
        // puisqu'il est une clé étrangère simple dans la migration (TEXT/STRING).
        
        // Si vous avez absolument besoin de traiter plusieurs frais (ce qui contredit une FK simple),
        // alors la migration des paiements devrait utiliser un type ARRAY de Postgres.
        // Pour l'instant, nous considérons idfrais comme une simple chaîne pour résoudre l'erreur FK.
        return FraisModel::where('idfrais', $this->idfrais)->get();
    }


    public function getIdfraisCsvAttribute()
    {
        // Cet accesseur est conservé mais dépend de la logique choisie. 
        // Si idfrais est une chaîne simple, cela renverra [la chaîne]
        return implode(',', (array) $this->idfrais ?? []);
    }

    // 🛑 CORRECTION CLÉ : SUPPRESSION DU MUTATEUR setIdfraisAttribute
    // La suppression de cette méthode empêche l'encapsulation en format tableau {...}
    /*
    public function setIdfraisAttribute($value)
    {
        if (is_string($value)) {
            $value = array_map('trim', explode(',', $value));
        }
        // Conversion en format PostgreSQL text[] qui cause le problème FK
        $this->attributes['idfrais'] = '{' . implode(',', $value) . '}';
    }
    */


    public function setIdfraisCsvAttribute($value)
    {
        // Ce mutateur est conservé mais n'est utilisé que si vous assignez $paiement->idfrais_csv = '...'.
        // Il pourrait encore causer des problèmes si le champ est traité comme tableau.
        $this->idfrais = array_map('trim', explode(',', $value));
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($paiement) {
            // Logique de génération de numéro de paiement séquentiel
            $lastNumber = PaiementModel::selectRaw('MAX(CAST(SUBSTRING(no_paie FROM 3) AS INTEGER)) as max_number')
                ->first()
                ->max_number;

            $number = $lastNumber ? $lastNumber + 1 : 1;
            $paiement->no_paie = 'PE' . str_pad($number, 4, '0', STR_PAD_LEFT);
        });
    }

}