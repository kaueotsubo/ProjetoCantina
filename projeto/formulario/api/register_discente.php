<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';
include_once '../models/User.php';

// Habilitar log de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/php-error.log');

$database = new Database();
$db = $database->getConnection();

// Log dos dados recebidos
error_log('Dados do POST recebidos: ' . print_r($_POST, true));
error_log('Dados do FILES recebidos: ' . print_r($_FILES, true));

// Verificar se todos os campos necessários foram enviados
if (
    !empty($_POST['matricula']) &&
    !empty($_POST['nome']) &&
    !empty($_POST['email']) &&
    !empty($_POST['senha']) &&
    !empty($_POST['curso']) &&
    !empty($_FILES['foto'])
) {
    // Validar o upload da foto
    $foto = $_FILES['foto'];
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    $max_size = 5 * 1024 * 1024; // 5MB

    if (!in_array($foto['type'], $allowed_types)) {
        error_log('Tipo de arquivo não permitido: ' . $foto['type']);
        http_response_code(400);
        echo json_encode(['message' => 'Tipo de arquivo não permitido. Use apenas JPG, PNG ou GIF.']);
        exit;
    }

    if ($foto['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(['message' => 'O tamanho do arquivo não pode exceder 5MB.']);
        exit;
    }

    // Gerar nome único para a foto
    $foto_ext = pathinfo($foto['name'], PATHINFO_EXTENSION);
    $foto_nome = uniqid() . '.' . $foto_ext;
    $foto_path = '../uploads/fotos/' . $foto_nome;

    // Criar diretório se não existir
    if (!file_exists('../uploads/fotos')) {
        if (!mkdir('../uploads/fotos', 0777, true)) {
            error_log('Erro ao criar diretório de uploads');
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao criar diretório de uploads']);
            exit;
        }
    }

    // Mover a foto para o diretório de uploads
    if (move_uploaded_file($foto['tmp_name'], $foto_path)) {
        // Atualizar permissões do arquivo
        chmod($foto_path, 0644);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Erro ao fazer upload da foto.']);
        exit;
    }

    try {
        // Preparar a query para inserir o discente
        $query = "INSERT INTO discentes (matricula, nome, email, senha, foto, curso_id) 
                  VALUES (:matricula, :nome, :email, :senha, :foto, :curso_id)";
        
        $stmt = $db->prepare($query);

        // Hash da senha
        $hashed_password = password_hash($_POST['senha'], PASSWORD_DEFAULT);

        // Bind dos parâmetros
        $stmt->bindParam(':matricula', $_POST['matricula']);
        $stmt->bindParam(':nome', $_POST['nome']);
        $stmt->bindParam(':email', $_POST['email']);
        $stmt->bindParam(':senha', $hashed_password);
        $stmt->bindParam(':foto', $foto_nome);
        $stmt->bindParam(':curso_id', $_POST['curso']);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['message' => 'Discente cadastrado com sucesso!']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao cadastrar discente.']);
        }
    } catch (PDOException $e) {
        error_log('Erro PDO: ' . $e->getMessage());
        http_response_code(500);
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            echo json_encode(['message' => 'Este email já está cadastrado.']);
        } else {
            echo json_encode(['message' => 'Erro ao cadastrar discente: ' . $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Dados incompletos. Todos os campos são obrigatórios.']);
}
?>