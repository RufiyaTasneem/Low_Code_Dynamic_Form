from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import field, form

app = FastAPI(
    title="Low-Code Form Builder API",
    version="1.0.0",
)

# Allow React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Low-Code Form Builder API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(field.router)
print(">>> including form router <<<")
app.include_router(form.router)