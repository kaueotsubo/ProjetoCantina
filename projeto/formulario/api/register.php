<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = (object) $_POST;

// Log dos dados recebidos para debug
error_log('Dados recebidos: ' . print_r($data, true));

// Validação detalhada dos campos
$errors = [];
if(empty($data->nome)) $errors[] = 'Nome é obrigatório';
if(empty($data->email)) $errors[] = 'Email é obrigatório';
if(empty($data->senha)) $errors[] = 'Senha é obrigatória';
if(empty($data->tipo)) $errors[] = 'Tipo é obrigatório';
if(!empty($data->tipo) && !in_array($data->tipo, ['departamento', 'empresa', 'fiscal'])) {
    $errors[] = 'Tipo de usuário inválido';
}

if(empty($errors)) {
    
    $user->nome = $data->nome;
    $user->email = $data->email;
    $user->senha = $data->senha;
    $user->tipo = $data->tipo;

    if($user->emailExists()) {
        header('Location: ../register.html?error=email_exists');
        exit();
        exit();
    }

    if($user->register()) {
        header('Location: ../login.html');
        exit();
    } else {
        header('Location: ../register.html?error=registration_failed');
        exit();
    }
} else {
    http_response_code(400);
    $errorMessage = 'Dados incompletos: ' . implode(', ', $errors);
    echo json_encode(array("message" => $errorMessage));
}
?>