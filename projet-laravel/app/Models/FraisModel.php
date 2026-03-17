<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraisModel extends Model
{
    use HasFactory;
    protected $table = 'frais';
    protected $primaryKey = 'idfrais';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [ 'idfrais', 'nomfrais', 'montant' ];
}
