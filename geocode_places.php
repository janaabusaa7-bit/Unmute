<?php
require_once 'config.php';

echo "<meta charset='UTF-8'>";
echo "<h2>Geocoding places...</h2>";

$sql = "SELECT place_id, name, city, address 
        FROM places
        WHERE latitude IS NULL OR longitude IS NULL";

$result = $conn->query($sql);

if (!$result) {
    die("Query failed: " . $conn->error);
}

function geocodeAddress($query) {
    $url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" . urlencode($query);

    $opts = [
        "http" => [
            "method" => "GET",
            "header" =>
                "User-Agent: UnmuteMap/1.0 (student project)\r\n" .
                "Accept-Language: ar,en\r\n"
        ]
    ];

    $context = stream_context_create($opts);
    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return null;
    }

    $data = json_decode($response, true);

    if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
        return [
            "lat" => $data[0]['lat'],
            "lon" => $data[0]['lon']
        ];
    }

    return null;
}

$count = 0;

while ($row = $result->fetch_assoc()) {
    $placeId = (int)$row['place_id'];
    $name = $row['name'];
    $city = $row['city'];
    $address = $row['address'];

    $query1 = "{$name}, {$address}, {$city}, Palestine";
    $geo = geocodeAddress($query1);

    if (!$geo) {
        $query2 = "{$address}, {$city}, Palestine";
        $geo = geocodeAddress($query2);
    }

    if (!$geo) {
        $query3 = "{$city}, Palestine";
        $geo = geocodeAddress($query3);
    }

    if ($geo) {
        $stmt = $conn->prepare("UPDATE places SET latitude = ?, longitude = ? WHERE place_id = ?");
        $stmt->bind_param("ddi", $geo['lat'], $geo['lon'], $placeId);
        $stmt->execute();

        echo "<p>✅ {$name} → {$geo['lat']}, {$geo['lon']}</p>";
        $count++;
    } else {
        echo "<p>⚠️ لم يتم إيجاد إحداثيات لـ {$name}</p>";
    }

    sleep(1);
}

echo "<hr><strong>Done. Updated {$count} places</strong>";
?>
