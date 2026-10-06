import base64
import io

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, request
from PIL import Image

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024  # 4MB

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    model_complexity=1,
    min_detection_confidence=0.65,
    min_tracking_confidence=0.5
)


def decode_base64_image(data_url: str) -> np.ndarray:
    if "," not in data_url:
        raise ValueError("Invalid image payload")

    encoded = data_url.split(",", 1)[1]
    image_bytes = base64.b64decode(encoded)
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = np.array(pil_image)

    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


def distance_2d(p1, p2):
    return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5


def finger_is_up(landmarks, tip_idx: int, pip_idx: int) -> bool:
    return landmarks[tip_idx].y < landmarks[pip_idx].y


def thumb_is_open(landmarks, handedness_label: str) -> bool:
    # منطق أفضل قليلًا للإبهام
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    index_mcp = landmarks[5]

    if handedness_label == "Right":
        return thumb_tip.x < thumb_ip.x < index_mcp.x
    return thumb_tip.x > thumb_ip.x > index_mcp.x


def get_finger_states(landmarks, handedness_label: str):
    thumb = thumb_is_open(landmarks, handedness_label)
    index_up = finger_is_up(landmarks, 8, 6)
    middle_up = finger_is_up(landmarks, 12, 10)
    ring_up = finger_is_up(landmarks, 16, 14)
    pinky_up = finger_is_up(landmarks, 20, 18)

    return {
        "thumb": thumb,
        "index": index_up,
        "middle": middle_up,
        "ring": ring_up,
        "pinky": pinky_up
    }


def classify_gesture(landmarks, handedness_label: str):
    fingers = get_finger_states(landmarks, handedness_label)

    thumb = fingers["thumb"]
    index_up = fingers["index"]
    middle_up = fingers["middle"]
    ring_up = fingers["ring"]
    pinky_up = fingers["pinky"]

    up_count = sum(fingers.values())

    # مسافة الإبهام مع السبابة
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    thumb_index_distance = distance_2d(thumb_tip, index_tip)

    # ==== تصنيفات أوضح ====

    # قبضة
    if up_count == 0:
        return {
            "label": "قبضة",
            "description": "اليد مغلقة",
            "symbol": "fist"
        }

    # كف مفتوح
    if up_count == 5:
        return {
            "label": "كف مفتوح",
            "description": "جميع الأصابع مرفوعة",
            "symbol": "open_palm"
        }

    # إبهام للأعلى
    if thumb and not index_up and not middle_up and not ring_up and not pinky_up:
        return {
            "label": "إبهام للأعلى",
            "description": "إشارة إيجابية واضحة",
            "symbol": "thumbs_up"
        }

    # إصبع واحد
    if index_up and not middle_up and not ring_up and not pinky_up and not thumb:
        return {
            "label": "إصبع واحد",
            "description": "السبابة فقط مرفوعة",
            "symbol": "one_finger"
        }

    # إصبعان
    if index_up and middle_up and not ring_up and not pinky_up and not thumb:
        return {
            "label": "حرف V",
            "description": "السبابة والوسطى فقط مرفوعتان",
            "symbol": "v_sign"
        }

    # ثلاثة أصابع
    if index_up and middle_up and ring_up and not pinky_up:
        return {
            "label": "ثلاثة أصابع",
            "description": "ثلاثة أصابع مرفوعة",
            "symbol": "three_fingers"
        }

    # أربعة أصابع
    if index_up and middle_up and ring_up and pinky_up and not thumb:
        return {
            "label": "أربعة أصابع",
            "description": "أربعة أصابع مرفوعة بدون الإبهام",
            "symbol": "four_fingers"
        }

    # OK Sign
    if thumb_index_distance < 0.06 and middle_up and ring_up and pinky_up:
        return {
            "label": "OK",
            "description": "الإبهام والسبابة متقاربان مع بقاء بقية الأصابع مرفوعة",
            "symbol": "ok_sign"
        }

    # حرف L
    if thumb and index_up and not middle_up and not ring_up and not pinky_up:
        return {
            "label": "حرف L",
            "description": "الإبهام والسبابة مرفوعان",
            "symbol": "l_sign"
        }

    # حرف Y
    if thumb and not index_up and not middle_up and not ring_up and pinky_up:
        return {
            "label": "حرف Y",
            "description": "الإبهام والخنصر فقط مرفوعان",
            "symbol": "y_sign"
        }

    # قرون / Rock sign
    if not thumb and index_up and not middle_up and not ring_up and pinky_up:
        return {
            "label": "قرنان",
            "description": "السبابة والخنصر فقط مرفوعان",
            "symbol": "horns"
        }

    return {
        "label": "تم اكتشاف اليد",
        "description": "تم التعرّف على اليد لكن الوضعية الحالية ليست ضمن التصنيفات المحددة",
        "symbol": "detected"
    }


@app.after_request
def add_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "message": "translator hand service is running"
    })


@app.route("/recognize-hand", methods=["POST", "OPTIONS"])
def recognize_hand():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    image_data = data.get("image")

    if not image_data:
        return jsonify({"error": "Missing image"}), 400

    try:
        frame = decode_base64_image(image_data)
    except Exception:
        return jsonify({"error": "Invalid image data"}), 400

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb_frame)

    if not result.multi_hand_landmarks:
        return jsonify({
            "label": "لا توجد يد",
            "description": "لم يتم اكتشاف يد واضحة في الصورة",
            "symbol": "no_hand"
        })

    hand_landmarks = result.multi_hand_landmarks[0].landmark
    handedness_label = "Right"

    if result.multi_handedness:
        handedness_label = result.multi_handedness[0].classification[0].label

    gesture = classify_gesture(hand_landmarks, handedness_label)

    return jsonify({
        "label": gesture["label"],
        "description": gesture["description"],
        "symbol": gesture["symbol"],
        "handedness": handedness_label
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False)