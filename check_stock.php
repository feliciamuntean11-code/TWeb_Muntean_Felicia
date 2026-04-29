<?php
header('Content-Type: application/json; charset=utf-8');

// Simulare stocuri pentru produse
$stock = [
    10 => ['name' => 'Lapte 1L', 'stock' => 25, 'price' => 15],      // Lapte
    11 => ['name' => 'Pâine albă', 'stock' => 50, 'price' => 8],
    12 => ['name' => 'Detergent 2L', 'stock' => 12, 'price' => 75],
    13 => ['name' => 'Bec LED 9W', 'stock' => 8, 'price' => 45],
];

$product_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$requested_qty = isset($_GET['qty']) ? (int)$_GET['qty'] : 1;

if (!isset($stock[$product_id])) {
    echo json_encode(['error' => true, 'message' => 'Produs negăsit']);
    exit;
}

$product = $stock[$product_id];
$available = $product['stock'];
$price = $product['price'];
$totalPrice = $price * $requested_qty;

$response = [
    'success' => true,
    'product_id' => $product_id,
    'product_name' => $product['name'],
    'available_stock' => $available,
    'requested_qty' => $requested_qty,
    'is_available' => $requested_qty <= $available,
    'price_per_unit' => $price,
    'total_price' => $totalPrice,
    'max_allowed' => $available,
    'warning' => $requested_qty > $available ? "Stoc insuficient! Maxim disponibil: $available buc." : null
];

echo json_encode($response);
?>