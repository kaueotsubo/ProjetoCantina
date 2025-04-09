<?php

    //Classe CardapioGateway
    class CardapioGateway {
        private static $conn;

        //Método setConnection()
        public static function setConnection (PDO $conn) {
            self::$conn = $conn; 
        }//Fim do método setConnection()

        //Método find()
        public function find ($id, $class = 'stdClass') {
            $sql = "SELECT * FROM cardapio WHERE id = '$id'";
            print "$sql <br>\n";
            $result = self::$conn->query($sql);
            return $result->fetchObject($class);
        }//Fim do método find()

        //Método all()
        public function all ($filter, $class = 'stdClass') {
            $sql = "SELECT * FROM cardapio ";
            if ($filter) {
                $sql .= "WHERE $filter";
            }
            print "$sql <br>\n";
            $result = self::$conn->query($sql);
            return $result->fetchAll(PDO::FETCH_CLASS, $class);
        }//Fim do método all()

        //Método delete()
        public function delete ($id) {
            $sql = "DELETE FROM cardapio WHERE id = '$id'";
            print "$sql <br>\n";
            return self::$conn->query($sql);
        }//Fim do método delete()

        //Método save()
        public function save ($data) {
            if (empty($data->id)) { //Id não localizado - Insere
                $sql = "INSERT INTO cardapio (data, descricao) 
                        VALUES ('{$data->data}', '{$data->descricao}')"; 
            }
            else { //Id localizado - Atualiza
                $sql = "UPDATE cardapio SET 
                        data = '{$data->data}', 
                        descricao = '{$data->descricao}' 
                        WHERE id = '{$data->id}'";
            }
            print "$sql <br>\n";
            return self::$conn->exec($sql); //executa a instrução SQL
        }//Fim do método save()

        //Método getLastId()
        public function getLastId() {
            $sql = "SELECT max(id) as max FROM cardapio";
            $result = self::$conn->query($sql);
            $data = $result->fetch(PDO::FETCH_OBJ);
            return $data->max;
        }//Fim do método getLastId()
    }//Fim da classe CardapioGateway
?>