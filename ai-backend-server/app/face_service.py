
from __future__ import annotations

import io
import os
import re
from pathlib import Path
from threading import Lock
from typing import Dict, Optional

import face_recognition
import numpy as np
from PIL import Image, UnidentifiedImageError

# Project root is one level above /app
BASE_DIR = Path(__file__).resolve().parent.parent
KNOWN_FACES_DIR = BASE_DIR / "known_faces"

# Tune this as needed
FACE_MATCH_TOLERANCE = 0.5

# Cache: student_id -> face encoding
_FACE_CACHE: Dict[str, np.ndarray] = {}
_CACHE_LOCK = Lock()

_ALLOWED_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def _safe_student_id(student_id: str) -> str:
    """
    Allow only simple IDs like:
    12321662
    STUDENT-Test-001
    """
    sid = student_id.strip()
    if not sid:
        raise ValueError("Empty student_id")

    if not re.fullmatch(r"[A-Za-z0-9_-]+", sid):
        raise ValueError(f"Invalid student_id: {student_id}")

    return sid


def get_known_face_path(student_id: str) -> Optional[Path]:
    """
    Returns the first matching known-face image path for this student.
    Example filenames:
      known_faces/12321662.jpg
      known_faces/STUDENT-Test-001.png
    """
    sid = _safe_student_id(student_id)

    for ext in _ALLOWED_EXTENSIONS:
        path = KNOWN_FACES_DIR / f"{sid}{ext}"
        if path.exists() and path.is_file():
            return path

    return None


def _load_rgb_image_from_path(image_path: Path) -> np.ndarray:
    """
    Load an image from disk as a contiguous uint8 RGB numpy array.
    """
    if not image_path.exists():
        raise FileNotFoundError(f"File not found: {image_path}")

    if image_path.stat().st_size == 0:
        raise ValueError(f"File is empty: {image_path}")

    try:
        pil_img = Image.open(image_path).convert("RGB")
        rgb_img = np.array(pil_img, dtype=np.uint8)
        rgb_img = np.ascontiguousarray(rgb_img)
        return rgb_img
    except UnidentifiedImageError as e:
        raise ValueError(f"Unrecognized image file: {image_path}") from e
    except Exception as e:
        raise ValueError(f"Failed to load image: {image_path} | {e}") from e


def _load_rgb_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Load uploaded bytes as a contiguous uint8 RGB numpy array.
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        rgb_img = np.array(pil_img, dtype=np.uint8)
        rgb_img = np.ascontiguousarray(rgb_img)
        return rgb_img
    except UnidentifiedImageError as e:
        raise ValueError("Uploaded file is not a valid image") from e
    except Exception as e:
        raise ValueError(f"Failed to decode uploaded image: {e}") from e


def _encode_single_face(rgb_img: np.ndarray, context: str) -> Optional[np.ndarray]:
    """
    Detect exactly one face and return its encoding.
    Returns None if no face or multiple faces are found.
    """
    try:
        face_locations = face_recognition.face_locations(rgb_img, model="hog")

        if len(face_locations) == 0:
            print(f"❌ [{context}] No face detected.")
            return None

        if len(face_locations) > 1:
            print(f"❌ [{context}] Multiple faces detected.")
            return None

        encodings = face_recognition.face_encodings(
            rgb_img,
            known_face_locations=face_locations
        )

        if not encodings:
            print(f"❌ [{context}] Face detected but encoding failed.")
            return None

        return encodings[0]

    except Exception as e:
        print(f"❌ [{context}] Face encoding error: {e}")
        return None


def preload_known_faces() -> None:
    """
    Preload all known face encodings into memory.
    Call once at startup for best performance.
    """
    global _FACE_CACHE

    with _CACHE_LOCK:
        _FACE_CACHE.clear()

        if not KNOWN_FACES_DIR.exists():
            KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)
            print(f"⚠️ known_faces folder created at: {KNOWN_FACES_DIR}")
            return

        for file_path in KNOWN_FACES_DIR.iterdir():
            if not file_path.is_file():
                continue

            if file_path.suffix.lower() not in _ALLOWED_EXTENSIONS:
                continue

            student_id = file_path.stem

            try:
                rgb_img = _load_rgb_image_from_path(file_path)
                encoding = _encode_single_face(rgb_img, f"PRELOAD:{student_id}")

                if encoding is not None:
                    _FACE_CACHE[student_id] = encoding
                    print(f"✅ Loaded face: {student_id} ({file_path.name})")
                else:
                    print(f"⚠️ Skipped {file_path.name}: invalid reference face")

            except Exception as e:
                print(f"❌ Failed to preload {file_path.name}: {e}")


def load_known_face(student_id: str) -> Optional[np.ndarray]:
    """
    Returns the cached encoding if available.
    If not cached, loads from disk, encodes, and stores it.
    """
    sid = _safe_student_id(student_id)

    with _CACHE_LOCK:
        cached = _FACE_CACHE.get(sid)
        if cached is not None:
            return cached

    image_path = get_known_face_path(sid)
    if not image_path:
        print(f"❌ Reference image not found for student: {sid}")
        return None

    try:
        rgb_img = _load_rgb_image_from_path(image_path)
        encoding = _encode_single_face(rgb_img, f"REFERENCE:{sid}")

        if encoding is None:
            return None

        with _CACHE_LOCK:
            _FACE_CACHE[sid] = encoding

        return encoding

    except Exception as e:
        print(f"❌ Error loading reference face for {sid}: {e}")
        return None


def verify_face(uploaded_file_bytes: bytes, student_id: str):
    """
    Compare uploaded selfie with the student's known face.
    Returns a JSON-friendly dict.
    """
    print(f"--- STARTING VERIFICATION FOR: {student_id} ---")

    try:
        known_encoding = load_known_face(student_id)
        if known_encoding is None:
            return {
                "status": "error",
                "message": "Server Error: Student Reference Photo Invalid"
            }

        rgb_uploaded = _load_rgb_image_from_bytes(uploaded_file_bytes)

        unknown_encoding = _encode_single_face(rgb_uploaded, f"UPLOAD:{student_id}")
        if unknown_encoding is None:
            return {
                "status": "fail",
                "message": "No single face detected in selfie. Adjust lighting and keep only one face visible."
            }

        distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
        is_match = face_recognition.compare_faces(
            [known_encoding],
            unknown_encoding,
            tolerance=FACE_MATCH_TOLERANCE
        )[0]

        if is_match:
            accuracy = round(max(0.0, (1.0 - float(distance)) * 100.0), 2)
            print(f"✅ [SUCCESS] Face verified for {student_id}. Distance: {distance:.4f}, Accuracy: {accuracy}%")
            return {
                "status": "success",
                "message": "Face Verified",
                "accuracy": accuracy,
                "distance": round(float(distance), 4)
            }

        print(f"❌ [FAIL] Face mismatch for {student_id}. Distance: {distance:.4f}")
        return {
            "status": "fail",
            "message": "Face Mismatch: Not the same person",
            "distance": round(float(distance), 4)
        }

    except Exception as e:
        print(f"❌ [CRITICAL ERROR] Processing Exception: {e}")
        return {
            "status": "error",
            "message": "Server Image Processing Error"
        }
    