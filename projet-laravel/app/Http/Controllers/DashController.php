<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashController extends Controller
{
    public function getGlobalStats()
    {
        try {
            $today = Carbon::today();

            // ==================== TOTAUX GÉNÉRAUX ====================
            $totalGeneral = DB::table('inscriptions')->distinct('no_inscrit')->count('no_inscrit');
            $totalEleve = DB::table('inscrit_academies')->distinct('no_inscrit')->count('no_inscrit');
            $totalFormation = DB::table('inscrit_formations')->distinct('no_inscrit')->count('no_inscrit');
            $totalPaiement = DB::table('paiements')->distinct('no_paie')->count('no_paie');

            // ==================== INSCRIPTIONS AUJOURD'HUI ====================
            $inscritToday = DB::table('inscriptions')
                ->whereDate('dateinscrit', $today)
                ->count();

            $inscritTodayCfp = DB::table('inscriptions as i')
                ->join('inscrit_formations as icfp', 'i.no_inscrit', '=', 'icfp.no_inscrit')
                ->whereDate('i.dateinscrit', $today)
                ->count();

            $inscritTodayLycee = DB::table('inscriptions as i')
                ->join('inscrit_academies as ilyc', 'i.no_inscrit', '=', 'ilyc.no_inscrit')
                ->whereDate('i.dateinscrit', $today)
                ->count();

            // ==================== STATISTIQUES PAR JOUR DE LA SEMAINE (LUNDI -> SAMEDI) ====================
            $startOfWeek = Carbon::now()->startOfWeek();     // Lundi 00:00:00
            $endOfWeek   = Carbon::now()->endOfWeek()->subDay(); // Samedi 23:59:59

            $statsParJour = DB::table('inscriptions as i')
                ->select(
                    DB::raw('EXTRACT(ISODOW FROM i.dateinscrit) as jour_num'),
                    DB::raw('COUNT(DISTINCT i.no_inscrit) as total'),
                    DB::raw('COUNT(DISTINCT icfp.no_inscrit) as cfp'),
                    DB::raw('COUNT(DISTINCT ilyc.no_inscrit) as lycee')
                )
                ->leftJoin('inscrit_formations as icfp', 'i.no_inscrit', '=', 'icfp.no_inscrit')
                ->leftJoin('inscrit_academies as ilyc', 'i.no_inscrit', '=', 'ilyc.no_inscrit')
                ->whereBetween('i.dateinscrit', [$startOfWeek, $endOfWeek])
                ->groupBy(DB::raw('EXTRACT(ISODOW FROM i.dateinscrit)'))
                ->orderBy(DB::raw('EXTRACT(ISODOW FROM i.dateinscrit)'))
                ->get();

            // Mapping des numéros ISO (1=lundi, 7=dimanche) vers les noms français
            $jours = [
                1 => 'Lundi',
                2 => 'Mardi',
                3 => 'Mercredi',
                4 => 'Jeudi',
                5 => 'Vendredi',
                6 => 'Samedi',
                7 => 'Dimanche'
            ];

            $inscriptionsParJour = $statsParJour->map(function ($stat) use ($jours) {
                return [
                    'jour'   => $jours[$stat->jour_num] ?? 'Inconnu',
                    'total'  => (int) $stat->total,
                    'cfp'    => (int) $stat->cfp,
                    'lycee'  => (int) $stat->lycee,
                ];
            })->values(); // ->values() pour réindexer de 0 à n-1

            // ==================== STATISTIQUES DÉMOGRAPHIQUES ====================
            $ageLimit = $today->copy()->subYears(18);

            $mineursGlobal = DB::table('personnes')->where('naiss', '>', $ageLimit)->count();
            $majeursGlobal = DB::table('personnes')->where('naiss', '<=', $ageLimit)->count();

            $repartitionSexe = DB::table('personnes as p')
                ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
                ->groupBy('p.sexe')
                ->select(
                    'p.sexe',
                    DB::raw('COUNT(DISTINCT p.matricule) as total_inscrits')
                )
                ->orderBy('p.sexe')
                ->get();

            // ==================== STATISTIQUES DE PAIEMENT ====================
            $paiementsSemaine = DB::table('paiements')
                ->select(
                    DB::raw("TO_CHAR(DATE_TRUNC('week', datepaie), 'IYYY-IW') as semaine_iso"),
                    DB::raw("MIN(DATE_TRUNC('week', datepaie)) as debut_semaine"),
                    DB::raw("MAX(DATE_TRUNC('week', datepaie) + INTERVAL '6 days') as fin_semaine"),
                    DB::raw("SUM(montantpaie) as montant")
                )
                ->where('datepaie', '>=', now()->subWeeks(4))
                ->groupBy(DB::raw("TO_CHAR(DATE_TRUNC('week', datepaie), 'IYYY-IW')"))
                ->orderBy(DB::raw("MIN(DATE_TRUNC('week', datepaie))"))
                ->get()
                ->sortBy('debut_semaine')
                ->values()
                ->take(4)
                ->map(function ($item, $index) {
                    return [
                        'semaine' => 'Semaine ' . ($index + 1),
                        'periode' => date('d/m', strtotime($item->debut_semaine)) . ' - ' . date('d/m', strtotime($item->fin_semaine)),
                        'montant' => (float) $item->montant,
                        'debut'   => $item->debut_semaine,
                    ];
                });

            $paiementsMois = DB::table('paiements')
                ->select(
                    DB::raw("TO_CHAR(DATE_TRUNC('month', datepaie), 'Month') as mois"),
                    DB::raw('SUM(montantpaie) as montant')
                )
                ->where('datepaie', '>=', now()->subMonths(6))
                ->groupBy(DB::raw("DATE_TRUNC('month', datepaie)"), DB::raw("TO_CHAR(DATE_TRUNC('month', datepaie), 'Month')"))
                ->orderBy(DB::raw("MIN(datepaie)"))
                ->get()
                ->map(function ($item) {
                    return [
                        'mois'    => trim($item->mois), // enlever les espaces éventuels
                        'montant' => (float) $item->montant,
                    ];
                });

            // ==================== FORMATAGE POUR GRAPHIQUES ====================
            $totalAge = $mineursGlobal + $majeursGlobal;
            $ageData = [
                [
                    'categorie'   => 'Mineur',
                    'total'       => $mineursGlobal,
                    'pourcentage' => $totalAge > 0 ? round(($mineursGlobal / $totalAge) * 100, 1) : 0,
                    'label'       => 'Mineur',
                ],
                [
                    'categorie'   => 'Majeur',
                    'total'       => $majeursGlobal,
                    'pourcentage' => $totalAge > 0 ? round(($majeursGlobal / $totalAge) * 100, 1) : 0,
                    'label'       => 'Majeur',
                ],
            ];

            $formattedSexe = $repartitionSexe->map(function ($item) {
                $name = $item->sexe === 'M' ? 'Masculin' : ($item->sexe === 'F' ? 'Féminin' : $item->sexe);
                return [
                    'name'  => $name,
                    'value' => $item->total_inscrits,
                ];
            });

            // ==================== RÉPONSE JSON ====================
            return response()->json([
                'status' => 'success',
                'data'   => [
                    // Totaux généraux
                    'total_general'   => $totalGeneral,
                    'total_eleve'     => $totalEleve,
                    'total_formation' => $totalFormation,
                    'total_paiement'  => $totalPaiement,

                    // Inscriptions aujourd'hui
                    'inscrit_today'        => $inscritToday,
                    'inscrit_today_cfp'    => $inscritTodayCfp,
                    'inscrit_today_lycee'  => $inscritTodayLycee,

                    // Inscriptions par jour de la semaine (lundi -> samedi)
                    'inscriptions_par_jour' => $inscriptionsParJour,

                    // Démographie
                    'mineurs_global' => $mineursGlobal,
                    'majeurs_global' => $majeursGlobal,
                    'age_data'       => $ageData,
                    'sexe_data'      => $formattedSexe,

                    // Paiements
                    'paiements_semaine' => $paiementsSemaine,
                    'paiements_mois'    => $paiementsMois,

                    // Métriques calculées (alias)
                    'total_apprenants' => $totalGeneral,
                    'stats_demographiques' => [
                        'mineurs' => $mineursGlobal,
                        'majeurs' => $majeursGlobal,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur lors du chargement des statistiques globales',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}