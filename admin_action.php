<?php
/**
 * admin_action.php
 * الباك-إند الكامل لكل عمليات لوحة الأدمن
 * يستقبل طلبات JSON من admin.js ويعيد JSON
 *
 * جميع الطلبات تمر عبر POST بصيغة:
 * { "action": "اسم_العملية", ...باقي البيانات }
 */
if (session_status() === PHP_SESSION_NONE) { session_start(); }

header('Content-Type: application/json; charset=utf-8');

/* ── حماية: يُسمح للأدمن فقط ── */
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['ok' => false, 'msg' => 'Unauthorized']);
    exit();
}

include 'config.php';

/* بيانات الجلسة */
$myId    = (int)$_SESSION['user_id'];
$isSuper = (bool)($_SESSION['is_super'] ?? false);

/* قراءة الطلب */
$raw    = file_get_contents('php://input');
$in     = json_decode($raw, true) ?: [];
$action = trim($in['action'] ?? '');
$id     = (int)($in['id'] ?? 0);

/* ── Helper: هل الجدول موجود؟ ── */
function tblExists(mysqli $conn, string $table): bool {
    $t = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $r = $conn->query("SHOW TABLES LIKE '$t'");
    return $r && $r->num_rows > 0;
}

/* ── Helper: إرسال نجاح ── */
function ok(array $extra = []): void {
    echo json_encode(array_merge(['ok' => true], $extra));
    exit();
}

/* ── Helper: إرسال خطأ ── */
function fail(string $msg): void {
    echo json_encode(['ok' => false, 'msg' => $msg]);
    exit();
}

/* ════════════════════════════════════════════════════════════
   الإحصائيات الرئيسية — للصفحة الرئيسية
   ════════════════════════════════════════════════════════════ */
if ($action === 'get_stats') {
    $s = [];

    /* عدد المستخدمين النشطين/الموقوفين */
    $r = $conn->query("SELECT is_active, COUNT(*) c FROM users WHERE role != 'admin' GROUP BY is_active");
    $s['users_active']   = 0;
    $s['users_inactive'] = 0;
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            if ($row['is_active']) $s['users_active']   = (int)$row['c'];
            else                   $s['users_inactive'] = (int)$row['c'];
        }
    }
    $s['users_total'] = $s['users_active'] + $s['users_inactive'];

    /* عدد الصم */
    $r = $conn->query("SELECT COUNT(*) c FROM users WHERE role='deaf' AND is_active=1");
    $s['deaf'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    /* عدد الأدمن */
    $r = $conn->query("SELECT COUNT(*) c FROM users WHERE role='admin'");
    $s['admins'] = $r ? (int)$r->fetch_assoc()['c'] : 0;

    /* المنشورات */
    $s['posts'] = 0;
    if (tblExists($conn, 'post')) {
        $r = $conn->query("SELECT COUNT(*) c FROM post");
        $s['posts'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
    }

    /* التعليقات */
    $s['comments'] = 0;
    if (tblExists($conn, 'comment')) {
        $r = $conn->query("SELECT COUNT(*) c FROM comment");
        $s['comments'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
    }

    /* المهام المنجزة */
    $s['tasks_done']  = 0;
    $s['tasks_total'] = 0;
    if (tblExists($conn, 'routine_task')) {
        $r = $conn->query("SELECT COUNT(*) c FROM routine_task");
        $s['tasks_total'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
        $r = $conn->query("SELECT COUNT(*) c FROM routine_task WHERE is_done=1");
        $s['tasks_done'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
    }

    /* الصداقات */
    $s['friends'] = 0;
    if (tblExists($conn, 'friend')) {
        $r = $conn->query("SELECT COUNT(*) c FROM friend");
        $s['friends'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
    }

    /* الأماكن الداعمة */
    $s['places'] = 0;
    if (tblExists($conn, 'places')) {
        $r = $conn->query("SELECT COUNT(*) c FROM places");
        $s['places'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
    }

    /* رسائل الإدارة */
    $s['messages'] = 0;
    if (tblExists($conn, 'admin_message')) {
        $r = $conn->query("SELECT COUNT(*) c FROM admin_message");
        $s['messages'] = $r ? (int)$r->fetch_assoc()['c'] : 0;
    }

    ok(['data' => $s]);
}

/* ════════════════════════════════════════════════════════════
   المستخدمون
   ════════════════════════════════════════════════════════════ */

/* قائمة المستخدمين (بدون الأدمن) */
if ($action === 'list_users') {
    $rows = [];
    $r = $conn->query(
        "SELECT user_id, name, email, role, is_active, created_at
         FROM   users
         WHERE  role != 'admin'
         ORDER  BY user_id DESC
         LIMIT  500"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'      => (int)$row['user_id'],
                'name'    => $row['name'],
                'email'   => $row['email'],
                'role'    => $row['role'],
                'active'  => (int)$row['is_active'],
                'joined'  => $row['created_at'] ? date('Y-m-d', strtotime($row['created_at'])) : ''
            ];
        }
    }
    ok(['data' => $rows]);
}

/* إضافة مستخدم جديد */
if ($action === 'add_user') {
    $name  = trim($in['name']  ?? '');
    $email = trim($in['email'] ?? '');
    $pass  = trim($in['pass']  ?? '');
    $role  = in_array($in['role'] ?? '', ['normal', 'deaf']) ? $in['role'] : 'normal';

    if (!$name || !$email || !$pass) fail('يرجى تعبئة جميع الحقول.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('البريد الإلكتروني غير صالح.');
    if (strlen($pass) < 6) fail('كلمة المرور قصيرة جداً (6 أحرف على الأقل).');

    /* التحقق من عدم تكرار البريد */
    $chk = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $chk->bind_param('s', $email);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) fail('هذا البريد الإلكتروني مستخدم مسبقاً.');
    $chk->close();

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $s = $conn->prepare("INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)");
    $s->bind_param('ssss', $name, $email, $hash, $role);
    $s->execute();
    $newId = (int)$conn->insert_id;
    $s->close();

    ok(['id' => $newId, 'name' => $name, 'email' => $email, 'role' => $role, 'active' => 1]);
}

/* تعديل بيانات مستخدم */
if ($action === 'update_user') {
    $name  = trim($in['name']  ?? '');
    $email = trim($in['email'] ?? '');
    $role  = in_array($in['role'] ?? '', ['normal', 'deaf']) ? $in['role'] : 'normal';

    if (!$name || !$email) fail('يرجى تعبئة الاسم والبريد.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('البريد الإلكتروني غير صالح.');

    /* التحقق من عدم تكرار البريد مع مستخدم آخر */
    $chk = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $chk->bind_param('si', $email, $id);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) fail('هذا البريد مستخدم من حساب آخر.');
    $chk->close();

    $s = $conn->prepare("UPDATE users SET name=?, email=?, role=? WHERE user_id=? AND role!='admin'");
    $s->bind_param('sssi', $name, $email, $role, $id);
    $s->execute();
    $s->close();
    ok();
}

/* تفعيل / إيقاف مستخدم (بدلاً من الحذف الكامل) */
if ($action === 'toggle_user_status') {
    /* لا يُسمح بإيقاف الأدمن من هنا */
    $chk = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
    $chk->bind_param('i', $id);
    $chk->execute();
    $row = $chk->get_result()->fetch_assoc();
    $chk->close();
    if (!$row || $row['role'] === 'admin') fail('لا يمكن إيقاف حساب أدمن من هنا.');

    $s = $conn->prepare("UPDATE users SET is_active = 1 - is_active WHERE user_id = ? AND role != 'admin'");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();

    /* نرجع الحالة الجديدة */
    $chk2 = $conn->prepare("SELECT is_active FROM users WHERE user_id = ?");
    $chk2->bind_param('i', $id);
    $chk2->execute();
    $newStatus = (int)$chk2->get_result()->fetch_assoc()['is_active'];
    $chk2->close();
    ok(['active' => $newStatus]);
}

/* حذف مستخدم نهائياً */
if ($action === 'delete_user') {
    try {
        /* التحقق من النوع (لا نحذف أدمن من هنا) */
        $chk = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
        $chk->bind_param('i', $id);
        $chk->execute();
        $row = $chk->get_result()->fetch_assoc();
        $chk->close();

        if (!$row) fail('المستخدم غير موجود.');
        if ($row['role'] === 'admin') fail('لا يمكن حذف حساب أدمن من هنا.');

        /* حذف البيانات المرتبطة لتفادي مشكلة Foreign Keys */
        $tablesToClean = [
            "DELETE FROM reaction WHERE user_id = ?",
            "DELETE FROM comment WHERE user_id = ?",
            "DELETE FROM reaction WHERE post_id IN (SELECT post_id FROM post WHERE user_id = ?)",
            "DELETE FROM comment WHERE post_id IN (SELECT post_id FROM post WHERE user_id = ?)",
            "DELETE FROM post WHERE user_id = ?",
            "DELETE FROM friend WHERE user_one = ? OR user_two = ?",
            "DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?",
            "DELETE FROM notifications WHERE user_id = ? OR related_user_id = ?",
            "DELETE FROM chat_message WHERE sender_id = ? OR receiver_id = ?",
            "DELETE FROM routine_task WHERE user_id = ?"

        ];

        foreach ($tablesToClean as $sql) {
            try {
                $st = $conn->prepare($sql);
                if (!$st) continue;
                if (strpos($sql, 'user_two = ?') !== false || strpos($sql, 'receiver_id = ?') !== false || strpos($sql, 'related_user_id = ?') !== false) {
                    $st->bind_param('ii', $id, $id);
                } else {
                    $st->bind_param('i', $id);
                }
                $st->execute();
                $st->close();
            } catch (Exception $ex) {
                // تجاهل خطأ الجداول غير الموجودة
            }
        }

        $s = $conn->prepare("DELETE FROM users WHERE user_id = ? AND role != 'admin'");
        $s->bind_param('i', $id);
        if ($s->execute()) {
            $s->close();
            ok();
        } else {
            $s->close();
            fail('فشل حذف المستخدم. قد يكون مرتبطاً ببيانات أخرى.');
        }
    } catch (Exception $e) {
        fail('خطأ قاعدة البيانات: ' . $e->getMessage());
    }
}

/* إعادة تعيين كلمة المرور (Super Admin فقط) */
if ($action === 'reset_user_password') {
    if (!$isSuper) fail('هذه العملية خاصة بـ Super Admin فقط.');
    $pass = trim($in['pass'] ?? '');
    if (strlen($pass) < 6) fail('كلمة المرور قصيرة جداً.');

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $s = $conn->prepare("UPDATE users SET password=? WHERE user_id=? AND role!='admin'");
    $s->bind_param('si', $hash, $id);
    $s->execute();
    $s->close();
    ok();
}

/* ════════════════════════════════════════════════════════════
   الأدمن (إدارة الفريق — Super Admin فقط)
   ════════════════════════════════════════════════════════════ */

/* قائمة الأدمن */
if ($action === 'list_admins') {
    $rows = [];
    $r = $conn->query(
        "SELECT user_id, name, email, is_super_admin, is_active, created_at
         FROM   users
         WHERE  role = 'admin'
         ORDER  BY is_super_admin DESC, user_id ASC"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'      => (int)$row['user_id'],
                'name'    => $row['name'],
                'email'   => $row['email'],
                'isSuper' => (bool)(int)$row['is_super_admin'],
                'active'  => (int)$row['is_active'],
                'isSelf'  => ((int)$row['user_id'] === $myId),
                'joined'  => $row['created_at'] ? date('Y-m-d', strtotime($row['created_at'])) : ''
            ];
        }
    }
    ok(['data' => $rows]);
}

/* إضافة أدمن جديد */
if ($action === 'add_admin') {
    if (!$isSuper) fail('هذه العملية خاصة بـ Super Admin فقط.');

    $name  = trim($in['name']  ?? '');
    $email = trim($in['email'] ?? '');
    $pass  = trim($in['pass']  ?? '');

    if (!$name || !$email || !$pass) fail('يرجى تعبئة جميع الحقول.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('البريد الإلكتروني غير صالح.');

    $chk = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $chk->bind_param('s', $email);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) fail('البريد الإلكتروني مستخدم مسبقاً.');
    $chk->close();

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $role = 'admin';
    $s = $conn->prepare("INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)");
    $s->bind_param('ssss', $name, $email, $hash, $role);
    $s->execute();
    $newId = (int)$conn->insert_id;
    $s->close();
    ok(['id' => $newId, 'name' => $name, 'email' => $email]);
}

/* تعديل بيانات أدمن */
if ($action === 'update_admin') {
    if (!$isSuper) fail('هذه العملية خاصة بـ Super Admin فقط.');

    $name  = trim($in['name']  ?? '');
    $email = trim($in['email'] ?? '');

    if (!$name || !$email) fail('يرجى تعبئة الاسم والبريد.');

    $chk = $conn->prepare("SELECT user_id FROM users WHERE email=? AND user_id!=?");
    $chk->bind_param('si', $email, $id);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) fail('البريد مستخدم من حساب آخر.');
    $chk->close();

    $s = $conn->prepare("UPDATE users SET name=?, email=? WHERE user_id=? AND role='admin'");
    $s->bind_param('ssi', $name, $email, $id);
    $s->execute();
    $s->close();
    ok();
}

/* إيقاف/تفعيل أدمن */
if ($action === 'toggle_admin_status') {
    if (!$isSuper) fail('Super Admin فقط.');
    if ($id === $myId) fail('لا يمكنك إيقاف حسابك الحالي.');

    /* لا نوقف Super Admin */
    $chk = $conn->prepare("SELECT is_super_admin FROM users WHERE user_id=?");
    $chk->bind_param('i', $id);
    $chk->execute();
    $row = $chk->get_result()->fetch_assoc();
    $chk->close();
    if ($row && (int)$row['is_super_admin']) fail('لا يمكن إيقاف Super Admin.');

    $s = $conn->prepare("UPDATE users SET is_active = 1 - is_active WHERE user_id=? AND role='admin'");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();

    $chk2 = $conn->prepare("SELECT is_active FROM users WHERE user_id=?");
    $chk2->bind_param('i', $id);
    $chk2->execute();
    $newStatus = (int)$chk2->get_result()->fetch_assoc()['is_active'];
    $chk2->close();
    ok(['active' => $newStatus]);
}

/* ════════════════════════════════════════════════════════════
   المنشورات
   ════════════════════════════════════════════════════════════ */

/* قائمة المنشورات */
if ($action === 'list_posts') {
    if (!tblExists($conn, 'post')) { ok(['data' => []]); }

    $rows = [];
    $r = $conn->query(
        "SELECT p.post_id, p.content_text, p.media_type, p.created_at,
                u.name   AS author, u.user_id AS author_id,
                (SELECT COUNT(*) FROM reaction r WHERE r.post_id = p.post_id)  AS likes,
                (SELECT COUNT(*) FROM comment  c WHERE c.post_id = p.post_id)  AS comments
         FROM   post p
         LEFT   JOIN users u ON u.user_id = p.user_id
         ORDER  BY p.post_id DESC
         LIMIT  400"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'       => (int)$row['post_id'],
                'author'   => $row['author']  ?? '—',
                'authorId' => (int)$row['author_id'],
                'content'  => mb_substr($row['content_text'] ?? '', 0, 130, 'UTF-8'),
                'media'    => $row['media_type'],
                'likes'    => (int)$row['likes'],
                'comments' => (int)$row['comments'],
                'date'     => $row['created_at'] ? date('Y-m-d', strtotime($row['created_at'])) : ''
            ];
        }
    }
    ok(['data' => $rows]);
}

/* حذف منشور مع كل تعليقاته وردود الفعل عليه */
if ($action === 'delete_post') {
    if (!tblExists($conn, 'post')) fail('جدول المنشورات غير موجود.');

    /* حذف التعليقات أولاً */
    if (tblExists($conn, 'comment')) {
        $s = $conn->prepare("DELETE FROM comment WHERE post_id = ?");
        $s->bind_param('i', $id);
        $s->execute();
        $s->close();
    }
    /* حذف الإعجابات */
    if (tblExists($conn, 'reaction')) {
        $s = $conn->prepare("DELETE FROM reaction WHERE post_id = ?");
        $s->bind_param('i', $id);
        $s->execute();
        $s->close();
    }
    /* حذف المنشور نفسه */
    $s = $conn->prepare("DELETE FROM post WHERE post_id = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();
    ok();
}

/* ════════════════════════════════════════════════════════════
   رسائل الإدارة
   ════════════════════════════════════════════════════════════ */

/* قائمة الرسائل */
if ($action === 'list_messages') {
    if (!tblExists($conn, 'admin_message')) { ok(['data' => []]); }

    $rows = [];
    $r = $conn->query(
        "SELECT admin_message_id AS id, sender_name AS name, sender_email AS email, message_text AS text, created_at AS date
         FROM   admin_message
         ORDER  BY admin_message_id DESC
         LIMIT  200"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'    => (int)$row['id'],
                'name'  => $row['name'],
                'email' => $row['email'],
                'text'  => mb_substr($row['text'], 0, 200, 'UTF-8'),
                'date'  => $row['date'] ? date('Y-m-d H:i', strtotime($row['date'])) : ''
            ];
        }
    }
    ok(['data' => $rows]);
}

/* حذف رسالة */
if ($action === 'delete_message') {
    if (!tblExists($conn, 'admin_message')) fail('الجدول غير موجود.');
    $s = $conn->prepare("DELETE FROM admin_message WHERE admin_message_id = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();
    ok();
}

/* ════════════════════════════════════════════════════════════
   المهام المنجزة (routine_task)
   ════════════════════════════════════════════════════════════ */

/* قائمة المهام المنجزة وغير المنجزة */
if ($action === 'list_tasks') {
    if (!tblExists($conn, 'routine_task')) { ok(['data' => []]); }

    $rows = [];
    $r = $conn->query(
        "SELECT t.task_id, t.title, t.task_day, t.task_time, t.is_done,
                u.name AS user_name, u.email AS user_email
         FROM   routine_task t
         LEFT   JOIN users u ON u.user_id = t.user_id
         ORDER  BY t.task_id DESC
         LIMIT  300"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'        => (int)$row['task_id'],
                'title'     => $row['title'] ?? 'مهمة بدون اسم',
                'day'       => $row['task_day'],
                'time'      => $row['task_time'],
                'is_done'   => (int)$row['is_done'],
                'user_name' => $row['user_name'] ?? '—',
                'user_email'=> $row['user_email'] ?? '—'
            ];
        }
    }
    ok(['data' => $rows]);
}

/* حذف مهمة */
if ($action === 'delete_task') {
    if (!tblExists($conn, 'routine_task')) fail('الجدول غير موجود.');
    $s = $conn->prepare("DELETE FROM routine_task WHERE task_id = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();
    ok();
}

/* ════════════════════════════════════════════════════════════
   الأماكن الداعمة (places)
   ════════════════════════════════════════════════════════════ */

/* قائمة الأماكن */
if ($action === 'list_places') {
    if (!tblExists($conn, 'places')) { ok(['data' => []]); }

    $rows = [];
    $r = $conn->query(
        "SELECT place_id, name, city, category, phone, latitude, longitude,
                rating, is_verified, description
         FROM   places
         ORDER  BY place_id DESC
         LIMIT  300"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'       => (int)$row['place_id'],
                'name'     => $row['name'],
                'city'     => $row['city'],
                'category' => $row['category'],
                'phone'    => $row['phone'],
                'lat'      => $row['latitude']  ? (float)$row['latitude']  : null,
                'lng'      => $row['longitude'] ? (float)$row['longitude'] : null,
                'rating'   => $row['rating']    ? (float)$row['rating']    : null,
                'verified' => (int)$row['is_verified'],
                'desc'     => mb_substr($row['description'] ?? '', 0, 100, 'UTF-8')
            ];
        }
    }
    ok(['data' => $rows]);
}

/* إضافة مكان */
if ($action === 'add_place') {
    if (!tblExists($conn, 'places')) fail('جدول الأماكن غير موجود.');

    $name  = trim($in['name']  ?? '');
    $city  = trim($in['city']  ?? '');
    $cat   = trim($in['category'] ?? 'support');
    $phone = trim($in['phone'] ?? '');
    $desc  = trim($in['description'] ?? '');
    $lat   = isset($in['lat']) ? (float)$in['lat'] : null;
    $lng   = isset($in['lng']) ? (float)$in['lng'] : null;
    $ver   = (int)($in['verified'] ?? 0);

    if (!$name || !$city) fail('الاسم والمدينة مطلوبان.');

    $s = $conn->prepare(
        "INSERT INTO places (name, city, category, phone, latitude, longitude, description, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $s->bind_param('ssssddsi', $name, $city, $cat, $phone, $lat, $lng, $desc, $ver);
    $s->execute();
    $newId = (int)$conn->insert_id;
    $s->close();
    ok(['id' => $newId]);
}

/* تعديل مكان */
if ($action === 'update_place') {
    if (!tblExists($conn, 'places')) fail('جدول الأماكن غير موجود.');

    $name  = trim($in['name']  ?? '');
    $city  = trim($in['city']  ?? '');
    $cat   = trim($in['category'] ?? 'support');
    $phone = trim($in['phone'] ?? '');
    $desc  = trim($in['description'] ?? '');
    $lat   = isset($in['lat']) ? (float)$in['lat'] : null;
    $lng   = isset($in['lng']) ? (float)$in['lng'] : null;
    $ver   = (int)($in['verified'] ?? 0);

    if (!$name || !$city) fail('الاسم والمدينة مطلوبان.');

    $s = $conn->prepare(
        "UPDATE places SET name=?, city=?, category=?, phone=?, latitude=?, longitude=?, description=?, is_verified=?
         WHERE  place_id = ?"
    );
    $s->bind_param('ssssddisi', $name, $city, $cat, $phone, $lat, $lng, $desc, $ver, $id);
    $s->execute();
    $s->close();
    ok();
}

/* حذف مكان */
if ($action === 'delete_place') {
    if (!tblExists($conn, 'places')) fail('جدول الأماكن غير موجود.');
    $s = $conn->prepare("DELETE FROM places WHERE place_id = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();
    ok();
}

/* ════════════════════════════════════════════════════════════
   التعليقات
   ════════════════════════════════════════════════════════════ */

if ($action === 'list_comments') {
    if (!tblExists($conn, 'comment')) { ok(['data' => []]); }

    $rows = [];
    $r = $conn->query(
        "SELECT c.comment_id, c.content, c.created_at,
                u.name AS author, c.post_id
         FROM   comment c
         LEFT   JOIN users u ON u.user_id = c.user_id
         ORDER  BY c.comment_id DESC
         LIMIT  300"
    );
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            $rows[] = [
                'id'      => (int)$row['comment_id'],
                'author'  => $row['author'] ?? '—',
                'content' => mb_substr($row['content'] ?? '', 0, 120, 'UTF-8'),
                'postId'  => (int)$row['post_id'],
                'date'    => $row['created_at'] ? date('Y-m-d', strtotime($row['created_at'])) : ''
            ];
        }
    }
    ok(['data' => $rows]);
}

if ($action === 'delete_comment') {
    if (!tblExists($conn, 'comment')) fail('الجدول غير موجود.');
    $s = $conn->prepare("DELETE FROM comment WHERE comment_id = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->close();
    ok();
}

$conn->close();

/* إذا وصلنا هنا فالعملية غير موجودة */
fail('العملية غير معروفة: ' . htmlspecialchars($action));
?>
