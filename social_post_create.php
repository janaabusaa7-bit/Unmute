<?php
require_once "social_bootstrap.php";

$content = $_POST['content'] ?? '';
$content_ar = $_POST['content_ar'] ?? '';
$content_en = $_POST['content_en'] ?? '';
$media = $_POST['media_url'] ?? '';
$type = $_POST['media_type'] ?? '';

if (!$content && !$content_ar && !$content_en && !$media) {
    echo json_encode(["success" => false, "message" => "Empty"]);
    exit;
}

$mediaPath = null;

if ($media && strpos($media, 'data:') === 0) {

    $folder = "uploads/";
    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }

    $ext = ($type === "video") ? "mp4" : "png";
    $fileName = time() . "_" . rand(1000,9999) . "." . $ext;
    $filePath = $folder . $fileName;

    $data = explode(',', $media);
    file_put_contents($filePath, base64_decode($data[1]));

    $mediaPath = $filePath;
}

$stmt = $conn->prepare("
INSERT INTO post 
(user_id, content_text, content_ar, content_en, media_url, media_type, created_at)
VALUES (?, ?, ?, ?, ?, ?, NOW())
");

$stmt->bind_param("isssss",
    $currentUserId,
    $content,
    $content_ar,
    $content_en,
    $mediaPath,
    $type
);

$stmt->execute();

echo json_encode(["success" => true]);
