<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';

session_start();

// Verificar se o usuário está logado e é do tipo departamento
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'departamento') {
    http_response_code(403);
    echo json_encode(['message' => 'Acesso negado. Apenas usuários do departamento podem realizar esta operação.']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->matricula) && !empty($data->curso_id)) {
    try {
        $query = "UPDATE discentes SET curso_id = :curso_id WHERE matricula = :matricula";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':matricula', $data->matricula);
        $stmt->bindParam(':curso_id', $data->curso_id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Curso atribuído com sucesso!']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao atribuir curso.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Erro ao atribuir curso: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Dados incompletos. Matrícula e curso são obrigatórios.']);
}
?>