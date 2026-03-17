<?php

namespace App\Http\Controllers;

use App\Models\Personne;
use App\Models\Inscription;
use App\Models\FormationModel;     
use App\Models\Parcours;
use App\Models\ReinscriptionFormation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ReinscriptionFormationController extends Controller
{
    public function reinscrire(Request $request)
    {
        // Validation des entrées
        $validator = Validator::make($request->all(), [
            'matricule'               => 'required|string|exists:personnes,matricule',
            'annee_scolaire'           => 'required|string|max:20',
            'nouveau_nom_formation'    => 'required|string|exists:parcours,nomformation',
            'nouvelle_annee_etude'      => 'nullable|string|in:1ere année,2eme année',
            'date_inscription'          => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            // Récupérer la personne
            $personne = Personne::where('matricule', $request->matricule)->first();
            if (!$personne) {
                return response()->json(['message' => 'Personne non trouvée'], 404);
            }

            // Dernière inscription (pour l'historique)
            $ancienneInscription = Inscription::where('matricule', $personne->matricule)
                                    ->latest('dateinscrit')
                                    ->first();

            // Récupérer le parcours correspondant au nom ET à la durée = 2 ans
            $parcours = Parcours::where('nomformation', $request->nouveau_nom_formation)
                                ->where('duree', '2 ans')
                                ->first();

            if (!$parcours) {
                return response()->json([
                    'message' => 'La formation sélectionnée n\'existe pas en durée 2 ans.'
                ], 404);
            }

            // Vérifier que l'année d'étude est fournie (obligatoire pour 2 ans)
            if (empty($request->nouvelle_annee_etude)) {
                return response()->json([
                    'message' => 'L\'année d\'étude (1ère ou 2ème) est obligatoire.'
                ], 400);
            }

            DB::beginTransaction();

            // Date d'inscription (aujourd'hui par défaut)
            $dateInscription = $request->date_inscription
                ? Carbon::parse($request->date_inscription)
                : Carbon::today();

            // 1. Créer la nouvelle inscription (sans duree ni type_formation)
            $nouvelleInscription = Inscription::create([
                'matricule'   => $personne->matricule,
                'dateinscrit' => $dateInscription,
                'anneesco'    => $request->annee_scolaire,
            ]);

            // 2. Créer l'entrée dans la table 'inscrit_formations' via le modèle FormationModel
            FormationModel::create([
                'no_inscrit'     => $nouvelleInscription->no_inscrit,
                'duree'          => $parcours->duree,
                'type_formation' => $request->input('type_formation', 'Court Terme'),
                'annee_etude'    => $request->nouvelle_annee_etude,
            ]);

            // 3. Associer le parcours via la table pivot 'suivres'
            $nouvelleInscription->parcours()->sync([$parcours->code_formation]);

            // 4. Préparer les données pour l'historique
            $anciensParcours = [];
            $ancienneAnneeEtude = null;
            if ($ancienneInscription) {
                $anciensParcours = $ancienneInscription->parcours
                                    ->pluck('nomformation')
                                    ->map(fn($nom) => trim($nom))
                                    ->toArray();
                $ancienneFormation = FormationModel::where('no_inscrit', $ancienneInscription->no_inscrit)->first();
                $ancienneAnneeEtude = $ancienneFormation?->annee_etude;
            }

            // 5. Enregistrer dans l'historique des réinscriptions
            ReinscriptionFormation::create([
                'no_inscrit'           => $nouvelleInscription->no_inscrit,
                'anciens_parcours'     => $anciensParcours,
                'nouveau_parcours'     => $request->nouveau_nom_formation,
                'ancienne_annee_etude' => $ancienneAnneeEtude,
                'nouvelle_annee_etude' => $request->nouvelle_annee_etude,
                'annee_scolaire'       => $request->annee_scolaire,
                'user_id'              => auth()->id(), // peut être null
            ]);

            DB::commit();

            // Charger les relations pour la réponse
            $nouvelleInscription->load(['personne', 'parcours', 'inscriptionformation']);

            return response()->json([
                'message' => 'Réinscription effectuée avec succès',
                'data'    => $nouvelleInscription,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur réinscription CFP: ' . $e->getMessage(), [
                'trace'  => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Erreur interne lors de la réinscription',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}