<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashController extends Controller
{
    /**
     * Retourne le début et la fin d'une année scolaire.
     * Convention : l'année scolaire "2024-2025" commence le 01/09/2024 et se termine le 31/08/2025.
     * Si $anneeScolaire est null, on utilise l'année scolaire en cours.
     *
     * @param string|null $anneeScolaire  ex. "2024-2025"
     * @return array{debut: Carbon, fin: Carbon, label: string}
     */
    private function getAnneeScolaireRange(?string $anneeScolaire = null): array
    {
        if ($anneeScolaire) {
            // Format attendu : "YYYY-YYYY"
            [$anneeDebut, $anneeFin] = explode('-', $anneeScolaire);
            $debut = Carbon::createFromDate((int) $anneeDebut, 9, 1)->startOfDay();
            $fin   = Carbon::createFromDate((int) $anneeFin,   8, 31)->endOfDay();
            $label = $anneeScolaire;
        } else {
            // Calcul de l'année scolaire courante
            $now = Carbon::now();
            $anneeDebut = $now->month >= 9 ? $now->year : $now->year - 1;
            $anneeFin   = $anneeDebut + 1;
            $debut = Carbon::createFromDate($anneeDebut, 9, 1)->startOfDay();
            $fin   = Carbon::createFromDate($anneeFin,   8, 31)->endOfDay();
            $label = "$anneeDebut-$anneeFin";
        }

        return ['debut' => $debut, 'fin' => $fin, 'label' => $label];
    }

    /**
     * Retourne la liste des années scolaires disponibles dans la base.
     */
    private function getAnneesDisponibles(): array
    {
        $dates = DB::table('inscriptions')
            ->selectRaw("EXTRACT(YEAR FROM dateinscrit) as annee")
            ->groupByRaw("EXTRACT(YEAR FROM dateinscrit)")
            ->orderByRaw("EXTRACT(YEAR FROM dateinscrit)")
            ->pluck('annee')
            ->map(fn($y) => (int) $y)
            ->toArray();

        $annees = [];
        foreach ($dates as $annee) {
            // Chaque année civile peut appartenir à deux années scolaires
            // On génère l'année scolaire qui démarre cette année-là
            $label = "$annee-" . ($annee + 1);
            if (!in_array($label, $annees)) {
                $annees[] = $label;
            }
        }

        return array_values(array_unique($annees));
    }

    public function getGlobalStats(Request $request)
    {
        try {
            $today = Carbon::today();

            // ══════════════════════════════════════════
            // ANNÉE SCOLAIRE — paramètre optionnel
            // ex: GET /api/stats?annee_scolaire=2024-2025
            // ══════════════════════════════════════════
            $anneeScolaireParam = $request->query('annee_scolaire');
            $as = $this->getAnneeScolaireRange($anneeScolaireParam);
            $debutAS = $as['debut'];
            $finAS   = $as['fin'];
            $labelAS = $as['label'];

            // ══════════════════════════════════════════
            // TOTAUX GÉNÉRAUX — filtrés par année scolaire
            // ══════════════════════════════════════════
            $totalGeneral = DB::table('inscriptions')
                ->whereBetween('dateinscrit', [$debutAS, $finAS])
                ->distinct('no_inscrit')
                ->count('no_inscrit');

            $totalEleve = DB::table('inscrit_academies as ia')
                ->join('inscriptions as i', 'i.no_inscrit', '=', 'ia.no_inscrit')
                ->whereBetween('i.dateinscrit', [$debutAS, $finAS])
                ->distinct('ia.no_inscrit')
                ->count('ia.no_inscrit');

            $totalFormation = DB::table('inscrit_formations as icfp')
                ->join('inscriptions as i', 'i.no_inscrit', '=', 'icfp.no_inscrit')
                ->whereBetween('i.dateinscrit', [$debutAS, $finAS])
                ->distinct('icfp.no_inscrit')
                ->count('icfp.no_inscrit');

            $totalPaiement = DB::table('paiements')
                ->whereBetween('datepaie', [$debutAS, $finAS])
                ->distinct('no_paie')
                ->count('no_paie');

            // ══════════════════════════════════════════
            // INSCRIPTIONS AUJOURD'HUI (pas de filtre AS, c'est "ce jour")
            // ══════════════════════════════════════════
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

            // ══════════════════════════════════════════
            // INSCRIPTIONS PAR MOIS — sur l'année scolaire
            // (Remplace le graphe "par jour de la semaine" qui n'a plus de sens annuellement)
            // ══════════════════════════════════════════
            $inscriptionsParMois = DB::table('inscriptions as i')
                ->select(
                    DB::raw("TO_CHAR(DATE_TRUNC('month', i.dateinscrit), 'YYYY-MM') as mois_key"),
                    DB::raw("TO_CHAR(i.dateinscrit, 'Month YYYY') as mois_label"),
                    DB::raw("EXTRACT(MONTH FROM i.dateinscrit) as mois_num"),
                    DB::raw("EXTRACT(YEAR  FROM i.dateinscrit) as annee_num"),
                    DB::raw('COUNT(DISTINCT i.no_inscrit) as total'),
                    DB::raw('COUNT(DISTINCT icfp.no_inscrit) as cfp'),
                    DB::raw('COUNT(DISTINCT ilyc.no_inscrit) as lycee')
                )
                ->leftJoin('inscrit_formations as icfp', 'i.no_inscrit', '=', 'icfp.no_inscrit')
                ->leftJoin('inscrit_academies  as ilyc', 'i.no_inscrit', '=', 'ilyc.no_inscrit')
                ->whereBetween('i.dateinscrit', [$debutAS, $finAS])
                ->groupBy(
                    DB::raw("DATE_TRUNC('month', i.dateinscrit)"),
                    DB::raw("TO_CHAR(DATE_TRUNC('month', i.dateinscrit), 'YYYY-MM')"),
                    DB::raw("TO_CHAR(i.dateinscrit, 'Month YYYY')"),
                    DB::raw("EXTRACT(MONTH FROM i.dateinscrit)"),
                    DB::raw("EXTRACT(YEAR  FROM i.dateinscrit)")
                )
                ->orderBy(DB::raw("DATE_TRUNC('month', i.dateinscrit)"))
                ->get()
                ->map(fn($s) => [
                    'mois'  => trim($s->mois_label),
                    'key'   => $s->mois_key,
                    'total' => (int) $s->total,
                    'cfp'   => (int) $s->cfp,
                    'lycee' => (int) $s->lycee,
                ])
                ->values();

            // ══════════════════════════════════════════
            // INSCRIPTIONS PAR SEMAINE (semaine courante — contextuel)
            // ══════════════════════════════════════════
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek   = Carbon::now()->endOfWeek()->subDay(); // lundi → samedi

            $jours = [1=>'Lundi',2=>'Mardi',3=>'Mercredi',4=>'Jeudi',5=>'Vendredi',6=>'Samedi'];

            $inscriptionsParJour = DB::table('inscriptions as i')
                ->select(
                    DB::raw('EXTRACT(ISODOW FROM i.dateinscrit) as jour_num'),
                    DB::raw('COUNT(DISTINCT i.no_inscrit) as total'),
                    DB::raw('COUNT(DISTINCT icfp.no_inscrit) as cfp'),
                    DB::raw('COUNT(DISTINCT ilyc.no_inscrit) as lycee')
                )
                ->leftJoin('inscrit_formations as icfp', 'i.no_inscrit', '=', 'icfp.no_inscrit')
                ->leftJoin('inscrit_academies  as ilyc', 'i.no_inscrit', '=', 'ilyc.no_inscrit')
                ->whereBetween('i.dateinscrit', [$startOfWeek, $endOfWeek])
                ->groupBy(DB::raw('EXTRACT(ISODOW FROM i.dateinscrit)'))
                ->orderBy(DB::raw('EXTRACT(ISODOW FROM i.dateinscrit)'))
                ->get()
                ->map(fn($s) => [
                    'jour'  => $jours[(int)$s->jour_num] ?? 'Inconnu',
                    'total' => (int) $s->total,
                    'cfp'   => (int) $s->cfp,
                    'lycee' => (int) $s->lycee,
                ])
                ->values();

            // ══════════════════════════════════════════
            // DÉMOGRAPHIE — filtrée par année scolaire
            // ══════════════════════════════════════════
            $ageLimit = $today->copy()->subYears(18);

            $mineursGlobal = DB::table('personnes as p')
                ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
                ->whereBetween('i.dateinscrit', [$debutAS, $finAS])
                ->where('p.naiss', '>', $ageLimit)
                ->count();

            $majeursGlobal = DB::table('personnes as p')
                ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
                ->whereBetween('i.dateinscrit', [$debutAS, $finAS])
                ->where('p.naiss', '<=', $ageLimit)
                ->count();

            $repartitionSexe = DB::table('personnes as p')
                ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
                ->whereBetween('i.dateinscrit', [$debutAS, $finAS])
                ->groupBy('p.sexe')
                ->select(
                    'p.sexe',
                    DB::raw('COUNT(DISTINCT p.matricule) as total_inscrits')
                )
                ->orderBy('p.sexe')
                ->get();

            // ══════════════════════════════════════════
            // PAIEMENTS — filtrés par année scolaire
            // ══════════════════════════════════════════
            $paiementsMois = DB::table('paiements')
                ->select(
                    DB::raw("TO_CHAR(DATE_TRUNC('month', datepaie), 'Month') as mois"),
                    DB::raw("DATE_TRUNC('month', datepaie) as mois_date"),
                    DB::raw('SUM(montantpaie) as montant'),
                    DB::raw('COUNT(DISTINCT no_paie) as nb_paiements')
                )
                ->whereBetween('datepaie', [$debutAS, $finAS])
                ->groupBy(
                    DB::raw("DATE_TRUNC('month', datepaie)"),
                    DB::raw("TO_CHAR(DATE_TRUNC('month', datepaie), 'Month')")
                )
                ->orderBy(DB::raw("DATE_TRUNC('month', datepaie)"))
                ->get()
                ->map(fn($item) => [
                    'mois'          => trim($item->mois),
                    'montant'       => (float) $item->montant,
                    'nb_paiements'  => (int)   $item->nb_paiements,
                ]);

            $totalMontantAS = $paiementsMois->sum('montant');

            // Paiements par semaine (4 dernières semaines — contextuel)
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
                ->map(fn($item, $index) => [
                    'semaine' => 'Semaine ' . ($index + 1),
                    'periode' => date('d/m', strtotime($item->debut_semaine)) . ' - ' . date('d/m', strtotime($item->fin_semaine)),
                    'montant' => (float) $item->montant,
                    'debut'   => $item->debut_semaine,
                ]);

            // ══════════════════════════════════════════
            // FORMATAGE DÉMOGRAPHIE
            // ══════════════════════════════════════════
            $totalAge = $mineursGlobal + $majeursGlobal;
            $ageData  = [
                [
                    'categorie'   => 'Mineur',
                    'total'       => $mineursGlobal,
                    'pourcentage' => $totalAge > 0 ? round(($mineursGlobal / $totalAge) * 100, 1) : 0,
                ],
                [
                    'categorie'   => 'Majeur',
                    'total'       => $majeursGlobal,
                    'pourcentage' => $totalAge > 0 ? round(($majeursGlobal / $totalAge) * 100, 1) : 0,
                ],
            ];

            $formattedSexe = $repartitionSexe->map(fn($item) => [
                'name'  => $item->sexe === 'M' ? 'Masculin' : ($item->sexe === 'F' ? 'Féminin' : $item->sexe),
                'value' => (int) $item->total_inscrits,
            ]);

            // ══════════════════════════════════════════
            // RÉPONSE JSON
            // ══════════════════════════════════════════
            return response()->json([
                'status' => 'success',
                'data'   => [
                    // ── Contexte de l'année scolaire ──
                    'annee_scolaire' => [
                        'label'  => $labelAS,
                        'debut'  => $debutAS->toDateString(),
                        'fin'    => $finAS->toDateString(),
                    ],
                    'annees_disponibles' => $this->getAnneesDisponibles(),

                    // ── Totaux (filtrés par AS) ──
                    'total_general'   => $totalGeneral,
                    'total_eleve'     => $totalEleve,
                    'total_formation' => $totalFormation,
                    'total_paiement'  => $totalPaiement,
                    'total_montant_annee_scolaire' => $totalMontantAS,

                    // ── Aujourd'hui (contextuel) ──
                    'inscrit_today'       => $inscritToday,
                    'inscrit_today_cfp'   => $inscritTodayCfp,
                    'inscrit_today_lycee' => $inscritTodayLycee,

                    // ── Graphiques ──
                    'inscriptions_par_mois' => $inscriptionsParMois,  // principal (par AS)
                    'inscriptions_par_jour' => $inscriptionsParJour,   // semaine courante
                    'paiements_mois'        => $paiementsMois,         // par AS
                    'paiements_semaine'     => $paiementsSemaine,      // 4 dernières semaines

                    // ── Démographie (filtrée par AS) ──
                    'mineurs_global'        => $mineursGlobal,
                    'majeurs_global'        => $majeursGlobal,
                    'age_data'              => $ageData,
                    'sexe_data'             => $formattedSexe,

                    // ── Alias rétro-compatibles ──
                    'total_apprenants'       => $totalGeneral,
                    'stats_demographiques'   => [
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