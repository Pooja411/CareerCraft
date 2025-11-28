import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from analyzer import analyze_with_gemini, extract_text_from_pdf_bytes

load_dotenv()

app = FastAPI(title="Resume Analyzer Backend")

frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze_resume(
    resumeFile: UploadFile | None = File(default=None),
    resumeText: str | None = Form(default=None),
    jobDesc: str | None = Form(default=None),
):
    """
    Accepts a PDF or raw resume text with an optional job description and
    returns AI-driven analysis results.
    """

    if not resumeFile and not resumeText:
        raise HTTPException(status_code=400, detail="Provide resumeFile or resumeText.")

    extracted_text: str = ""
    if resumeFile is not None:
        if resumeFile.content_type not in (
            "application/pdf",
            "application/octet-stream",
        ):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        file_bytes = await resumeFile.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty file received.")
        extracted_text = await extract_text_from_pdf_bytes(file_bytes)

    resume_text_final = (resumeText or "").strip()
    if extracted_text:
        resume_text_final = extracted_text

    if not resume_text_final:
        raise HTTPException(
            status_code=400, detail="Could not extract resume text. Try another file."
        )

    job_desc_final = (jobDesc or "").strip()

    result = await analyze_with_gemini(resume_text_final, job_desc_final)
    return JSONResponse(content=result)


@app.post("/extract")
async def extract_resume_text(resumeFile: UploadFile = File(...)):
    if resumeFile.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    file_bytes = await resumeFile.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file received.")
    extracted_text = await extract_text_from_pdf_bytes(file_bytes)
    if not extracted_text:
        raise HTTPException(
            status_code=422, detail="Could not extract text from the provided PDF."
        )
    return JSONResponse({"text": extracted_text})


@app.get("/health")
async def health():
    return {"status": "ok"}

