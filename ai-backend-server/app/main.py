from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.face_service import preload_known_faces

app = FastAPI()

# Enable CORS (Allows React/Spring Boot to talk to Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("🚀 AI Server starting...")
    preload_known_faces()
    print("✅ Known faces loaded.")

# Register Routes
app.include_router(router)

@app.get("/health")
def home():
    return {"status": "UP"}

# uvicorn app.main:app --reload --port 8000