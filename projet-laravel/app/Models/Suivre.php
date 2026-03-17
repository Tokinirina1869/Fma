<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suivre extends Model
{
    use HasFactory;
    protected $table = 'suivres';

    protected $fillable = [ 'no_inscrit', 'code_formation' ];

    public function inscription()
    {
        return $this->belongsTo(Inscription::class, 'no_inscrit', 'no_inscrit');
    }

    public function parcours() 
    {
        return $this->belongsTo(Parcours::class, 'code_formation', 'code_formation');
    }
}
