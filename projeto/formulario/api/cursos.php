<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, nome FROM cursos ORDER BY nome";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $cursos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $cursos[] = $row;
    }

    http_response_code(200);
    echo json_encode($cursos);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao buscar cursos.']);
}
?>