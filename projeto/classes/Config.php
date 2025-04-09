<?php

    $dbHost = 'Localhost';
    $dbUsername = 'root';
    $dbpassword = '';
    $dbName = 'cantina'; 

    $conn = new PDO("mysql:dbname=". $dbName.";host=".$dbHost, $dbUsername, $dbpassword);

?>