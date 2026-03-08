"""Extract plain text from uploaded files."""
from io import BytesIO

from fastapi import HTTPException, UploadFile
from pypdf import PdfReader

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE_MB = 10


def extract_pdf(content: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(content))
        parts = [page.extract_text() for page in reader.pages if page.extract_text()]
        return "\n\n".join(parts)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}") from e


def extract_docx(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(BytesIO(content))
        return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read DOCX: {e}") from e


async def extract_text_from_file(file: UploadFile) -> str:
    name = (file.filename or "").lower()
    if not any(name.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF or DOCX.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB.")

    if name.endswith(".pdf"):
        return extract_pdf(content)
    if name.endswith(".docx"):
        return extract_docx(content)

    raise HTTPException(status_code=400, detail="Unsupported file type.")
