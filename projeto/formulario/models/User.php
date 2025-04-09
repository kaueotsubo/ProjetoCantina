<?php
class User {
    private $conn;
    private $table = 'usuarios';

    public $id;
    public $nome;
    public $email;
    public $senha;
    public $tipo;
    public $matricula;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function register() {
        $query = 'INSERT INTO ' . $this->table . '
                SET
                    nome = :nome,
                    email = :email,
                    senha = :senha,
                    tipo = :tipo';

        $stmt = $this->conn->prepare($query);

        // Sanitize and hash
        $this->nome = htmlspecialchars(strip_tags($this->nome));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->senha = password_hash($this->senha, PASSWORD_DEFAULT);
        $this->tipo = htmlspecialchars(strip_tags($this->tipo));

        // Bind data
        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':senha', $this->senha);
        $stmt->bindParam(':tipo', $this->tipo);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function login($tipo) {
        if ($tipo === 'discente') {
            $query = 'SELECT id, nome, email, senha, tipo, matricula FROM ' . $this->table . ' WHERE matricula = :matricula LIMIT 1';
            $stmt = $this->conn->prepare($query);
            $this->matricula = htmlspecialchars(strip_tags($this->matricula));
            $stmt->bindParam(':matricula', $this->matricula);
        } else {
            $query = 'SELECT id, nome, email, senha, tipo FROM ' . $this->table . ' WHERE email = :email LIMIT 1';
            $stmt = $this->conn->prepare($query);
            $this->email = htmlspecialchars(strip_tags($this->email));
            $stmt->bindParam(':email', $this->email);
        }

        if($stmt->execute()) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($row && password_verify($this->senha, $row['senha'])) {
                $this->id = $row['id'];
                $this->tipo = $row['tipo'];
                $this->nome = $row['nome'];
                return true;
            }
        }
        return false;
    }

    public function emailExists() {
        $query = 'SELECT id FROM ' . $this->table . ' WHERE email = :email LIMIT 1';
        $stmt = $this->conn->prepare($query);

        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(':email', $this->email);

        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
}
?>