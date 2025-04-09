<?php

    //Classe UsuarioGateway
    class UsuarioGateway {
        private static $conn;

        //Método setConnection()
        public static function setConnection (PDO $conn) {
            self::$conn = $conn; 
        }//Fim do método setConnection()

        //Método find()
        public function find ($id, $class = 'stdClass') {
            $sql = "SELECT * FROM usuarios WHERE id = '$id'";
            print "$sql <br>\n";
            $result = self::$conn->query($sql);
            return $result->fetchObject($class);
        }//Fim do método find()

        //Método all()
        public function all ($filter, $class = 'stdClass') {
            $sql = "SELECT * FROM usuarios ";
            if ($filter) {
                $sql .= "WHERE $filter";
            }
            print "$sql <br>\n";
            $result = self::$conn->query($sql);
            return $result->fetchAll(PDO::FETCH_CLASS, $class);
        }//Fim do método all()

        //Método delete()
        public function delete ($id) {
            $sql = "DELETE FROM usuarios WHERE id = '$id'";
            print "$sql <br>\n";
            return self::$conn->query($sql);
        }//Fim do método delete()

        //Método save()
        public function save ($data) {
            if (empty($data->id)) { //Id não localizado - Insere
                $sql = "INSERT INTO usuarios (nome, email, senha, tipo) 
                VALUES ('{$data->nome}', '{$data->email}', '{$data->senha}', '{$data->tipo}')";                
            }
            else { //Id localizado - Atualiza
                $sql = "UPDATE usuarios SET 
                nome = '{$data->nome}', 
                email = '{$data->email}',
                senha = '{$data->senha}',
                tipo = '{$data->tipo}' WHERE 
                id = '{$data->id}'";
            }
            print "$sql <br>\n";
            return self::$conn->exec($sql); //executa a instrução SQL
        }//Fim do método save()

        //Método getLastId()
        public function getLastId() {
            $sql = "SELECT max(id) as max FROM usuarios";
            $result = self::$conn->query($sql);
            $data = $result->fetch(PDO::FETCH_OBJ);
            return $data->max;
        }//Fim do método getLastId()
    }//Fim da classe UsuarioGateway
?>