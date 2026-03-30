<?php
// ============================================
// Pagină ADMIN pentru vizualizarea mesajelor
// Acces: http://localhost/vizualizare_mesaje.php
// ============================================

$fisierMesaje = 'mesaje.txt';

// Parolă simplă pentru protecție (poți modifica)
$parolaCorecta = 'admin123';

$mesajEroare = '';
$continutMesaje = '';

// Verificare parolă
if (isset($_POST['parola']) && $_POST['parola'] === $parolaCorecta) {
    if (file_exists($fisierMesaje)) {
        $continutMesaje = file_get_contents($fisierMesaje);
        if ($continutMesaje === false) {
            $mesajEroare = "Nu s-a putut citi fișierul cu mesaje.";
        } elseif (empty(trim($continutMesaje))) {
            $mesajEroare = "Încă nu există mesaje trimise.";
        }
    } else {
        $mesajEroare = "Fișierul cu mesaje nu există încă. Niciun mesaj nu a fost trimis.";
    }
} elseif (isset($_POST['parola'])) {
    $mesajEroare = "Parolă incorectă!";
}
?>
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Vizualizare mesaje</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .admin-container {
            max-width: 900px;
            margin: 40px auto;
            padding: 30px;
            background: white;
            border-radius: 28px;
            box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);
        }
        pre {
            background: #1f2937;
            color: #e5e7eb;
            padding: 20px;
            border-radius: 16px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        input[type="password"] {
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 40px;
            width: 200px;
        }
        button {
            background: #c2410c;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 40px;
            cursor: pointer;
        }
        .stats {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 16px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
<div class="admin-container">
    <h1>📬 Panou de administrare - Mesaje primite</h1>
    
    <?php if (!$continutMesaje && !$mesajEroare): ?>
        <form method="POST">
            <p>Introduceți parola pentru a vizualiza mesajele:</p>
            <input type="password" name="parola" placeholder="Parola">
            <button type="submit">Accesează</button>
        </form>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">* Parola implicită: <strong>admin123</strong></p>
    <?php elseif ($mesajEroare): ?>
        <div style="background: #fee2e2; padding: 15px; border-radius: 16px; color: #991b1b;">
            <?php echo htmlspecialchars($mesajEroare); ?>
        </div>
        <a href="vizualizare_mesaje.php" style="display: inline-block; margin-top: 20px;">← Încearcă din nou</a>
    <?php else: ?>
        <div class="stats">
            <strong>📊 Statistici:</strong><br>
            Număr total de caractere: <?php echo strlen($continutMesaje); ?><br>
            Număr de linii: <?php echo substr_count($continutMesaje, "\n"); ?><br>
            Ultima actualizare: <?php echo date("Y-m-d H:i:s", filemtime($fisierMesaje)); ?>
        </div>
        
        <h3>📝 Conținutul mesajelor:</h3>
        <pre><?php echo htmlspecialchars($continutMesaje); ?></pre>
        
        <div style="margin-top: 20px;">
            <a href="vizualizare_mesaje.php" style="background: #2b5e2b; color: white; padding: 8px 16px; border-radius: 30px; text-decoration: none;">⟳ Reîmprospătează</a>
            <a href="index.html" style="background: #6b7280; color: white; padding: 8px 16px; border-radius: 30px; text-decoration: none; margin-left: 10px;">← Acasă</a>
        </div>
    <?php endif; ?>
</div>
</body>
</html>