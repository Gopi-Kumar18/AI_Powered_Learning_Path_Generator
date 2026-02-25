from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

app = FastAPI()

# Enable CORS (Allows React/Spring Boot to talk to Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(router)

@app.get("/")
def home():
    return {"message": "Server is Running"}

# uvicorn app.main:app --reload --port 8000