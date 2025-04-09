<?php

    //Subclasse Discente
    require_once 'C:\xampp\htdocs\projeto\classes\entidade.php';
    class Discente extends entidade {
        private static $conn;

        //Método setConnection()
        public static function setConnection (PDO $conn) {
            self::$conn = $conn;
            DiscenteGateway::setConnection($conn);
        }//Fim do método setConnection

        //Método find()
        public static function find($codUsuario) {
            $discenteGateway = new DiscenteGateway;
            return $discenteGateway->find($codUsuario, 'discente');
        }//Método find()

        //Método all()
        public static function all ($filter = '') {
            $discenteGateway = new DiscenteGateway;
            return $discenteGateway->all($filter, 'discente');
        }//Fim do método all()

        //Método delete()
        public function delete () {
            $discenteGateway = new DiscenteGateway;
            return $discenteGateway->delete($this->id);
        }//Fim do método delete()

        //Método save()
        public function save () {
            $discenteGateway = new DiscenteGateway;
            return $discenteGateway->save((object)$this->data);
        }//Fim do método save()

        

    }//Fim da classe Discente
?>