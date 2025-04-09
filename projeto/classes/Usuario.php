<?php

    //Classe Usuario
    require_once 'C:\xampp\htdocs\projeto\classes\entidade.php';
    class Usuario extends entidade {
        private static $conn;

        //Método setConnection()
        public static function setConnection (PDO $conn) {
            self::$conn = $conn;
            UsuarioGateway::setConnection($conn);
        }//Fim do método setConnection

        //Método find()
        public static function find($codUsuario) {
            $usuarioGateway = new UsuarioGateway;
            return $usuarioGateway->find($codUsuario, 'Usuario');
        }//Método find()

        //Método all()
        public static function all ($filter = '') {
            $usuarioGateway = new UsuarioGateway;
            return $usuarioGateway->all($filter, 'Usuario');
        }//Fim do método all()

        //Método delete()
        public function delete () {
            $usuarioGateway = new UsuarioGateway;
            return $usuarioGateway->delete($this->id);
        }//Fim do método delete()

        //Método save()
        public function save () {
            $usuarioGateway = new UsuarioGateway;
            return $usuarioGateway->save((object)$this->data);
        }//Fim do método save()

        

    }//Fim da classe Usuario
?>