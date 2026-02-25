# test_encoding.py
import numpy as np
from PIL import Image
import face_recognition
import os

path = "known_faces/12321662.jpg"
print("Exists:", os.path.exists(path))
pil = Image.open(path).convert("RGB")
arr = np.array(pil)
print("shape, dtype, contiguous:", arr.shape, arr.dtype, arr.flags['C_CONTIGUOUS'])
try:
    enc = face_recognition.face_encodings(arr)
    print("encodings:", len(enc))
except Exception as e:
    print("Error during encoding:", e)