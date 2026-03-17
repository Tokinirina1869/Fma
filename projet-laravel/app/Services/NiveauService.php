<?php
    namespace App\Services;

    use App\Models\Niveau;
    use Illuminate\Support\Facades\Log;

    class NiveauService {

        public function getAllNiveaux(){
            try{
                $niveaux = Niveau::all();

                return [
                    'status' => "Succes",
                    'message' => "Liste avec succes",
                    'data' => $niveaux,
                ];

            }
            catch( \Exception $e){
                Log::error('Erreur: '.$e->getMessage());
                throw new \Exception('Erreur');
            }
        }

        public function createNiveau($data)
        {
            try{
                $niveaux = Niveau::create($data);

                return [
                    'status' => 'Succes',
                    'message' => 'Ajout niveau avec succes',
                    'data' =>$niveaux,
                ];
            }
            catch( \Exception $e){
                Log::error('Erreur: '.$e->getMessage());
                throw new \Exception('Erreur.');
            }
        }

        public function updateNiveau($data, $codeNiveau)
        {
            try{
                $niveaux = Niveau::where('code_niveau', $codeNiveau)->first();

                if(!$niveaux) {
                    throw new \Exception ("Niveau avec le '{$codeNiveau}' code");
                }
                
                $niveaux->fill($data)->save();

                return [
                    'status' => 'Succes',
                    'message' => 'Ajout niveau avec succes',
                    'data' =>$niveaux,
                ];
            }
            catch( \Exception $e){
                Log::error('Erreur: '.$e->getMessage());
                throw new \Exception('Erreur');
            }
        }

        public function deleteNiveau($codeNiveau){
            try{
                $niveaux = Niveau::where('code_niveau', $codeNiveau)->firstOrFail();

                $niveaux->delete();

                return [
                    'Status' => 'Succes',
                    'Message' => 'Suppression reussite',
                ];
            }

            catch( \Exception $e){
                Log::error('Erreur: '.$e->getMessage());
                throw new \Exception('Erreur');
            }
        }
    }