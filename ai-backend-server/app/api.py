from fastapi import APIRouter, UploadFile, File, Form
from app.face_service import verify_face

router = APIRouter()

@router.post("/verify-face")
async def verify(student_id: str = Form(...), file: UploadFile = File(...)):
    """
    Endpoint receives:
    - student_id (String)
    - file (The Selfie Image)
    """
    print(f"⬇️ [AI SERVER] Verifying face for: {student_id}")

    # Read the image bytes
    image_bytes = await file.read()
    
    # Call the face verification function
    result = verify_face(image_bytes, student_id)
    
    print(f"⬆️ [AI SERVER] Result: {result}")
    return result