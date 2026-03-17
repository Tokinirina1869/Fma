<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\InscriptionCompleteController;
use App\Http\Controllers\ParcoursController;
use App\Http\Controllers\ControllerNiveau;
use App\Http\Controllers\ControllerFrais;
use App\Http\Controllers\PersonneController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\DashController;
use App\Http\Controllers\ReinscriptionController;
use App\Http\Controllers\ReinscriptionFormationController;
use App\Http\Controllers\Api\ChatController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/users/{id}', [AuthController::class, 'update']);
Route::get('/roles', [AuthController::class, 'getRoles']);


// Compter Formation
Route::get('/inscriptions/count', [InscriptionCompleteController::class, 'countinscription']);
Route::get('/inscriptions/musique', [InscriptionCompleteController::class, 'countMusique']);
Route::get('/inscriptions/info', [InscriptionCompleteController::class, 'countInformatique']);
Route::get('/inscriptions/coupe', [InscriptionCompleteController::class, 'countCoupeEtCouture']);
Route::get('/inscriptions/langues', [InscriptionCompleteController::class, 'countLangues']);
Route::get('/inscriptions/patisserie', [InscriptionCompleteController::class, 'countPatisserie']);
Route::get('/inscriptions/topParcours', [InscriptionCompleteController::class, 'topParcours']);
Route::get('/inscriptions/formation/{nomformation}', [InscriptionCompleteController::class, 'getByFormation']);
Route::get('/count/{formationName}', [InscriptionCompleteController::class, 'countFormation']);


Route::get('/dashboard/data', [InscriptionCompleteController::class, 'getDashboardData']);
Route::get('/parcours/list', [InscriptionCompleteController::class, 'getParcours']);


Route::get('/academie/dashboard-stats', [InscriptionController::class, 'getDashboardStats']);
Route::get('/niveaux/list', [InscriptionController::class, 'getNiveauxList']);

// Dans routes/api.php
Route::get('/dashboard/global-stats', [DashController::class, 'getGlobalStats']);
//Niveau 
Route::get('/niveau', [ControllerNiveau::class, 'index']);
Route::post('/niveaux', [ControllerNiveau::class, 'store']);
Route::put('/updateNiveaux/{code_niveau}', [ControllerNiveau::class, 'update']);
Route::delete('/deleteNiveaux/{code_niveau}', [ControllerNiveau::class, 'destroy']);

// Parcours
Route::get('/parcours', [ParcoursController::class, 'index']);
Route::post('/addParcours', [ParcoursController::class, 'store']);
Route::put('/updateParcours/{code_formation}', [ParcoursController::class, 'update']);
Route::delete('/deleteParcours/{code_formation}', [ParcoursController::class, 'destroy']);

//Frais
Route::get('/frais', [ControllerFrais::class, 'index']);
Route::post('/addfrais', [ControllerFrais::class, 'store']);
Route::put('/updateFrais/{idfrais}', [ControllerFrais::class, 'update']);
Route::delete('/deleteFrais/{idfrais}', [ControllerFrais::class, 'destroy']);

// Personne
Route::get('/mineurs', [PersonneController::class, 'mineurs']);
Route::get('/majeurs', [PersonneController::class, 'majeurs']);
Route::get('/statistique', [PersonneController::class, 'statistiqueMineurMajeur']);
Route::get('/majeursFormation', [PersonneController::class, 'majeursFormation']);
Route::get('/mineursFormation', [PersonneController::class, 'mineursFormation']);
Route::get('/FormationParSexe', [PersonneController::class, 'FormationParSexe']);
Route::get('/LyceeParSexe', [PersonneController::class, 'LyceeParSexe']);
Route::get('/ApprenantParSexe', [PersonneController::class, 'ApprenantParSexe']);
Route::get('/CfpMineurMajeur', [PersonneController::class, 'CfpMineurMajeur']);
Route::get('/LyceeMineurMajeur', [PersonneController::class, 'LyceeMineurMajeur']);

//Paiements
Route::get('/listepaiement', [PaiementController::class, 'index']);
Route::get('/no_paiement', [PaiementController::class, 'getNextNoPaie']);
Route::post('/addpaiement', [PaiementController::class, 'store']);
Route::put('/updatepaiement/{no_paie}', [PaiementController::class, 'update']);
Route::delete('/deletepaiement/{no_paie}', [PaiementController::class, 'destroy']);
Route::get('/ecolage/{matricule}', [PaiementController::class, 'getEcolage'])->where('matricule', '.*');
Route::get('/paiementEffectue', [PaiementController::class, 'countPaie']);
Route::get('/paiementParMois', [PaiementController::class, 'paiementParMois']);
Route::get('/paiementParSemaine', [PaiementController::class, 'paiementParSemaine']);

// Personnes
Route::get('/personnes', [InscriptionCompleteController::class, 'show']);
Route::get('/inscriptions', [InscriptionCompleteController::class, 'show1']);
Route::get('/Inscriptions', [InscriptionCompleteController::class, 'getAllInscriptions']);

// Formations
ROute::get('/personne/matricule/{matricule}', [InscriptionCompleteController::class, 'showByMatricule'])->where('matricule', '.*');
Route::get('/filterDatePro', [InscriptionCompleteController::class, 'index']);
Route::get('/formations/effectifs', [InscriptionCompleteController::class, 'getEffectifsParFormation']);
Route::get('/formations/trimestre', [InscriptionCompleteController::class, 'getEffectifsTrimestriels']);
Route::get('/inscriptions/filter', [InscriptionCompleteController::class, 'filter']);
Route::get('/inscriptionComplete', [InscriptionCompleteController::class, 'listeFormation']);
Route::get('/searchFormation/{classe}', [InscriptionCompleteController::class, 'searchFormation']);
Route::post('/inscriptionComplete', [InscriptionCompleteController::class, 'store']);
Route::match(['put', 'patch'], '/inscriptionComplete/{matricule}', [InscriptionCompleteController::class, 'update'])->where('matricule', '.*');
Route::delete('/inscriptionComplete/{matricule}', [InscriptionCompleteController::class, 'destroy'])->where('matricule', '.*');

// Academique
Route::get('/filterDate', [InscriptionController::class, 'index']);
Route::get('/searchClasse/{classe}', [InscriptionController::class, 'searchClasse']);
Route::get('/academique', [InscriptionController::class, 'listeAcademie']);
Route::post('/addacademique', [InscriptionController::class, 'store']);
Route::put('/updateacademique/{no_inscrit}', [InscriptionController::class, 'update']);
Route::delete('/deleteacademique/{no_inscrit}', [InscriptionController::class, 'destroy']);

Route::get('/countNiveau', [InscriptionController::class, 'countNiveau']);
Route::get('/countSeconde', [InscriptionController::class, 'countSeconde']);
Route::get('/countPremiere', [InscriptionController::class, 'countPremiere']);
Route::get('/countTerminalA', [InscriptionController::class, 'countTerminalA']);
Route::get('/countTerminalC', [InscriptionController::class, 'countTerminalC']);
Route::get('/countTerminalD', [InscriptionController::class, 'countTerminalD']);

Route::get('/totalGeneral', [InscriptionController::class, 'totalGeneral']);
Route::get('/filterNiveau', [InscriptionController::class, 'filter']);
Route::get('/eleve/effectifs', [InscriptionController::class, 'getEffectifsParClasse']);
Route::get('/eleve/Annee', [InscriptionController::class, 'getEffectifsParAnnee']);

Route::post('/reinscrire', [ReinscriptionController::class, 'reinscrire']);
Route::post('/reinscrirecfp', [ReinscriptionFormationController::class, 'reinscrire']);
Route::get('/listereinscrit1', [ReinscriptionController::class, 'index']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('students', StudentController::class);
    Route::get('/conversations',                            [ChatController::class, 'index']);
    Route::post('/conversations',                           [ChatController::class, 'store']);
    Route::get('/conversations/{conversation}',             [ChatController::class, 'show']);
    Route::post('/conversations/{conversation}/messages',   [ChatController::class, 'sendMessage']);
    Route::post('/conversations/{conversation}/read',       [ChatController::class, 'markAsRead']);
    
    Route::put('/messages/{message}',                       [ChatController::class, 'updateMessage']);
    Route::delete('/messages/{message}',                    [ChatController::class, 'destroyMessage']);

    Route::get('/users',                                    [AuthController::class, 'index']);
    Route::post('/logout',                                  [AuthController::class, 'logout']);
});

