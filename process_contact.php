<?php
// ============================================
// Script CGI pentru prelucrarea și memorarea
// datelor din formularul de contact
// Lucrarea de laborator N4 - Tehnologii web
// ============================================

// Setăm header-ul pentru răspuns HTTP
header('Content-Type: text/html; charset=utf-8');

// === FIX: Folosim calea absolută pentru fișier ===
$fisierMesaje = __DIR__ . '/mesaje.txt';

// === FIX: Verificăm dacă folderul are permisiuni de scriere ===
if (!is_writable(__DIR__)) {
    // Dacă nu avem permisiuni, salvăm într-un folder temporar
    $fisierMesaje = sys_get_temp_dir() . '/grocery_mesaje.txt';
}

// Inițializăm variabilele
$nume = $email = $subiect = $mesaj = '';
$eroare = '';

// Verificăm dacă datele au fost trimise prin metoda POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Preluăm datele din formular și le curățăm
    $nume = isset($_POST['contactName']) ? trim($_POST['contactName']) : '';
    $email = isset($_POST['contactEmail']) ? trim($_POST['contactEmail']) : '';
    $subiect = isset($_POST['contactSubject']) ? trim($_POST['contactSubject']) : '';
    $mesaj = isset($_POST['contactMsg']) ? trim($_POST['contactMsg']) : '';
    
    // Validare date (server-side)
    if (empty($nume)) {
        $eroare .= "Numele este obligatoriu. ";
    } elseif (strlen($nume) < 2) {
        $eroare .= "Numele trebuie să aibă cel puțin 2 caractere. ";
    }
    
    if (empty($email)) {
        $eroare .= "Email-ul este obligatoriu. ";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $eroare .= "Adresa de email nu este validă. ";
    }
    
    if (empty($mesaj)) {
        $eroare .= "Mesajul nu poate fi gol. ";
    } elseif (strlen($mesaj) < 10) {
        $eroare .= "Mesajul trebuie să aibă cel puțin 10 caractere. ";
    }
    
    // Dacă nu există erori, salvăm datele în fișier
    if (empty($eroare)) {
        
        // Obținem adresa IP a utilizatorului
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // Data și ora curentă
        $data = date('Y-m-d H:i:s');
        
        // Formatăm înregistrarea pentru fișier
        $inregistrare = "========================================\n";
        $inregistrare .= "Data: $data\n";
        $inregistrare .= "IP: $ip\n";
        $inregistrare .= "Nume: $nume\n";
        $inregistrare .= "Email: $email\n";
        $inregistrare .= "Subiect: " . ($subiect ?: '(fără subiect)') . "\n";
        $inregistrare .= "Mesaj:\n$mesaj\n";
        $inregistrare .= "========================================\n\n";
        
        // === FIX: Încercăm să scriem în fișier cu mai multe încercări ===
        $scrisCuSucces = false;
        
        // Încercare 1: file_put_contents
        if (file_put_contents($fisierMesaje, $inregistrare, FILE_APPEND | LOCK_EX) !== false) {
            $scrisCuSucces = true;
        }
        
        // Încercare 2: Dacă nu a mers, încercăm cu fopen/fwrite
        if (!$scrisCuSucces) {
            $handle = fopen($fisierMesaje, 'a');
            if ($handle) {
                if (flock($handle, LOCK_EX)) {
                    fwrite($handle, $inregistrare);
                    flock($handle, LOCK_UN);
                    $scrisCuSucces = true;
                }
                fclose($handle);
            }
        }
        
        if ($scrisCuSucces) {
            $succes = true;
        } else {
            $eroare = "Eroare la salvarea mesajului. Vă rugăm să încercați mai târziu.";
            // Adăugăm informații de debugging (opțional)
            $eroare .= " (Folder: " . __DIR__ . ")";
        }
    }
}

// Afișăm răspunsul către utilizator
?>
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status mesaj - GroceryMarket</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
    <style>
        .status-container {
            max-width: 600px;
            margin: 60px auto;
            padding: 40px;
            background: white;
            border-radius: 28px;
            box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .success-icon {
            font-size: 64px;
            color: #16a34a;
            margin-bottom: 20px;
        }
        .error-icon {
            font-size: 64px;
            color: #dc2626;
            margin-bottom: 20px;
        }
        .btn-back {
            display: inline-block;
            background: #c2410c;
            color: white;
            padding: 12px 28px;
            border-radius: 40px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: bold;
        }
        .btn-back:hover {
            background: #9a3412;
        }
        .info {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 16px;
            margin: 20px 0;
            text-align: left;
            font-size: 14px;
        }
        .debug-info {
            background: #fef3c7;
            padding: 10px;
            border-radius: 12px;
            font-size: 12px;
            color: #92400e;
            margin-top: 15px;
        }
    </style>
</head>
<body>

<div class="status-container">
    <?php if (isset($succes) && $succes === true): ?>
        <div class="success-icon">✅</div>
        <h2 style="color: #16a34a;">Mesaj trimis cu succes!</h2>
        <p>Dragă <strong><?php echo htmlspecialchars($nume); ?></strong>,</p>
        <p>Mulțumim pentru mesajul tău. Echipa noastră îți va răspunde în cel mai scurt timp posibil.</p>
        
        <div class="info">
            <strong>📋 Rezumatul mesajului tău:</strong><br>
            <strong>Email:</strong> <?php echo htmlspecialchars($email); ?><br>
            <?php if (!empty($subiect)): ?>
                <strong>Subiect:</strong> <?php echo htmlspecialchars($subiect); ?><br>
            <?php endif; ?>
            <strong>Mesaj:</strong> <?php echo nl2br(htmlspecialchars($mesaj)); ?>
        </div>
        
        <a href="contact.html" class="btn-back">← Trimite un alt mesaj</a>
        <a href="index.html" class="btn-back" style="background: #2b5e2b; margin-left: 10px;">🏠 Pagina principală</a>
        
    <?php else: ?>
        <div class="error-icon">❌</div>
        <h2 style="color: #dc2626;">Eroare la trimitere</h2>
        <p>Au apărut următoarele probleme:</p>
        <div class="info" style="background: #fee2e2; color: #991b1b;">
            <?php echo htmlspecialchars($eroare); ?>
        </div>
        
        <?php if (strpos($eroare, 'Folder:') !== false): ?>
        <div class="debug-info">
            <strong>🔧 Soluție rapidă:</strong><br>
            1. Creează manual fișierul <strong>mesaje.txt</strong> în folderul:<br>
            <code><?php echo __DIR__; ?></code><br>
            2. Dă-i permisiuni de scriere (click dreapta → Properties → Security → Edit → Allow Write)
        </div>
        <?php endif; ?>
        
        <a href="javascript:history.back()" class="btn-back">← Înapoi la formular</a>
    <?php endif; ?>
</div>

</body>
</html>