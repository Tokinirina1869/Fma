<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Personne;
use App\Models\Inscription;
use App\Models\FormationModel;
use App\Models\Parcours;
use App\Models\Suivre;
use Illuminate\Support\Facades\Storage;

class InscriptionCompleteController extends Controller
{

    public function index(Request $request) 
    {
        $query = Inscription::with(['personne', 'inscriptionformation', 'parcours']); 

        if ($request->filled('date_debut') && $request->filled('date_fin'))
        {
            $query->whereBetween('dateinscrit', [$request->date_debut, $request->date_fin]);
        }

        $inscriptions = $query->get();

        return response()->json([
            'Status' => "Succès",
            "Message" => 'Liste filtrée',
            'data'    => $inscriptions, 
        ]);
    }
    
    public function searchFormation($classe)
    {
        if ($classe === 'Tous') {
            $data = FormationModel::with(['inscription.personne', 'parcours'])->get();
        } 
        else {
            $data = FormationModel::with(['inscription.personne', 'parcours'])
                ->whereHas('parcours', function ($query) use ($classe) {
                    $query->where('nomformation', 'ILIKE', "%{$classe}%");
                })->get();
        }

        return response()->json([
            'Status' => 'Succès',
            'Message' => 'Filtrage par formation effectué avec succès',
            'data' => $data,
        ]);
    }
    
 

    public function listeFormation(Request $request)
    {
        $anneeScolaire = $request->input('annee_scolaire');

        $query = FormationModel::with(['inscription.personne', 'parcours'])
            ->whereDoesntHave('inscription', function ($q) {
                $q->whereHas('inscriptionacademique'); 
            });

        if ($anneeScolaire) {
            $query->whereHas('inscription', function ($q) use ($anneeScolaire) {
                $q->where('anneesco', $anneeScolaire);
            });
        }

        $data = $query->get();

        return response()->json([
            'Status'  => 'Succès',
            'Message' => $anneeScolaire 
                ? "Liste des apprenants en formation pour l'année $anneeScolaire"
                : "Liste de tous les apprenants en formation",
            'data'    => $data,
        ]);
    }

    public function show()
    {
        $personne = Personne::all();
        return response()->json($personne);
    }
    public function show1()
    {
        $inscription = Inscription::all();
        return response()->json($inscription);
    }

    public function getAllInscriptions() {
        $inscriptions = Inscription::with('inscriptionformation')->get();
        return response()->json($inscriptions);
    }

   public function getByFormation($nomformation)
    {
        $inscriptions = Inscription::with(['personne', 'parcours'])
            
            // 🎯 AJOUTER CETTE LIGNE pour exclure les académiques
            ->whereDoesntHave('inscriptionacademique') 
            
            ->when($nomformation !== 'Tous', function ($query) use ($nomformation) {
                $query->whereHas('parcours', function ($subQuery) use ($nomformation) {
                    $subQuery->where(function($q) use ($nomformation) {
                        $q->where('nomformation', 'ILIKE', '%' . $nomformation . '%')
                        ->orWhere('nomformation', 'ILIKE', '%' . str_replace(' et ', ',', $nomformation) . '%');
                    });
                });
            })
            ->get();

        return response()->json([
            'Status'  => 'Succès',
            'Message' => 'Liste des personnes inscrites uniquement à une formation (Filtrée)',
            'data'    => $inscriptions,
        ]);
    }
    public function countinscription(){
        $totalInscrit = FormationModel::count();
        return response()->json(['total' => $totalInscrit]);
    }

    public function topParcours()
    {
        $formationTop = DB::table('inscrit_formations as insc')
            ->join('suivres as s', 'insc.no_inscrit', '=', 's.no_inscrit')
            ->join('parcours as p', 'p.code_formation', '=', 's.code_formation')
            ->select('p.nomformation', DB::raw('COUNT(insc.no_inscrit) as total'))
            ->groupBy('p.nomformation')
            ->orderByDesc('total')
            ->limit(1)
            ->first();

        return response()->json([
            'Status' => 'Succès',
            'Message' => 'Formation la plus suivie',
            'Data' => $formationTop,
        ]);

    }

    public function filter(Request $request)
    {
        $duree = $request->duree;
        $nomFormation  = $request->nom_formation;
        $anneeScolaire = $request->annee_scolaire;
        $anneeEtude = $request->annee_etude;

        $query = FormationModel::select(
                'inscrit_formations.no_inscrit',
                'pe.matricule',
                'pe.nom',
                'pe.prenom',
                'pe.naiss',
                'pe.lieunaiss',
                'pe.sexe',
                'pe.adresse',
                'inscrit_formations.duree',
                'p.nomformation'
            )
            ->join('inscriptions as i', 'inscrit_formations.no_inscrit', '=', 'i.no_inscrit')
            ->join('personnes as pe', 'i.matricule', '=', 'pe.matricule')
            ->join('suivres as s', 'inscrit_formations.no_inscrit', '=', 's.no_inscrit')
            ->join('parcours as p', 's.code_formation', '=', 'p.code_formation')
            ->where('inscrit_formations.duree', $duree)
            ->where('p.nomformation', $nomFormation)
            ->where('i.anneesco', $anneeScolaire);

        if (!empty($anneeEtude)) {
            $query->where('inscrit_formations.annee_etude', $anneeEtude);
        }

        $apprenants = $query->get();

        return response()->json([
            'Status'  => 'Succès',
            'Message' => 'Apprenants filtrés',
            'Data'    => $apprenants
        ]);
    }

    public function getEffectifsParFormation()
    {
        $effectifs = DB::table('inscrit_formations as if')
            ->join('suivres as s', 'if.no_inscrit', '=', 's.no_inscrit')
            ->join('parcours as p', 's.code_formation', '=', 'p.code_formation')
            ->select(
                'p.nomformation as name',
                DB::raw('COUNT(if.no_inscrit) as value')
            )
            ->groupBy('p.nomformation')
            ->orderByDesc('value')
            ->get();

        // Calcul du total général (utile pour résumé côté front)
        $total = $effectifs->sum('value');

        return response()->json([
            'status' => 'succès',
            'effectifs' => $effectifs,
            'total' => $total
        ]);
    }
    
    public function getEffectifsTrimestriels()
    {
        $effectifs = DB::table('inscriptions')
            ->select(
                DB::raw("EXTRACT(YEAR FROM dateinscrit)::int AS annee"),
                DB::raw("
                    CASE 
                        WHEN EXTRACT(MONTH FROM dateinscrit) BETWEEN 9 AND 12 THEN 'T1'
                        WHEN EXTRACT(MONTH FROM dateinscrit) BETWEEN 1 AND 3 THEN 'T2'
                        WHEN EXTRACT(MONTH FROM dateinscrit) BETWEEN 4 AND 7 THEN 'T3'
                    END AS trimestre
                "),
                DB::raw("COUNT(no_inscrit) AS total")
            )
            ->groupBy('annee', 'trimestre')
            ->orderBy('annee', 'asc')
            ->orderBy('trimestre', 'asc')
            ->get();

        return response()->json([
            'Status' => 'Succès',
            'Data'   => $effectifs
        ]);
    }

    // Méthode générique
    public function countFormation()
    {
        $formations = [
            'musique' => '%Musique%',
            'informatique' => '%Informatique%',
            'coupe_couture' => '%Coupe et Coutûre%',
            'langues' => '%Langues%',
            'patisserie' => '%Pâtisserie%'
        ];
        
        $results = [];
        
        foreach ($formations as $key => $pattern) {
            $results[$key] = DB::table('inscriptions as i')
                ->join('inscrit_formations as insc', 'i.no_inscrit', '=', 'insc.no_inscrit')
                ->join('suivres as s', 's.no_inscrit', '=', 'insc.no_inscrit')
                ->join('parcours as p', 'p.code_formation', '=', 's.code_formation')
                ->where('p.nomformation', 'LIKE', $pattern)
                ->count();
        }

        return response()->json($results);
    }
    
    public function showByMatricule($matricule)
    {
        $inscription = Inscription::where('matricule', $matricule)
                        ->with(['personne', 'inscriptionacademique.niveau', 'parcours'])
                        ->first();

        if (!$inscription) {
            return response()->json(['message' => 'Inscription non trouvée'], 404);
        }

        return response()->json($inscription);
    }



    public function getDashboardData()
    {
        // 1. Effectifs trimestriels (remplace formations/trimestre)
        $trimestreData = DB::table('inscriptions as i')
            ->join('inscrit_formations as inf', 'i.no_inscrit', '=', 'inf.no_inscrit')
            ->select(
                DB::raw("EXTRACT(YEAR FROM i.dateinscrit)::int AS annee"),
                DB::raw("
                    CASE 
                        WHEN EXTRACT(MONTH FROM i.dateinscrit) BETWEEN 9 AND 12 THEN 'T1'
                        WHEN EXTRACT(MONTH FROM i.dateinscrit) BETWEEN 1 AND 3 THEN 'T2'
                        WHEN EXTRACT(MONTH FROM i.dateinscrit) BETWEEN 4 AND 7 THEN 'T3'
                        ELSE 'Hors'
                    END AS trimestre
                "),
                DB::raw("COUNT(i.no_inscrit) AS total")
            )
            ->groupBy('annee', 'trimestre')
            ->orderBy('annee', 'asc')
            ->orderBy('trimestre', 'asc')
            ->get();

        // 2. Total des inscriptions (remplace inscriptions/count)
        $totalInscriptions = DB::table('inscrit_formations')->count();

        // 3. Comptage par formation (remplace count-all-formations)
        $formations = [
            'musique' => '%Musique%',
            'informatique' => '%Informatique%',
            'coupe_couture' => '%Coupe et Couture%',
            'langues' => '%Langue%',
            'patisserie' => '%Pâtisserie%'
        ];
    
        $formationCounts = [];
        foreach ($formations as $key => $pattern) {
            $formationCounts[$key] = DB::table('inscriptions as i')
                ->join('inscrit_formations as insc', 'i.no_inscrit', '=', 'insc.no_inscrit')
                ->join('suivres as s', 's.no_inscrit', '=', 'insc.no_inscrit')
                ->join('parcours as p', 'p.code_formation', '=', 's.code_formation')
                ->where('p.nomformation', 'LIKE', $pattern)
                ->count();
        }

        // 4. Formation la plus suivie (remplace inscriptions/topParcours)
        $topFormation = DB::table('inscrit_formations as insc')
            ->join('suivres as s', 'insc.no_inscrit', '=', 's.no_inscrit')
            ->join('parcours as p', 'p.code_formation', '=', 's.code_formation')
            ->select('p.nomformation', DB::raw('COUNT(insc.no_inscrit) as total'))
            ->groupBy('p.nomformation')
            ->orderByDesc('total')
            ->limit(1)
            ->first();  

        // 5. Effectifs par formation (remplace formations/effectifs)
        $effectifsFormation = DB::table('inscrit_formations as if')
            ->join('suivres as s', 'if.no_inscrit', '=', 's.no_inscrit')
            ->join('parcours as p', 's.code_formation', '=', 'p.code_formation')
            ->select(
                'p.nomformation as name',
                DB::raw('COUNT(if.no_inscrit) as value')
                )
                ->groupBy('p.nomformation')
                ->orderByDesc('value')
                ->get();

        // 6. Répartition par sexe (remplace FormationParSexe)
        $repartitionSexe = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->select(
                'p.sexe as name',
                DB::raw('COUNT(DISTINCT i.no_inscrit) as value')
            )
            ->groupBy('p.sexe')
            ->get();

        // 7. Répartition mineur/majeur (remplace CfpMineurMajeur)
        $repartitionAge = DB::table('personnes as p')
            ->join('inscriptions as i', 'p.matricule', '=', 'i.matricule')
            ->select(
                DB::raw("CASE 
                    WHEN EXTRACT(YEAR FROM AGE(p.naiss)) < 18 THEN 'Mineur' 
                    ELSE 'Majeur' 
                END as name"),
                DB::raw('COUNT(DISTINCT i.no_inscrit) as value')
            )
            ->groupBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'trimestre_data' => $trimestreData,
                'total_inscriptions' => $totalInscriptions,
                'formation_counts' => $formationCounts,
                'top_formation' => $topFormation,
                'effectifs_formation' => $effectifsFormation,
                'repartition_sexe' => $repartitionSexe,
                'repartition_age' => $repartitionAge
            ]
        ]);
    }


    public function getParcours()
    {
        $parcours = DB::table('parcours')
            ->select('code_formation', 'nomformation')
            ->orderBy('nomformation')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $parcours
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom'            => 'required|string|max:255',
            'prenom'         => 'nullable|string|max:255',
            'naiss'          => 'required|date',
            'sexe'           => 'required|string|max:10',
            'adresse'        => 'required|string|max:200',
            'dateinscrit'    => 'required|date',
            'anneesco'       => 'required|string|max:20',
            'duree'          => 'required|string|max:50',
            'type_formation' => 'required|string|max:100',
            'annee_etude'    => 'nullable|string|max:100',
            'parcours'       => 'required|array',
            'cin'            => 'nullable|string|max:12',
            'photo'          => 'nullable|file|mimes:jpeg,png,jpg,gif',
        ]);

        DB::beginTransaction();

        try {
            $annee = date('y');
            $personne = null;

            // Recherche de la personne existante
            if (!empty($request->cin)) {
                $personne = Personne::where('cin', $request->cin)->first();
            } else {
                $personne = Personne::where('nom', $request->nom)
                    ->where('prenom', $request->prenom)
                    ->where('naiss', $request->naiss)
                    ->first();
            }

            // Vérifier si cette personne a déjà une inscription pour l'année scolaire donnée
            if ($personne) {
                $existingInscription = Inscription::where('matricule', $personne->matricule)
                    ->where('anneesco', $request->anneesco)
                    ->first();
                if ($existingInscription) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Cet élève est déjà inscrit pour cette année scolaire.'
                    ], 409);
                }
            }

            // Déterminer le numéro unique global
            if ($personne) {
                if (preg_match('/\/(\d+)$/', $personne->matricule, $matches)) {
                    $numero = (int)$matches[1];
                } else {
                    $numero = 1;
                }
            } else {
                $dernier = Personne::orderByRaw("CAST(SPLIT_PART(matricule, '/', 3) AS INTEGER) DESC")->first();
                if ($dernier && preg_match('/\/(\d+)$/', $dernier->matricule, $matches)) {
                    $numero = (int)$matches[1] + 1;
                } else {
                    $numero = 1;
                }
            }

            // Gérer la photo
            $personneData = array_filter($request->only([
                'nom','prenom','naiss','lieunaiss','sexe','adresse','cin','email','datedel','lieucin',
                'nompere','nommere','nomtuteur','adressparent','adresstuteur',
                'phoneparent','phonetuteur'
            ]), fn($v) => !is_null($v) && $v !== '');

            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('photos', 'public');
                $personneData['photo'] = $path;
            }

            // Création ou mise à jour de la personne
            if ($personne) {
                $personne->update($personneData);
            } else {
                $firstNomFormation = $request->input('parcours')[0]['nomformation'] ?? null;
                $parcours = Parcours::where('nomformation', $firstNomFormation)->first();
                $codeFormation = $parcours ? $parcours->code_formation : 'XXX';
                $matricule = "{$annee}/{$codeFormation}/" . str_pad($numero, 2, '0', STR_PAD_LEFT);
                $personneData['matricule'] = $matricule;
                $personne = Personne::create($personneData);
            }

            // Création de l'inscription
            $inscription = Inscription::create([
                'matricule'      => $personne->matricule,
                'dateinscrit'    => $request->dateinscrit,
                'anneesco'       => $request->anneesco,
                'duree'          => $request->duree ?? null,
                'type_formation' => $request->type_formation,
            ]);

            // Création de la formation
            FormationModel::create([
                'no_inscrit'     => $inscription->no_inscrit,
                'duree'          => $request->duree ?? null,
                'type_formation' => $request->type_formation,
                'annee_etude'    => $request->annee_etude,
            ]);

            // Enregistrer les parcours
            foreach ($request->parcours as $p) {
                if (!empty($p['nomformation'])) {
                    $formation = Parcours::firstOrCreate(
                        ['nomformation' => $p['nomformation']],
                        ['datedebut' => $p['datedebut'] ?? null]
                    );
                    $inscription->parcours()->syncWithoutDetaching([$formation->code_formation]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => '✅ Inscription complète enregistrée avec succès.',
                'numero_global' => $numero
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => "❌ Erreur ligne {$e->getLine()} : " . $e->getMessage(),
            ], 500);
        }
    }


    public function update(Request $request, $matricule)
    {
        DB::beginTransaction();

        try {
            $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'naiss' => 'nullable|date',
                'lieunaiss' => 'nullable|string',
                'sexe' => 'nullable|string',
                'adresse' => 'nullable|string|max:255',
                'cin' => 'nullable|string|max:20',
                'datedel' => 'nullable|date',
                'lieucin' => 'nullable|string',
                'email' => 'nullable|email',
                'nompere' => 'nullable|string|max:255',
                'nommere' => 'nullable|string|max:255',
                'nomtuteur' => 'nullable|string|max:255',
                'adressparent' => 'nullable|string|max:255',
                'adresstuteur' => 'nullable|string|max:255',
                'phoneparent' => 'nullable|string|max:20',
                'phonetuteur' => 'nullable|string|max:20',
                'dateinscrit' => 'nullable|date',
                'anneesco' => 'nullable|string|max:20',
                'duree' => 'nullable|string|max:50',
                'type_formation' => 'nullable|string|max:50',
                'parcours' => 'nullable|array',
                'parcours.*.nomformation' => 'required_with:parcours|string|max:100',
                'parcours.*.datedebut' => 'required_with:parcours|date',
                'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ]);

            $personne = Personne::where('matricule', $matricule)->firstOrFail();
            $inscription = Inscription::where('matricule', $matricule)->firstOrFail();

            $personne->fill($request->only([
                'nom','prenom','naiss','lieunaiss','sexe','adresse','cin','email','datedel','lieucin',
                'nompere','nommere','nomtuteur','adressparent','adresstuteur',
                'phoneparent','phonetuteur'
            ]));

            if ($request->hasFile('photo')) {
                if ($personne->photo && Storage::exists('public/' . $personne->photo)) {
                    Storage::delete('public/' . $personne->photo);
                }
                $personne->photo = $request->file('photo')->store('photos', 'public');
            }

            $personne->save();

            $inscription->update([
                'dateinscrit' => $request->dateinscrit,
                'anneesco' => $request->anneesco,
                'duree' => $request->duree ?? $inscription->duree,
                'type_formation' => $request->type_formation ?? $inscription->type_formation,
            ]);

            if ($request->has('parcours') && is_array($request->parcours)) {
                $idsFormations = [];

                foreach ($request->parcours as $p) {
                    if (!empty($p['nomformation'])) {
                        $formation = Parcours::firstOrCreate(
                            ['nomformation' => $p['nomformation']],
                            ['datedebut' => $p['datedebut']]
                        );

                        $idsFormations[] = $formation->code_formation;
                    }
                }

                // Sync : supprime les liens non présents et ajoute les nouveaux
                $inscription->parcours()->sync($idsFormations);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Inscription mise à jour avec succès ✅',
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'validation_error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Erreur interne du serveur lors de la mise à jour.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    public function destroy($matricule)
    {
        try {
            $personne = Personne::where('matricule', $matricule)->first();
            if (!$personne) {
                return response()->json([
                    'message' => "Personne avec le matricule $matricule introuvable"
                ], 404);
            }

            $inscription = Inscription::where('matricule', $matricule)->first();
            if ($inscription) {
                FormationModel::where('no_inscrit', $inscription->no_inscrit)->delete();
                Suivre::where('no_inscrit', $inscription->no_inscrit)->delete();

                $inscription->delete();
            }

            return response()->json([
                'message' => "Suppression effectuée avec succès"
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}

