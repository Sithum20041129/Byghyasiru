<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
echo "Testing helpers inclusion...<br>";
require_once __DIR__ . '/../helpers.php';
echo "Helpers included successfully.<br>";
require_once __DIR__ . '/../db.php';
echo "DB included successfully.<br>";
