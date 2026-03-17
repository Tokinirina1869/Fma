<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Parcours;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Exception;

class ParcoursController extends Controller
{
    public function index()
    {
        $parcours = Parcours::all();
        return response()->json($parcours, 201);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_formation' => 'required|string|max:50|unique:parcours,code_formation',
            'nomformation'   => 'required|string|max:100',
            'datedebut'      => 'required|date',
            'duree'          => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Données invalides',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 🔍 Vérifier si un parcours existe déjà avec même nom + date
        $existe = Parcours::where('nomformation', $request->nomformation)
                        ->where('datedebut', $request->datedebut)
                        ->first();

        if ($existe) {
            // ⚠️ Retourner une alerte claire (pour ton front)
            return response()->json([
                'status'  => 'warning',
                'message' => '⚠️ Ce parcours existe déjà dans la base de données !',
                'data'    => $existe,
            ], 409); // HTTP 409 = Conflict
        }

        // ✅ Création du parcours
        $parcours = Parcours::create([
            'code_formation' => $request->code_formation,
            'nomformation'   => $request->nomformation,
            'datedebut'      => $request->datedebut,
            'duree'          => $request->duree,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => '✅ Nouveau parcours ajouté avec succès',
            'data'    => $parcours,
        ], 200);
    }


    public function update(Request $request, $code_formation)
    {
        \Log::info('Requête reçu: ' .$code_formation, $request->all());
        
        $validator = Validator::make($request->all(), [
            'nomformation'    => 'required|string|max:100',
            'datedebut'       => 'required|date',
        ]);
        
        if($validator->fails())
        {
            return response()->json([
                'Status'    => "Erreur",
                'Message'   => "Données invzlides",
                'errors'    => $validator->errors(),
            ], 404);
        }

        $parcours = Parcours::where('code_formation', $code_formation)->first();

        if(!$parcours){
            return response()->json([
                'Status'    => "Erreur",
                'Message'   => "Parcours avec le code '{$code_formation}' introuvable !!!",
            ], 200);
        }

        try{
            $parcours->update([
                'nomformation' => $request->nomformation,
                'datedebut'    => $request->datedebut,
                'duree'        => $request->duree,
            ]);

            return response()->json([
                "Status"    => "Succès",
                "Message"   => "Modification réussie",
                "data"      => $parcours,
            ], 200);
        }

        catch(Exception $e){
           \Log::error("Erreur critique lors de la mise à jour du parcours '{$code_formation}' : " . $e->getMessage());

            return response()->json([
                'status'  => 'Erreur Interne',
                'message' => 'Une erreur inattendue est survenue lors de la modification. Veuillez réessayer.',
            ], 500);
        }
    }

    public function destroy($code_formation)
    {
        \Log::info('Requête reçu: '. $code_formation);

        $parcours = Parcours::find($code_formation);

        if(!$code_formation){
            return response()->json([
                'Status'    => "Erreur",
                'Message'   => 'Parcours Introuvable'
            ], 404);
        }

        $parcours->delete();
        return response([
            'message' => 'Suppression avec succès !!!'
        ], 200);
    }

}
