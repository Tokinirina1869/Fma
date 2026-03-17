<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Inscription;
use App\Models\Personne;

class StudentController extends Controller
{
    // Listage
    public function index()
    {
        $inscriptions = Inscription::with(['personne', 'inscriptionformations', 'parcours'])->get();
        return response()->json($inscriptions);

    }

    // Ajout
    public function store(Request $request)
    {
        $data = $request->all();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $data['photo'] = $path; 
        }

        Personne::create($data);

        return response()->json(['message' => 'Personne ajoutée avec succès']);
    }


    public function show(string $id)
    {
        
    }

    public function update(Request $request, string $id)
    {
        
    }

    public function destroy(string $id)
    {
        
    }
} 

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use App\Models\Personne;
// use App\Models\Inscription;
// use App\Models\InscriptionFormation;
// use App\Models\Parcours;

// class StudentController extends Controller
// {
//        public function index()
//     {
//         $listes = Inscription::with(['personne', 'inscriptionformation', 'parcours'])->get();
//         return response()->json($listes);
//     }

//     public function store(Request $request)
//     {
//         $validated = $request->validate([
//             // Données Personne
//             'matricule' => 'required|string|unique:personnes,matricule',
//             'nom' => 'required|string|max:50',
//             'prenom' => 'required|string|max:50',
//             'naiss' => 'required|date',
//             'sexe' => 'required|string|max:10',
//             'adresse' => 'nullable|string|max:255',

//             // Données Inscription
//             'dateinscrit' => 'required|date',
//             'anneesco' => 'required|string|max:15',

//             // Données Formation / Parcours
//             'duree' => 'required|integer',
//             'type_formation' => 'required|string',
//             'nomformation' => 'required|string'
//         ]);

//         DB::beginTransaction();
//         try {
//             // 1️⃣ Ajouter la personne
//             $personne = Personne::create([
//                 'matricule' => $validated['matricule'],
//                 'nom' => $validated['nom'],
//                 'prenom' => $validated['prenom'],
//                 'naiss' => $validated['naiss'],
//                 'sexe' => $validated['sexe'],
//                 'adresse' => $validated['adresse'] ?? null,
//             ]);

//             // 2️⃣ Ajouter l’inscription
//             $inscription = Inscription::create([
//                 'matricule' => $personne->matricule,
//                 'dateinscrit' => $validated['dateinscrit'],
//                 'anneesco' => $validated['anneesco'],
//             ]);

//             // 3️⃣ Ajouter l’inscription formation
//             $inscrFormation = InscriptionFormation::create([
//                 'no_inscrit' => $inscription->no_inscrit,
//                 'duree' => $validated['duree'],
//                 'type_formation' => $validated['type_formation'],
//             ]);

//             // 4️⃣ Ajouter le parcours (et éventuellement table pivot)
//             $parcours = Parcours::create([
//                 'code_formation' => uniqid('F'), // ou ton code logique
//                 'nomformation' => $validated['nomformation'],
//                 'datedebut' => now(),
//             ]);

//             // Ici tu peux ajouter dans table `suivres` si besoin :
//             DB::table('suivres')->insert([
//                 'no_inscrit' => $inscription->no_inscrit,
//                 'code_formation' => $parcours->code_formation,
//                 'created_at' => now(),
//                 'updated_at' => now(),
//             ]);

//             DB::commit();

//             return response()->json([
//                 'message' => 'Inscription complète réussie !',
//                 'personne' => $personne,
//                 'inscription' => $inscription,
//                 'formation' => $inscrFormation,
//                 'parcours' => $parcours
//             ], 201);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             return response()->json([
//                 'error' => 'Erreur : ' . $e->getMessage()
//             ], 500);
//         }
//     }
// }

