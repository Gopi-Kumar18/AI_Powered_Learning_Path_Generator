
from PIL import Image
import io
import face_recognition
import cv2
import numpy as np
import os

def load_known_face(student_id: str):

    KNOWN_FACES_DIR = "known_faces"
    

    filename = f"{student_id}.jpg"
    image_path = os.path.join(KNOWN_FACES_DIR, filename)

    # print(f"🔍 [DEBUG - 1] Looking for reference photo: {image_path}")

    if not os.path.exists(image_path):
        print(f"❌ [ERROR] File NOT FOUND at path: {image_path}")
        return None

    if os.path.getsize(image_path) == 0:
        print(f"❌ [ERROR] File exists but is EMPTY (0 bytes): {image_path}")
        return None

    try:
        # --- Robust load using Pillow (ensures 8-bit RGB) ---
        pil = Image.open(image_path).convert("RGB")
        rgb_img = np.array(pil)
        rgb_img = np.ascontiguousarray(rgb_img, dtype=np.uint8)

        # print(f"✅ [DEBUG - 2] Image loaded (PIL). Dimensions: {rgb_img.shape} | Type: {rgb_img.dtype} | C_CONTIGUOUS: {rgb_img.flags['C_CONTIGUOUS']}")

    except Exception as e:
        print(f"❌ [ERROR] Failed to open/convert image with PIL: {e}")
        return None

    # Now call face_recognition
    try:
        encodings = face_recognition.face_encodings(rgb_img)
        if len(encodings) > 0:
            print(f"✅ [DEBUG - 3] Reference face encoded successfully.")
            return encodings[0]
        else:
            # print(f"❌ [ERROR] NO FACE DETECTED in reference photo: {student_id}")
            return None
    except RuntimeError as e:
        # print(f"❌ [ERROR] Runtime Error during encoding (dlib): {e}")
        return None
    except Exception as e:
        print(f"❌ [ERROR] Unexpected error during face encoding: {e}")
        return None
    

    
def verify_face(uploaded_file_bytes, student_id: str):
    """
    Compares the uploaded selfie (bytes) with the known photo on disk.
    """
    print(f"--- STARTING VERIFICATION FOR: {student_id} ---")

    # 1. Load Known Face
    known_encoding = load_known_face(student_id)
    if known_encoding is None:
        return {"status": "error", "message": "Server Error: Student Reference Photo Invalid"}

    # 2. Process Uploaded Image
    try:
        pil_upload = Image.open(io.BytesIO(uploaded_file_bytes)).convert("RGB")
        rgb_uploaded = np.array(pil_upload)
        rgb_uploaded = np.ascontiguousarray(rgb_uploaded, dtype=np.uint8)

        # print(f"✅ [DEBUG - 4] Uploaded selfie loaded. Shape: {rgb_uploaded.shape} | Type: {rgb_uploaded.dtype} | C_CONTIGUOUS: {rgb_uploaded.flags['C_CONTIGUOUS']}")

        # 3. Detect Face in Uploaded Image
        unknown_encodings = face_recognition.face_encodings(rgb_uploaded)

        if len(unknown_encodings) == 0:
            print(f"❌ [FAIL] No face found in UPLOADED selfie.")
            return {"status": "fail", "message": "No face detected in selfie. Adjust lighting."}
        
        if len(unknown_encodings) > 1:
            print(f"❌ [FAIL] Multiple faces found in UPLOADED selfie.")
            return {"status": "fail", "message": "Multiple faces detected! Only one allowed."}

        # 4. Compare
        matches = face_recognition.compare_faces([known_encoding], unknown_encodings[0], tolerance=0.5)
        face_distance = face_recognition.face_distance([known_encoding], unknown_encodings[0])

        if matches[0]:
            accuracy = round((1 - face_distance[0]) * 100, 2)
            print(f"✅ [SUCCESS] Face Verified! Accuracy: {accuracy}%")
            return {"status": "success", "message": "Face Verified", "accuracy": accuracy}
        else:
            print(f"❌ [FAIL] Face Mismatch. Distance: {face_distance[0]}")
            return {"status": "fail", "message": "Face Mismatch: Not the same person"}

    except Exception as e:
        print(f"❌ [CRITICAL ERROR] Processing Exception: {e}")
        return {"status": "error", "message": "Server Image Processing Error"}




