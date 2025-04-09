<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';

session_start();

// Verificar se o usuário está logado e é do tipo departamento
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'departamento') {
    http_response_code(403);
    echo json_encode(['message' => 'Acesso negado. Apenas usuários do departamento podem acessar esta informação.']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT d.matricula, d.nome, d.email, d.curso_id, c.nome as curso_nome 
              FROM discentes d 
              LEFT JOIN cursos c ON d.curso_id = c.id 
              ORDER BY d.nome";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $alunos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $alunos[] = [
            'matricula' => $row['matricula'],
            'nome' => $row['nome'],
            'email' => $row['email'],
            'curso_id' => $row['curso_id'],
            'curso_nome' => $row['curso_nome']
        ];
    }

    http_response_code(200);
    echo json_encode($alunos);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao buscar alunos.']);
}
?>