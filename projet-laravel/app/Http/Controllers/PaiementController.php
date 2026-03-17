<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaiementModel;
use App\Models\FraisModel;
use App\Models\Personne;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaiementController extends Controller
{
    public function index()
    {
        try {
            $listePaie = PaiementModel::with(['personne', 'inscription'])->orderBy('no_paie', 'asc')->get();

            $listePaie->map(function ($paiement) {

                $idfraisArray = $paiement->idfrais;

                if (is_array($idfraisArray)) {
                    $idfraisArray = array_map(function($item) {
                        return trim($item, '{}" ');
                    }, $idfraisArray);
                } elseif (is_string($idfraisArray)) {
                    $idfraisArray = str_replace(['{','}','"'], '', $idfraisArray);
                    $idfraisArray = array_map('trim', explode(',', $idfraisArray));
                } else {
                    $idfraisArray = [];
                }

                $paiement->frais_associes = !empty($idfraisArray)
                    ? \App\Models\FraisModel::whereIn('idfrais', $idfraisArray)->get()->toArray()
                    : [];

                return $paiement;
            });

            return response()->json([
                'Status' => 'Succès',
                'Message' => 'Affichage réussi',
                'data' => $listePaie,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Erreur index Paiement: ' . $e->getMessage());
            return response()->json([
                'Status' => 'Erreur',
                'Message' => "Erreur lors de l'affichage des paiements",
                'Erreur' => $e->getMessage(),
            ], 500);
        }
    }

    public function getEcolage($matricule)
    {
        try {
            $paiements = \DB::table('paiements')
                ->where('matricule', $matricule)
                ->select('no_paie', 'nomfraispayés')
                ->get();

            if ($paiements->isEmpty()) {
                return response()->json([
                    'matricule' => $matricule,
                    'moisPayes' => [],
                    'autresFraisPayes' => []
                ]);
            }

            $moisPayes = [];
            $autresFraisPayes = [];

            foreach ($paiements as $p) {
                $text = $p->nomfraispayés ?? '';

                if (preg_match_all('/\(([^)]+)\)/', $text, $matches)) {
                    foreach ($matches[1] as $group) {
                        $mois = array_map('trim', explode(',', $group));
                        $moisPayes = array_merge($moisPayes, $mois);
                    }
                }

                // 🔹 Supprimer les parenthèses pour traiter le reste du texte
                $reste = preg_replace('/\(.*?\)/', '', $text);

                // 🔹 Séparer les différents frais par virgule
                $parts = array_map('trim', explode(',', $reste));

                foreach ($parts as $frais) {
                    if (
                        $frais &&
                        !preg_match('/ecolage/i', $frais) && 
                        !in_array($frais, $autresFraisPayes)
                    ) {
                        $autresFraisPayes[] = $frais;
                    }
                }
            }

            return response()->json([
                'matricule' => $matricule,
                'moisPayes' => array_values(array_unique($moisPayes)),
                'autresFraisPayes' => array_values(array_unique($autresFraisPayes))
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur getEcolage: " . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }


    public function store(Request $request)
    {
        // Log::info('Requête reçue :', $request->all()); // Garder pour le débogage

        // --- 1. Validation ---
        $validator = Validator::make($request->all(), [
            'no_inscrit'    => 'required|integer',
            'matricule'     => 'required|string|max:50',
            'idfrais'       => 'required|string', 
            'nomfraispayés' => 'required|string',
            'datepaie'      => 'required|date',
            'modepaie'      => 'required|string|max:50',
            'montantpaie'   => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'erreur',
                'message' => 'Données de validation invalides',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        
        // --- 2. Préparation des IDs de Frais et consolidation ---
        
        // On nettoie la chaîne d'IDs et on la stocke telle quelle.
        // Votre colonne idfrais doit être de type VARCHAR ou TEXT.
        $fraisIds = explode(',', $data['idfrais']);
        $fraisIds = array_map('trim', $fraisIds);
        $fraisIds = array_filter($fraisIds);
        $consolidatedFraisIds = implode(',', $fraisIds); // Reconstituer la chaîne propre

        if (empty($consolidatedFraisIds)) {
            return response()->json(['message' => 'La liste des identifiants de frais est vide après nettoyage.'], 422);
        }

        DB::beginTransaction();
        
        try {
            // --- 3. Génération du No. Paiement Unique ---
            // Trouver le dernier numéro de paiement et incrémenter
            $dernierPaiement = DB::table('paiements')->orderBy('no_paie', 'desc')->first();
            $nextNumero = 1;
            if ($dernierPaiement) {
                // Assurez-vous que le sous-string retourne bien l'index numérique
                $dernierNum = (int) substr($dernierPaiement->no_paie, 2); 
                $nextNumero = $dernierNum + 1;
            }
            $no_paie = 'PE' . str_pad($nextNumero, 4, '0', STR_PAD_LEFT);

            // --- 4. Vérification d'Existence des Frais (Optionnel mais recommandé) ---
            // Vérifier si TOUS les IDs existent pour éviter une transaction invalide
            $fraisExistCount = DB::table('frais')->whereIn('idfrais', $fraisIds)->count();
            if ($fraisExistCount !== count($fraisIds)) {
                DB::rollBack();
                return response()->json([
                    'status'  => 'erreur',
                    'message' => 'Un ou plusieurs identifiants de frais (' . $data['idfrais'] . ') sont invalides ou manquants.',
                ], 422);
            }

            // --- 5. Création du Paiement Unique (LA CORRECTION) ---
            
            // Création du paiement (UNE seule ligne pour la transaction complète)
            $paiement = PaiementModel::create([
                'no_paie'       => $no_paie,
                'no_inscrit'    => $data['no_inscrit'],
                'matricule'     => $data['matricule'],
                // 🎯 STOCKAGE DE TOUS LES IDs dans une seule colonne
                'idfrais'       => $consolidatedFraisIds, 
                'nomfraispayés' => $data['nomfraispayés'],
                'datepaie'      => $data['datepaie'],
                'modepaie'      => $data['modepaie'],
                'montantpaie'   => $data['montantpaie'],
            ]);
            
            DB::commit();

            return response()->json([
                'status'  => 'succès',
                'message' => 'Paiement ajouté avec succès',
                'data'    => $paiement, // Retourne un seul objet Paiement
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de l\'ajout du paiement : '.$e->getMessage(). ' Ligne: '.$e->getLine());
            return response()->json([
                'status'  => 'erreur',
                'message' => 'Impossible d\'ajouter le paiement : Erreur interne.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    public function searchBetween2Date(Request $request)
    {
        $query = Paiement::with(['personne', 'fraisAssocies']);

        // Filtre par plage de dates
        if ($request->has('start') && $request->has('end') && $request->start && $request->end) {
            $query->whereBetween('datepaie', [$request->start, $request->end]);
        }

        $paiements = $query->get();

        return response()->json([
            'data' => $paiements
        ]);
    }

    public function countPaie()
    {
        $total = DB::table('paiements')->distinct('no_paie')->count('no_paie');

        return response()->json([
            'Status' => "Succès",
            'data'   => $total,
        ]);
    }

    public function show($no_paie)
    {
        try {
            $paiement = PaiementModel::with(['personne', 'inscription'])->findOrFail($no_paie);
            $paiement->frais_associes = $paiement->fraisAssocies();

            return response()->json([
                'Status' => 'Succès',
                'data' => $paiement,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'Status' => 'Erreur',
                'Message' => 'Paiement introuvable',
                'Erreur' => $e->getMessage(),
            ], 404);
        }
    }

    public function getNextNoPaie()
    {
        $lastNumber = PaiementModel::selectRaw('MAX(CAST(SUBSTRING(no_paie FROM 3) AS INTEGER)) as max_number')
            ->first()
            ->max_number;

        $next = $lastNumber ? $lastNumber + 1 : 1;
        $no_paie = 'PE' . str_pad($next, 4, '0', STR_PAD_LEFT);

        return response()->json(['no_paie' => $no_paie]);
    }

    public function paiementParMois()
    {
        $data = DB::table('paiements')
            ->select(
                DB::raw("TO_CHAR(DATE_TRUNC('month', datepaie), 'Month') as mois"),
                DB::raw('SUM(montantpaie) as montant')
            )
            ->where('datepaie', '>=', now()->subMonths(6))
            ->groupBy(DB::raw("DATE_TRUNC('month', datepaie)"), DB::raw("TO_CHAR(DATE_TRUNC('month', datepaie), 'Month')"))
            ->orderBy(DB::raw("MIN(datepaie)"))
            ->get();

        return response()->json([
            'status' => 'succès',
            'data'   => $data
        ]);
    }

    public function paiementParSemaine()
    {
        $data = DB::table('paiements')
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

        return response()->json([
            'status' => 'succès',
            'data'   => $data->values()
        ]);
    }


    public function update(Request $request, $no_paie)
    {
        \Log::info('Update paiement - Requête reçue : ', $request->all());

        $validated = $request->validate([
            'matricule'     => 'required|string|max:50',
            'no_inscrit'    => 'required|integer',
            'datepaie'      => 'required|date',
            'montantpaie'   => 'required|integer|min:0',
            'modepaie'      => 'required|string',
            'idfrais'       => 'required|string', 
            'nomfraispayés' => 'required|string', 
        ]);
        
        $matricule = $validated['matricule'];
        $no_inscrit = $validated['no_inscrit'];
        $idfrais_string = $validated['idfrais'];
        $nomfraispayés = $validated['nomfraispayés'];
        
        // Séparer les IDs de frais reçus du front-end
        $fraisIds = array_map('trim', explode(',', $idfrais_string));
        $fraisIds = array_filter($fraisIds); 

        if (empty($fraisIds)) {
            return response()->json(['message' => 'Aucun frais valide n\'a été spécifié pour la mise à jour.'], 422);
        }
        
        if (count($fraisIds) > 1) {
            DB::beginTransaction();
            try {
                // Trouver le paiement original pour obtenir la date de création/transaction si possible
                $originalPaiement = PaiementModel::where('no_paie', $no_paie)
                                                    ->where('matricule', $matricule)
                                                    ->firstOrFail();

                // Supprimez le paiement original et tous les autres paiements qui ont le même 'created_at' (transaction identique)
                // C'est la seule façon de regrouper sans 'no_transaction'.
                $paiementsASupprimer = PaiementModel::where('matricule', $matricule)
                                            ->where('created_at', $originalPaiement->created_at)
                                            ->delete(); // Supprime tous les paiements de ce lot

                // Réutiliser la logique de création de la méthode store (incrémentation no_paie)
                $dernierPaiement = DB::table('paiements')->orderBy('no_paie', 'desc')->first();
                $nextNumero = 1;
                if ($dernierPaiement) {
                    $dernierNum = (int) substr($dernierPaiement->no_paie, 2);
                    $nextNumero = $dernierNum + 1;
                }
                
                $paiements_inserted = [];
                
                // Recréer les nouveaux paiements (un par frais mis à jour)
                foreach ($fraisIds as $fraisId) {
                    
                    // Vérifier que le frais existe pour éviter la violation de clé étrangère
                    if (!DB::table('frais')->where('idfrais', $fraisId)->exists()) {
                        DB::rollBack();
                        return response()->json(['message' => "Le frais '$fraisId' n'existe pas ou est invalide."], 422);
                    }
                    
                    // Génération du no_paie pour cet enregistrement
                    $new_no_paie = 'PE' . str_pad($nextNumero, 4, '0', STR_PAD_LEFT);
                    $nextNumero++; // Incrémentation
                    
                    // Création du paiement
                    $paiement = PaiementModel::create([
                        'no_paie'       => $new_no_paie,
                        'no_inscrit'    => $no_inscrit,
                        'matricule'     => $matricule,
                        'idfrais'       => $fraisId, // Un seul ID de frais
                        'nomfraispayés' => $nomfraispayés,
                        'datepaie'      => $validated['datepaie'],
                        'modepaie'      => $validated['modepaie'],
                        'montantpaie'   => $validated['montantpaie'],
                    ]);
                    $paiements_inserted[] = $paiement;
                }

                DB::commit();

                return response()->json([
                    'status'  => 'succès',
                    'message' => 'Transaction modifiée et recréée avec succès.',
                    'data'    => $paiements_inserted,
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Erreur lors de la modification/recréation du paiement : '.$e->getMessage(). ' Ligne: '.$e->getLine());
                return response()->json([
                    'status'  => 'erreur',
                    'message' => 'Impossible de modifier la transaction.',
                    'details' => $e->getMessage(),
                ], 500);
            }
        }
        else {
            $paiement = PaiementModel::where('no_paie', $no_paie)->firstOrFail();
            
            $paiement->idfrais = $fraisIds[0]; 
            $paiement->nomfraispayés = $nomfraispayés;
            $paiement->datepaie = $validated['datepaie'];
            $paiement->modepaie = $validated['modepaie'];
            $paiement->montantpaie = $validated['montantpaie'];

            $paiement->save();
            
            return response()->json([
                'status' => 'Succès',
                'message' => 'Paiement mis à jour avec succès',
                'data' => $paiement,
            ], 200);
        }
    }

   
    public function destroy($no_paie)
    {
        $paiement = PaiementModel::where('no_paie', $no_paie)->firstOrFail();
        $paiement->delete();

        return response()->json([
            'Status' => 'Succès',
            'Message' => 'Paiement supprimé avec succès',
        ], 200);
    }
}
