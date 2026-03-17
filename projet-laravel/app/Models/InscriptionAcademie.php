<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InscriptionAcademie extends Model
{
    use HasFactory;

    protected $table = 'inscrit_academies';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'no_inscrit', 'code_niveau', 'type_inscrit'
    ];

    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'no_inscrit', 'no_inscrit');
    }


    public function niveau()
    {
        return $this->belongsTo(Niveau::class, 'code_niveau', 'code_niveau');
    }
    
}
