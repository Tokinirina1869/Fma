<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parcours extends Model
{
    use HasFactory;

    protected $table = 'parcours';
    protected $primaryKey = 'code_formation';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_formation',
        'nomformation',
        'datedebut',
        'duree',
    ];


    public function inscriptions()
    {
        return $this->belongsToMany(
            Inscription::class,
            'suivres',
            'code_formation',
            'no_inscrit'  
        );
    }

    // Parcours.php
    public function personnes()
    {
        return $this->belongsToMany(Personne::class, 'suivres', 'code_formation', 'no_inscrit');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($parcours) {
            if (empty($parcours->code_formation)) {
                $parcours->code_formation = 'CF' . strtoupper(uniqid());
            }
        });
    }
}
