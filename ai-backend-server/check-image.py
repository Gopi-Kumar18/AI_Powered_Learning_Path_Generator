# app/check_image.py
import numpy as np
from PIL import Image
import face_recognition
import os, sys

path = "known_faces/12321662.jpg"
print("exists:", os.path.exists(path))

pil = Image.open(path).convert("RGB")
arr = np.array(pil)

print("shape:", arr.shape)
print("dtype:", arr.dtype, "== np.uint8?", arr.dtype == np.uint8)
print("flags contig:", arr.flags['C_CONTIGUOUS'], "ndim:", arr.ndim)
print("repr dtype:", repr(arr.dtype))

# Try face_recognition.load_image_file path route
try:
    img_load = face_recognition.load_image_file(path)
    print("loaded via face_recognition.load_image_file ->", img_load.shape, img_load.dtype, img_load.flags['C_CONTIGUOUS'])
    print("try enc (load_image_file)...")
    print("encodings:", len(face_recognition.face_encodings(img_load)))
except Exception as e:
    print("load_image_file error:", e)

# Try enc on PIL array (force contiguous + uint8)
try:
    arr2 = np.ascontiguousarray(arr, dtype=np.uint8)
    print("arr2 contig:", arr2.flags['C_CONTIGUOUS'], arr2.dtype)
    print("try enc (PIL->arr)...")
    print("encodings:", len(face_recognition.face_encodings(arr2)))
except Exception as e:
    print("PIL-array encoding error:", e)

sys.exit(0)