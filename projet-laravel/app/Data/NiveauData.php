<?php 
    namespace App\Data;

    class NiveauData{
        
        private $codeNiveau;
        private $nomNiveau;

        public function __construct(array $data) {
            $this->codeNiveau = $data['code_niveau'] ?? null;
            $this->nomNiveau = $data['nomniveau'] ?? null;
        }

        public function toArray(){
            return [
                'code_niveau' => $this->codeNiveau,
                'nomniveau' => $this->nomNiveau,
            ];
        }

    }