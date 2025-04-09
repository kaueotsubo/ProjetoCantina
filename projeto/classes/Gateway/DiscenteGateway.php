<?php

    //Classe DiscenteGateway
    class DiscenteGateway {
        private static $conn;

        //Método setConnection()
        public static function setConnection (PDO $conn) {
            self::$conn = $conn; 
        }//Fim do método setConnection()

        //Método find()
        public function find ($id, $class = 'stdClass') {
            $sql = "SELECT d.*, c.nome as curso_nome FROM discentes d 
                    LEFT JOIN cursos c ON d.curso_id = c.id 
                    WHERE d.id = '$id'";
            print "$sql <br>\n";
            $result = self::$conn->query($sql);
            return $result->fetchObject($class);
        }//Fim do método find()

        //Método all()
        public function all ($filter, $class = 'stdClass') {
            $sql = "SELECT d.*, c.nome as curso_nome FROM discentes d 
                    LEFT JOIN cursos c ON d.curso_id = c.id ";
            if ($filter) {
                $sql .= "WHERE $filter";
            }
            print "$sql <br>\n";
            $result = self::$conn->query($sql);
            return $result->fetchAll(PDO::FETCH_CLASS, $class);
        }//Fim do método all()

        //Método delete()
        public function delete ($codusuario) {
            $sql = "DELETE FROM discentes WHERE id = '$codusuario'";
            print "$sql <br>\n";
            return self::$conn->query($sql);
        }//Fim do método delete()

        //Método save()
        public function save ($data) {
            if (empty($data->id)) { //Id não localizado - Insere
                $sql = "INSERT INTO discentes (nome, foto, curso_id) 
                        VALUES ('{$data->nome}', '{$data->foto}', 
                        {$data->curso_id})"; 
            }
            else { //Id localizado - Atualiza
                $sql = "UPDATE discentes SET 
                        nome = '{$data->nome}', 
                        foto = '{$data->foto}',
                        curso_id = {$data->curso_id},
                         
                        WHERE id = '{$data->id}'";
            }
            print "$sql <br>\n";
            return self::$conn->exec($sql); //executa a instrução SQL
        }//Fim do método save()

        //Método getLastId()
        public function getLastId() {
            $sql = "SELECT max(id) as max FROM discentes";
            $result = self::$conn->query($sql);
            $data = $result->fetch(PDO::FETCH_OBJ);
            return $data->max;
        }//Fim do método getLastId()
    }//Fim da classe DiscenteGateway
?>