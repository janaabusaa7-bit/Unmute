<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once "includes/i18n.php";
require_once "config.php";

$message = "";
$message_type = "error";
$token = trim($_GET["token"] ?? "");

if ($token === "") {
    $message = __('err_invalid_token');
} else {
    $stmt = $conn->prepare("SELECT user_id, email, is_verified, email_verify_expires FROM users WHERE email_verify_token = ? LIMIT 1");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {
        $message = __('err_token_unavailable');
    } else {
        $user = $result->fetch_assoc();

        if ((int)$user["is_verified"] === 1) {
            $message = __('succ_already_verified');
            $message_type = "success";
        } elseif (!empty($user["email_verify_expires"]) && strtotime($user["email_verify_expires"]) < time()) {
            $message = __('err_verify_expired');
        } else {
            $updateStmt = $conn->prepare("UPDATE users SET is_verified = 1, email_verify_token = NULL, email_verify_expires = NULL WHERE user_id = ? LIMIT 1");
            $updateStmt->bind_param("i", $user["user_id"]);

            if ($updateStmt->execute()) {
                $message = __('succ_account_verified');
                $message_type = "success";
                $_SESSION["success"] = $message;
            } else {
                $message = __('err_verify_failed');
            }

            $updateStmt->close();
        }
    }

    $stmt->close();
}
?>
<?php
$lang_code = $_SESSION['lang'] ?? 'ar';
$dir = $lang_code === 'en' ? 'ltr' : 'rtl';
?>
<!DOCTYPE html>
<html lang="<?php echo $lang_code; ?>" dir="<?php echo $dir; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تفعيل البريد | Unmute</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/global.css">
    <style>
        body { font-family: "Cairo", sans-serif; background: var(--page-bg); color: var(--page-text); }
        .verify-box { max-width: 560px; margin: 120px auto; background: var(--card-bg); padding: 34px; border-radius: 22px; text-align: center; box-shadow: 0 18px 40px rgba(0,0,0,.08); }
        .verify-box h1 { color: #0b3d91; margin-bottom: 14px; font-size: 28px; }
        .verify-box p { line-height: 1.9; margin-bottom: 20px; }
        .verify-box a { display: inline-block; text-decoration: none; background: linear-gradient(135deg, #0b3d91, #164ea6); color: #fff; padding: 12px 22px; border-radius: 12px; font-weight: 700; }
        .success-text { color: #1d7a35; }
        .error-text { color: #c62828; }
    </style>
</head>
<body>
    <div class="verify-box">
        <h1><?php echo __('verify_title'); ?></h1>
        <p class="<?php echo $message_type === 'success' ? 'success-text' : 'error-text'; ?>"><?php echo htmlspecialchars($message); ?></p>
        <a href="login.php"><?php echo __('verify_back_login'); ?></a>
    </div>
</body>
</html>

