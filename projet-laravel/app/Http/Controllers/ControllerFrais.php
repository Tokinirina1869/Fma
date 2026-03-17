<?php

namespace App\Http\Controllers;
use App\Models\FraisModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Exception;

class ControllerFrais extends Controller
{
    public function index()
    {
        try{
                $data = FraisModel::all();
                return response()->json($data, 200);
        }

        catch(\Exception $e){
                return response()->json(["Erreur lors de la récupération des données!!", 500]);
        }
    }

    public function store(Request $request)
    {
        \Log::info('Requête reçue : ', $request->all());

        $Validator = Validator::make($request->all(), [
            'idfrais'   => 'required|string|unique:frais,idfrais',
            'nomfrais'  => 'required|string|max:100',
            'montant'   => 'required|integer'
        ]);
        if($Validator->fails()) {
            return response()->json([
                "Status"  => "Erreur",
                "Message" => "Données invalides",
                'errors'  => $Validator->errors(),
            ], 422);
        }

        $data = FraisModel::create([
            'idfrais'   => $request->idfrais,
            'nomfrais'  => $request->nomfrais,
            'montant'   => (int) $request->montant,
        ]);

        return response()->json([
            "Status" => "Succès",
            "Message" => "Frais ajoutés avec succès!!!",
            'data'    => $data
        ], 200);

    }

    public function update(Request $request, $idfrais)
    {
        \Log::info('Requête de mise à jour reçue pour le frais : ' . $idfrais, $request->all());

        $rules = [
            'nomfrais' => 'required|string|max:255',
            'montant'  => 'required|integer|min:8000',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status'    => "Erreur de validation",
                'message'   => 'Données invalides pour la mise à jour.',
                'errors'    => $validator->errors(),
            ], 422);
        }

        $frais = FraisModel::where('idfrais', $idfrais)->first();
        if (!$frais) {
            return response()->json([
                'status'    => 'Erreur',
                'message'   => "frais avec le code '{$idfrais}' introuvable.",
            ], 200);
        }

        try {
            $frais->update([
                'nomfrais'  => $request->nomfrais, 
                'montant'   => (int) $request->montant,
            ]);
            
            return response()->json([
                'status'  => 'Succès',
                'message' => 'frais modifié avec succès.',
                'data'    => $frais,
            ], 200);

        } catch (Exception $e) {
            \Log::error("Erreur critique lors de la mise à jour du frais '{$idfrais}' : " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'status'  => 'Erreur Interne',
                'message' => 'Une erreur inattendue est survenue lors de la modification. Veuillez réessayer.',
            ], 500);
        }
    }

    public function destroy(Request $request, $idfrais)
    {
        \Log::info('Requête de suppression reçue pour le frais : ' . $idfrais, $request->all());
        
        $frais = FraisModel::where('idfrais', $idfrais)->firstOrFail();
        $frais->delete();
        return response()->json(['message' => 'Suppression réussie'], 200);
    }

}
