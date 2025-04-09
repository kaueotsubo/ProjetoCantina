<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "INSERT INTO projetos (nome) VALUES ('Projeto 1'), ('Projeto 2'), ('Projeto 3'), ('Projeto 4'), ('Projeto 5') ON DUPLICATE KEY UPDATE nome = VALUES(nome)";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $query = "SELECT id, nome FROM projetos ORDER BY nome";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $projetos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $projetos[] = $row;
    }

    http_response_code(200);
    echo json_encode($projetos);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao buscar projetos.']);
}
?>