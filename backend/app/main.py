from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import router as upload_router
# Import models so Alembic can detect them
from app.models import *
from fastapi.staticfiles import StaticFiles
from app.core.file_config import UPLOAD_DIR
# Routers
from app.routers import (
    field,
    form,
    public,
    conditional_rule,
    auth,
)

app = FastAPI(
    title="Low-Code Form Builder API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],

)
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR.parent),
    name="uploads",
)
# Root endpoints
@app.get("/")
def root():
    return {"message": "Low-Code Form Builder API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# Routers
app.include_router(auth.router)
app.include_router(field.router)
app.include_router(form.router)
app.include_router(public.router)
app.include_router(conditional_rule.router)
app.include_router(upload_router)