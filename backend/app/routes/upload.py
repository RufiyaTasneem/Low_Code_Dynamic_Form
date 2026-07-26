from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
from pathlib import Path
from fastapi.responses import FileResponse
import shutil

from app.core.file_config import UPLOAD_DIR

router = APIRouter(prefix="/upload", tags=["File Upload"])

MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/")
async def upload_file(file: UploadFile = File(...)):

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".pdf",
        ".doc",
        ".docx",
        ".txt",
    }

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed"
        )

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 5 MB"
        )

    file.file.seek(0)

    unique_filename = f"{uuid4()}{extension}"

    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": f"/upload/download/{unique_filename}",
        "size": len(contents)
    }
@router.get("/download/{filename}")
def download_file(filename: str):

    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        path=file_path,
        filename=filename
    )