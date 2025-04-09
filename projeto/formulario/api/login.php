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

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->identifier) && !empty($data->senha) && !empty($data->tipo)) {
    $user->tipo = $data->tipo;
    $user->senha = $data->senha;
    
    if($data->tipo === 'discente') {
        $user->matricula = $data->identifier;
    } else {
        $user->email = $data->identifier;
    }

    if($user->login($data->tipo)) {
        session_start();
        $_SESSION['id'] = $user->id;
        $_SESSION['tipo'] = $user->tipo;

        http_response_code(200);
        // Gerar um token simples para autenticação
        $token = bin2hex(random_bytes(32));
        $_SESSION['token'] = $token;

        echo json_encode(array(
            "message" => "Login realizado com sucesso.",
            "id" => $user->id,
            "email" => $user->email,
            "tipo" => $user->tipo,
            "token" => $token,
            "nome" => $user->nome
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Email ou senha inválidos."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Dados incompletos. Email e senha são obrigatórios."));
}
?>