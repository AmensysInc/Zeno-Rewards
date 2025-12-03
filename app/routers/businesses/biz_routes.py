from fastapi import APIRouter, UploadFile, File
import shutil

router = APIRouter()


@router.get("/{business_id}/dashboard")
def business_dashboard(business_id: str):
    return {"message": "Business dashboard placeholder"}


@router.post("/{business_id}/upload-excel")
def upload_excel(business_id: str, file: UploadFile = File(...)):
    path = f"app/static/uploads/{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "Uploaded", "filename": file.filename}
