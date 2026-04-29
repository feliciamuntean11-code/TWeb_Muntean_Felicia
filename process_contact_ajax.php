<?php
header('Content-Type: application/json; charset=utf-8');

$fisierMesaje = __DIR__ . '/mesaje.txt';

// Preluăm datele
$nume = isset($_POST['contactName']) ? trim($_POST['contactName']) : '';
$email = isset($_POST['contactEmail']) ? trim($_POST['contactEmail']) : '';
$subiect = isset($_POST['contactSubject']) ? trim($_POST['contactSubject']) : '';
$mesaj = isset($_POST['contactMsg']) ? trim($_POST['contactMsg']) : '';

$eroare = '';

// Validare
if (empty($nume)) {
    $eroare = "Numele este obligatoriu.";
} elseif (strlen($nume) < 2) {
    $eroare = "Numele trebuie să aibă cel puțin 2 caractere.";
} elseif (empty($email)) {
    $eroare = "Email-ul este obligatoriu.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $eroare = "Adresa de email nu este validă.";
} elseif (empty($mesaj)) {
    $eroare = "Mesajul nu poate fi gol.";
} elseif (strlen($mesaj) < 10) {
    $eroare = "Mesajul trebuie să aibă cel puțin 10 caractere.";
}

if (!empty($eroare)) {
    echo json_encode(['success' => false, 'message' => $eroare]);
    exit;
}

// Salvăm în fișier
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$data = date('Y-m-d H:i:s');

$inregistrare = "========================================\n";
$inregistrare .= "Data: $data\n";
$inregistrare .= "IP: $ip\n";
$inregistrare .= "Nume: $nume\n";
$inregistrare .= "Email: $email\n";
$inregistrare .= "Subiect: " . ($subiect ?: '(fără subiect)') . "\n";
$inregistrare .= "Mesaj:\n$mesaj\n";
$inregistrare .= "========================================\n\n";

$salvat = file_put_contents($fisierMesaje, $inregistrare, FILE_APPEND | LOCK_EX);

if ($salvat !== false) {
    // Încercăm să trimitem email notificare
    $to = "feliciamuntean11@gmail.com";
    $subject = "Mesaj nou de la: " . $nume;
    $headers = "From: " . $email . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    $message_body = "<h3>Mesaj nou din formular</h3>
    <p><strong>Nume:</strong> $nume</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Mesaj:</strong><br>" . nl2br(htmlspecialchars($mesaj)) . "</p>";
    
    @mail($to, $subject, $message_body, $headers);
    
    echo json_encode(['success' => true, 'message' => 'Mesajul a fost trimis cu succes! Vom reveni în maxim 24 de ore.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Eroare la salvarea mesajului. Încercați din nou.']);
}
?>