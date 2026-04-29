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
        
        // ============================================
        // TRIMITERE EMAIL - MODIFICAREA PRINCIPALĂ
        // ============================================
        $emailTrimisCuSucces = false;
        
        if ($scrisCuSucces) {
            // Setări email
            $to = "feliciamuntean11@gmail.com"; // Înlocuiește cu emailul tău real
            $email_subject = "Mesaj nou de la: " . $nume;
            $headers = "From: " . $email . "\r\n";
            $headers .= "Reply-To: " . $email . "\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
            
            // Construim corpul emailului în format HTML
            $message_body = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #c2410c; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #c2410c; }
                    .value { margin-top: 5px; padding: 8px; background: white; border-radius: 5px; }
                    .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>📬 Mesaj nou din formularul de contact</h2>
                        <p>GroceryMarket</p>
                    </div>
                    <div class='content'>
                        <div class='field'>
                            <div class='label'>👤 Nume:</div>
                            <div class='value'>" . htmlspecialchars($nume) . "</div>
                        </div>
                        <div class='field'>
                            <div class='label'>📧 Email:</div>
                            <div class='value'>" . htmlspecialchars($email) . "</div>
                        </div>";
            
            if (!empty($subiect)) {
                $message_body .= "
                        <div class='field'>
                            <div class='label'>📌 Subiect:</div>
                            <div class='value'>" . htmlspecialchars($subiect) . "</div>
                        </div>";
            }
            
            $message_body .= "
                        <div class='field'>
                            <div class='label'>💬 Mesaj:</div>
                            <div class='value'>" . nl2br(htmlspecialchars($mesaj)) . "</div>
                        </div>
                        <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;'>
                        <div class='field'>
                            <div class='label'>🌐 IP Utilizator:</div>
                            <div class='value'>" . htmlspecialchars($ip) . "</div>
                        </div>
                        <div class='field'>
                            <div class='label'>📅 Data trimiterii:</div>
                            <div class='value'>" . htmlspecialchars($data) . "</div>
                        </div>
                    </div>
                    <div class='footer'>
                        <p>Acest mesaj a fost generat automat de sistemul de contact GroceryMarket.</p>
                        <p>© 2026 GroceryMarket - Toate drepturile rezervate</p>
                    </div>
                </div>
            </body>
            </html>";
            
            // Încercăm să trimitem emailul
            if (function_exists('mail')) {
                $emailTrimisCuSucces = mail($to, $email_subject, $message_body, $headers);
                
                if (!$emailTrimisCuSucces) {
                    // Dacă mail() e dezactivat, încercăm o metodă alternativă
                    error_log("Mail function failed for contact from: $email");
                }
            } else {
                $eroare = "Funcția mail() nu este disponibilă pe acest server. ";
                error_log("mail() function is not available on this server");
            }
        }
        
        // Setăm succesul final
        if ($scrisCuSucces) {
            $succes = true;
            if (!$emailTrimisCuSucces) {
                $eroare = "Mesajul a fost salvat dar nu s-a putut trimite notificarea pe email. ";
            }
        } else {
            $eroare = "Eroare la salvarea mesajului. Vă rugăm să încercați mai târziu.";
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
        .warning-icon {
            font-size: 64px;
            color: #f59e0b;
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
        .warning-info {
            background: #fef3c7;
            padding: 15px;
            border-radius: 16px;
            margin: 20px 0;
            text-align: left;
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
        
        <?php if (!$emailTrimisCuSucces): ?>
        <div class="warning-info">
            <strong>⚠️ Notificare:</strong><br>
            Mesajul tău a fost salvat în sistem, dar notificarea pe email nu a putut fi trimisă automat. 
            Echipa noastră va verifica manual mesajele primite.
        </div>
        <?php endif; ?>
        
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