<?php

namespace App\Http\Controllers;

use App\Services\NiveauService;
use App\Data\NiveauData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Niveau;
use Illuminate\Validation\Rule;
use Exception;

class ControllerNiveau extends Controller
{

    private $niveauService;

    public function __construct(NiveauService $niveauService){
        $this->niveauService = $niveauService;
    }

    public function index(){
        try{
            $result = $this->niveauService->getAllNiveaux();

            return response()->json($result, 200);
        }

        catch (\Exception $e) {
            \Log::error('Erreur lors du listage des niveaux : ' . $e->getMessage());
            
            return response()->json([
                'Status'  => 'error',
                'Message' => 'Erreur interne du serveur lors du chargement des niveaux.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // public function indexs()
    // {
    //     try {
    //         $liste = Niveau::all();

    //         return response()->json([
    //             'Status'  => $liste->isEmpty() ? 'warning' : 'Succes',
    //             'Message' => $liste->isEmpty() ? 'Aucun niveau trouvé' : 'Liste des niveaux récupérée avec succes.',
    //             'data'    => $liste
    //         ], 200);

    //     } 
    //     catch (\Exception $e) {
    //         \Log::error('Erreur lors du listage des niveaux : ' . $e->getMessage());
            
    //         return response()->json([
    //             'Status'  => 'error',
    //             'Message' => 'Erreur interne du serveur lors du chargement des niveaux.',
    //             'details' => $e->getMessage()
    //         ], 500);
    //     }
    // }


    public function store(Request $request)
    {
        \Log::info('Requête reçue : ', $request->all());

        $validator = Validator::make($request->all(), [
            'code_niveau' => 'required|max:10|unique:niveaux,code_niveau',
            'nomniveau'   => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'Status'  => 'error',
                'Message' => 'Données invalides',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $niveauData = new NiveauData($request->all());
        
        try{
            $result = $this->niveauService->createNiveau($niveauData->toArray());

            return response()->json($result, 200);
        }
        catch(\Exception) {
            return response()->json([
                'Status' => "Erreur",
                'Message' => "Erreur lors de l'ajout",
            ], 500);
        }

        return response()->json([
            'Status'  => 'Succès',
            'Message' => 'Niveau ajouté avec succès',
            'data'    => $data,
        ], 201);
    
    }

    // public function store(Request $request)
    // {
    //     \Log::info('Requête reçue : ', $request->all());

    //     $validator = Validator::make($request->all(), [
    //         'code_niveau' => 'required|max:10|unique:niveaux,code_niveau',
    //         'nomniveau'   => 'required|string|max:50',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'Status'  => 'error',
    //             'Message' => 'Données invalides',
    //             'errors'  => $validator->errors(),
    //         ], 422);
    //     }

    //     $data = Niveau::create([
    //         'code_niveau' => $request->code_niveau,
    //         'nomniveau'   => $request->nomniveau,
    //     ]);

    //     return response()->json([
    //         'Status'  => 'Succès',
    //         'Message' => 'Niveau ajouté avec succès',
    //         'data'    => $data,
    //     ], 201);
    
    // }

    // public function update(Request $request, $codeNiveau)
    // {
    //     \Log::info('Requête de mise à jour reçue pour le niveau : ' . $codeNiveau, $request->all());
    //     $rules = [
    //         'nomniveau' => 'required|string|max:255',
    //         'code_niveau' => [
    //             'required',
    //             'string',
    //             'max:50',
    //             Rule::unique('niveaux', 'code_niveau')->ignore($codeNiveau, 'code_niveau'),
    //         ],
    //     ];

    //     $validator = Validator::make($request->all(), $rules);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'status'    => "Erreur de validation",
    //             'message'   => 'Données invalides pour la mise à jour.',
    //             'errors'    => $validator->errors(),
    //         ], 422);
    //     }

    //     $niveauData = new NiveauData($request->all());
    //     try{
    //         $result = $this->niveauService->updateNiveau($codeNiveau, $niveauData->toArray());

    //         return response()->json($result, 200);
    //     }

    //     catch (Exception $e) {
    //         \Log::error("Erreur critique lors de la mise à jour du niveau '{$codeNiveau}' : " . $e->getMessage(), [
    //             'trace' => $e->getTraceAsString(),
    //             'request_data' => $request->all()
    //         ]);

    //         return response()->json([
    //             'status'  => 'Erreur Interne',
    //             'message' => 'Une erreur inattendue est survenue lors de la modification. Veuillez réessayer.',
    //         ], 500);
    //     }
    // }
    
    public function update(Request $request, $code_niveau)
    {
        \Log::info('Requête de mise à jour reçue pour le niveau : ' . $code_niveau, $request->all());
        $rules = [
            'nomniveau' => 'required|string|max:255',
            'code_niveau' => [
                'required',
                'string',
                'max:50',
                Rule::unique('niveaux', 'code_niveau')->ignore($code_niveau, 'code_niveau'),
            ],
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status'    => "Erreur de validation",
                'message'   => 'Données invalides pour la mise à jour.',
                'errors'    => $validator->errors(),
            ], 422);
        }

        $niveau = Niveau::where('code_niveau', $code_niveau)->first();

        if (!$niveau) {
            return response()->json([
                'status'    => 'Erreur',
                'message'   => "Niveau avec le code '{$code_niveau}' introuvable.",
            ], 404);
        }

        try {
            $niveau->update([
                'code_niveau' => $request->input('code_niveau', $code_niveau), 
                'nomniveau'   => $request->nomniveau,
            ]);
            
            return response()->json([
                'status'  => 'Succès',
                'message' => 'Niveau modifié avec succès.',
                'data'    => $niveau,
            ], 200);

        } catch (Exception $e) {
            \Log::error("Erreur critique lors de la mise à jour du niveau '{$code_niveau}' : " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'status'  => 'Erreur Interne',
                'message' => 'Une erreur inattendue est survenue lors de la modification. Veuillez réessayer.',
            ], 500);
        }
    }

    public function destroy($codeNiveau)
    {
        try{
            $result = $this->niveauService->deleteNiveau($codeNiveau);
            return response()->json($result, 200);
        }
        catch(\Exception $e){
            return response()->json([
                'status' => 'erreur',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

}
