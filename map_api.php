<?php
/*
     يجلب الأماكن من قاعدة البيانات
     يفلترها حسب الفئة أو المدينة
    ويرجعها بصيغة JSON
*/

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

/*
    نتأكد أن المستخدم مسجل دخول
*/
if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once 'config.php';

/*
    فعلنا تقارير أخطاء MySQL حتى تظهر أثناء التطوير
*/
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    /*
        نأخذ الفلاتر القادمة من الرابط
    */
    $category = trim($_GET['category'] ?? '');
    $city     = trim($_GET['city'] ?? '');

    /*
        نبني الاستعلام الأساسي
    */
    $sql = "SELECT * FROM places WHERE 1=1";
    $params = [];
    $types = "";

    /*
        إذا في فئة مختارة نضيفها للاستعلام
    */
    if ($category !== '') {
        $sql .= " AND category = ?";
        $params[] = $category;
        $types .= "s";
    }

    /*
        إذا المستخدم كتب مدينة أو كلمة بحث
        نبحث في المدينة والعنوان والاسم
    */
    if ($city !== '') {
        $sql .= " AND (city LIKE ? OR address LIKE ? OR name LIKE ?)";
        $cityParam = "%$city%";

        $params[] = $cityParam;
        $params[] = $cityParam;
        $params[] = $cityParam;
        $types .= "sss";
    }

    /*
        نجهز الاستعلام
    */
    $stmt = $conn->prepare($sql);

    /*
        هنا ربطنا البراميترز حسب عددهم
        حتى يكون الكود واضح وبسيط
    */
    if (!empty($params)) {
        if (count($params) === 1) {
            $stmt->bind_param($types, $params[0]);
        } elseif (count($params) === 3) {
            $stmt->bind_param($types, $params[0], $params[1], $params[2]);
        } elseif (count($params) === 4) {
            $stmt->bind_param($types, $params[0], $params[1], $params[2], $params[3]);
        }
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $places = [];

    /*
        هنا حولنا كل صف من قاعدة البيانات
        إلى شكل مرتب نرسله للواجهة
    */
    while ($row = $result->fetch_assoc()) {
        $places[] = [
            "id" => (int)$row["place_id"],
            "name" => $row["name"],
            "city" => $row["city"],
            "address" => $row["address"],
            "category" => $row["category"],
            "description" => $row["description"],
            "rating" => $row["rating"] !== null ? (float)$row["rating"] : null,
            "lat" => $row["latitude"] !== null ? (float)$row["latitude"] : null,
            "lng" => $row["longitude"] !== null ? (float)$row["longitude"] : null,
            "phone" => $row["phone"],
            "whatsapp" => $row["whatsapp"],
            "website" => $row["website"],
            "accessibility_notes" => $row["accessibility_notes"],
            "is_verified" => (int)$row["is_verified"]
        ];
    }

    /*
        نرجع النتيجة النهائية بنجاح
    */
    echo json_encode([
        "success" => true,
        "places" => $places
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    /*
        إذا صار خطأ نرجعه بشكل واضح
    */
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>