<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Inițializare coș în sesiune
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Produse predefinite (sincronizate cu script.js)
$products = [
    1 => ['id' => 1, 'name' => 'Varză proaspătă', 'price' => 33, 'unit' => 'kg'],
    2 => ['id' => 2, 'name' => 'Mix Fruit Jam', 'price' => 136, 'unit' => 'kg'],
    3 => ['id' => 3, 'name' => 'Salată-mix', 'price' => 30, 'unit' => 'kg'],
    4 => ['id' => 4, 'name' => 'Ananas', 'price' => 88, 'unit' => 'kg'],
    5 => ['id' => 5, 'name' => 'Grandanilla', 'price' => 389, 'unit' => 'kg'],
    10 => ['id' => 10, 'name' => 'Lapte 1L', 'price' => 15, 'unit' => 'buc'],
    11 => ['id' => 11, 'name' => 'Pâine albă', 'price' => 8, 'unit' => 'buc'],
    12 => ['id' => 12, 'name' => 'Detergent 2L', 'price' => 75, 'unit' => 'buc'],
    13 => ['id' => 13, 'name' => 'Bec LED 9W', 'price' => 45, 'unit' => 'buc'],
];

switch($action) {
    case 'add':
        $product_id = (int)$_POST['product_id'];
        $quantity = (int)$_POST['quantity'];
        
        if (isset($products[$product_id])) {
            $found = false;
            foreach ($_SESSION['cart'] as &$item) {
                if ($item['id'] === $product_id) {
                    $item['quantity'] += $quantity;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $_SESSION['cart'][] = [
                    'id' => $product_id,
                    'name' => $products[$product_id]['name'],
                    'price' => $products[$product_id]['price'],
                    'unit' => $products[$product_id]['unit'],
                    'quantity' => $quantity
                ];
            }
        }
        break;
        
    case 'remove':
        $product_id = (int)$_POST['product_id'];
        $_SESSION['cart'] = array_filter($_SESSION['cart'], function($item) use ($product_id) {
            return $item['id'] !== $product_id;
        });
        $_SESSION['cart'] = array_values($_SESSION['cart']);
        break;
        
    case 'update':
        $product_id = (int)$_POST['product_id'];
        $quantity = max(0, (int)$_POST['quantity']);
        
        foreach ($_SESSION['cart'] as &$item) {
            if ($item['id'] === $product_id) {
                if ($quantity <= 0) {
                    // Eliminăm dacă cantitatea e 0
                    $_SESSION['cart'] = array_filter($_SESSION['cart'], function($i) use ($product_id) {
                        return $i['id'] !== $product_id;
                    });
                    $_SESSION['cart'] = array_values($_SESSION['cart']);
                } else {
                    $item['quantity'] = $quantity;
                }
                break;
            }
        }
        break;
        
    case 'get':
        // Returnăm coșul curent
        $total = 0;
        $totalItems = 0;
        foreach ($_SESSION['cart'] as $item) {
            $total += $item['price'] * $item['quantity'];
            $totalItems += $item['quantity'];
        }
        
        echo json_encode([
            'success' => true,
            'cart' => $_SESSION['cart'],
            'total' => $total,
            'totalItems' => $totalItems
        ]);
        exit;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acțiune invalidă']);
        exit;
}

// Calculăm totalurile după operație
$total = 0;
$totalItems = 0;
foreach ($_SESSION['cart'] as $item) {
    $total += $item['price'] * $item['quantity'];
    $totalItems += $item['quantity'];
}

echo json_encode([
    'success' => true,
    'total' => $total,
    'totalItems' => $totalItems,
    'cart' => $_SESSION['cart']
]);
?>