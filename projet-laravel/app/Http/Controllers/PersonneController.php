<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PersonneController extends Controller
{
    public function mineurs() 
    {
        $today = Carbon::today();
        $ageLimit = $today->copy()->subYears(18);

        $mineurs = DB::table('personnes')
                   ->where('naiss', '>', $ageLimit)
                   ->select('matricule', 'nom', 'naiss')
                   ->orderBy('nom')
                   ->get()
                   ->map(function ($p) use ($today) {
                    $p->age = Carbon::parse($p->naiss)->age;

                    return $p;
                   });

        return response()->json([
            'status' => 'succès',
            'total'  => $mineurs->count(),
            'data'   => $mineurs
        ]);
    }

    public function majeurs()
    {
        $today = Carbon::today();
        $ageLimit = $today->copy()->subYears(18);
        $majeurs = DB::table('personnes')
                  ->where('naiss', '<=', $ageLimit)
                  ->select('matricule', 'nom', 'naiss')
                   ->orderBy('nom')
                   ->get()
                   ->map(function ($p) use ($today) {
                    $p->age = Carbon::parse($p->naiss)->age;

                    return $p;
                   });

        return response()->json([
            'status' => 'succès',
            'total'  => $majeurs->count(),
            'data'   => $majeurs
        ]);
    }

    public function statistiqueMineurMajeur()
    {
        $today = Carbon::today();
        $ageLimit = $today->copy()->subYears(18);
        $mineurs = DB::table('personnes')->where('naiss', '>', $ageLimit)->count();
        $majeurs = DB::table('personnes')->where('naiss', '<=', $ageLimit)->count();

        return response()->json([
            'status'  => 'succès',
            'mineurs' => $mineurs,
            'majeurs' => $majeurs,
        ]);
    }

    public function majeursFormation()
    {
        $today = Carbon::today();
        // Calcule la date de naissance maximale pour avoir 18 ans ou plus.
        $ageLimit = $today->copy()->subYears(18);

        $majeursInscrits = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->join('inscrit_formations as if', 'i.no_inscrit', '=', 'if.no_inscrit')
            ->where('p.naiss', '<=', $ageLimit)
            
            ->select('p.matricule', 'p.nom', 'p.naiss')
            
            ->distinct() 
            
            ->orderBy('p.nom')
            ->get()
            ->map(function ($p) use ($today) {
                // Ajoute l'âge calculé à l'objet
                $p->age = Carbon::parse($p->naiss)->age;
                return $p;
            });

        return response()->json([
            'status' => 'succès',
            'total'  => $majeursInscrits->count(),
            'data'   => $majeursInscrits
        ]);
    }

    public function mineursFormation()
    {
        $today = Carbon::today();
        // Calcule la date de naissance maximale pour avoir 18 ans ou plus.
        $ageLimit = $today->copy()->subYears(18);

        $majeursInscrits = DB::table('personnes as p')
            // 1. Jointure avec la table des inscriptions aux formations
            //    'matricule' est la clé de jointure commune
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->join('inscrit_formations as if', 'i.no_inscrit', '=', 'if.no_inscrit')
            // 2. Critère pour la majorité (date de naissance <= il y a 18 ans)
            ->where('p.naiss', '>', $ageLimit)
            
            // 3. Sélectionnez uniquement les colonnes de la personne
            //    (Utilisez 'personnes.*' pour éviter l'ambiguïté des colonnes)
            ->select('p.matricule', 'p.nom', 'p.naiss')
            
            // 4. Utilisation de distinct pour ne pas compter une personne plusieurs fois 
            //    si elle est inscrite à plusieurs formations
            ->distinct() 
            
            ->orderBy('p.nom')
            ->get();

        return response()->json([
            'status' => 'succès',
            'total'  => $majeursInscrits->count(),
            'data'   => $majeursInscrits
        ]);
    }

    public function LyceeMineurMajeur()
    {
        $today = Carbon::today();
        $ageLimit = $today->copy()->subYears(18);

        $mineurs = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->join('inscrit_academies as if', 'i.no_inscrit', '=', 'if.no_inscrit')
            ->where('p.naiss', '>', $ageLimit)
            ->distinct('p.matricule')
            ->count('p.matricule');

        $majeurs = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->join('inscrit_academies as if', 'i.no_inscrit', '=', 'if.no_inscrit')
            ->where('p.naiss', '<=', $ageLimit)
            ->distinct('p.matricule')
            ->count('p.matricule');

        return response()->json([
            'status'  => 'succès',
            'mineurs' => $mineurs,
            'majeurs' => $majeurs,
        ]);
    }

    public function CfpMineurMajeur()
    {
        $today = Carbon::today();
        $ageLimit = $today->copy()->subYears(18);

        $mineurs = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->join('inscrit_formations as if', 'i.no_inscrit', '=', 'if.no_inscrit')
            ->where('p.naiss', '>', $ageLimit)
            ->distinct('p.matricule')
            ->count('p.matricule');

        $majeurs = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->join('inscrit_formations as if', 'i.no_inscrit', '=', 'if.no_inscrit')
            ->where('p.naiss', '<=', $ageLimit)
            ->distinct('p.matricule')
            ->count('p.matricule');

        return response()->json([
            'status'  => 'succès',
            'mineurs' => $mineurs,
            'majeurs' => $majeurs,
        ]);
    }


    public function FormationParSexe()
    {
        $inscritsParSexe = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            
            ->join('inscrit_formations as if', 'i.no_inscrit', '=', 'if.no_inscrit')
        
            ->groupBy('p.sexe')
            
            ->select(
                'p.sexe', 
                DB::raw('COUNT(DISTINCT p.matricule) as total_inscrits')
            )
            
            ->orderBy('p.sexe')
            ->get();

        return response()->json([
            'status' => 'succès',
            'total_categories' => $inscritsParSexe->count(),
            'data'   => $inscritsParSexe
        ]);
    }
    
    public function ApprenantParSexe()
    {
        $inscritsParSexe = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
        
            ->groupBy('p.sexe')
            
            ->select(
                'p.sexe', 
                DB::raw('COUNT(DISTINCT p.matricule) as total_inscrits')
            )
            
            ->orderBy('p.sexe')
            ->get();

        return response()->json([
            'status' => 'succès',
            'total_categories' => $inscritsParSexe->count(),
            'data'   => $inscritsParSexe
        ]);
    }
    public function LyceeParSexe()
    {
        $inscritsParSexe = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            
            ->join('inscrit_academies as if', 'i.no_inscrit', '=', 'if.no_inscrit')
        
            ->groupBy('p.sexe')
            
            ->select(
                'p.sexe', 
                DB::raw('COUNT(DISTINCT p.matricule) as total_inscrits')
            )
            
            ->orderBy('p.sexe')
            ->get();

        return response()->json([
            'status' => 'succès',
            'total_categories' => $inscritsParSexe->count(),
            'data'   => $inscritsParSexe
        ]);
    }
}
