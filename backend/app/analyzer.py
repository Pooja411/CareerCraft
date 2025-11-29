import asyncio
import io
import json
import os
from typing import Any, Dict, List

import google.generativeai as genai
import pdfplumber
import pytesseract
from pdf2image import convert_from_bytes


def _safe_json_parse(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                pass
    return {}


async def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    return await asyncio.to_thread(_extract_text_sync, file_bytes)


def _extract_text_sync(file_bytes: bytes) -> str:
    text_chunks: List[str] = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                if text.strip():
                    text_chunks.append(text)
    except Exception:
        pass

    extracted_text = "\n".join(text_chunks).strip()
    if extracted_text:
        return extracted_text

    try:
        images = convert_from_bytes(file_bytes)
        ocr_chunks: List[str] = []
        for image in images:
            text = pytesseract.image_to_string(image)
            if text and text.strip():
                ocr_chunks.append(text)
        return "\n".join(ocr_chunks).strip()
    except Exception:
        return ""


async def analyze_with_gemini(resume_text: str, job_desc: str) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return _local_baseline_analysis(resume_text, job_desc)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    system_prompt = (
        "You are a resume analysis assistant. Given a resume and an optional job description, "
        "analyze and return a STRICT JSON object with keys: match_score (0-100), missing_keywords (array of strings), "
        "suggestions (array of strings), analysis (string). Do not include any extra commentary."
    )

    prompt = (
        f"{system_prompt}\n\nInput JSON:\n"
        + json.dumps(
            {
                "resume": resume_text[:120000],
                "job_description": job_desc[:60000],
            },
            ensure_ascii=False,
        )
        + "\n\nRespond with only the JSON object."
    )

    response = await model.generate_content_async(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )

    text = response.text or ""
    # print("GEMINI RAW OUTPUT:", text)

    try:
        data = json.loads(text)
    except:
        data = {}


    if not data:
        data = _local_baseline_analysis(resume_text, job_desc)

    return {
        "match_score": int(data.get("match_score", 0)),
        "missing_keywords": list(data.get("missing_keywords", [])),
        "suggestions": list(data.get("suggestions", [])),
        "analysis": str(data.get("analysis", "")),
    }


async def generate_roadmap_with_gemini(resume_text: str, job_desc: str) -> Dict[str, Any]:
    """
    Use Gemini to generate a learning roadmap focused on the skill gap between
    the job description and the resume.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # Fallback: reuse local baseline to compute missing keywords
        baseline = _local_baseline_analysis(resume_text, job_desc)
        gaps = baseline.get("missing_keywords", [])
        return {
            "skill_gaps": gaps,
            "roadmap": [
                {
                    "title": "Close your skill gaps",
                    "duration": "8-12 weeks",
                    "description": "Focus on the key topics missing from your resume compared to the job description.",
                    "skills": gaps,
                    "resources": [
                        "Official docs for each missing technology",
                        "YouTube crash courses",
                        "Hands-on mini projects using those skills",
                    ],
                }
            ],
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    system_prompt = (
        "You are a career mentor. Given a resume and a target job description, "
        "identify the skill gap and generate a concise learning roadmap.\n"
        "Return ONLY a STRICT JSON object with keys:\n"
        "  skill_gaps: array of short strings (skills/technologies/topics missing in resume but present in job description),\n"
        '  roadmap: array of objects with keys {title, duration, description, skills, resources} where:\n'
        "    - title: string (phase name),\n"
        "    - duration: string like '2-3 weeks',\n"
        "    - description: short paragraph,\n"
        "    - skills: array of strings (focus skills for this phase),\n"
        "    - resources: array of strings (generic resource suggestions, no URLs required).\n"
        "Do not include any explanatory text outside the JSON."
    )

    prompt = (
        f"{system_prompt}\n\nInput JSON:\n"
        + json.dumps(
            {
                "resume": resume_text[:120000],
                "job_description": job_desc[:60000],
            },
            ensure_ascii=False,
        )
        + "\n\nRespond with only the JSON object."
    )

    response = await model.generate_content_async(
        prompt,
        generation_config=genai.GenerationConfig(response_mime_type="application/json"),
    )

    text = response.text or ""

    try:
        data = json.loads(text)
    except Exception:
        data = {}

    if not data:
        baseline = _local_baseline_analysis(resume_text, job_desc)
        gaps = baseline.get("missing_keywords", [])
        data = {
            "skill_gaps": gaps,
            "roadmap": [
                {
                    "title": "Close your skill gaps",
                    "duration": "8-12 weeks",
                    "description": "Focus on the key topics missing from your resume compared to the job description.",
                    "skills": gaps,
                    "resources": [
                        "Official docs for each missing technology",
                        "YouTube crash courses",
                        "Hands-on mini projects using those skills",
                    ],
                }
            ],
        }

    return {
        "skill_gaps": list(data.get("skill_gaps", [])),
        "roadmap": list(data.get("roadmap", [])),
    }


def _local_baseline_analysis(resume_text: str, job_desc: str) -> Dict[str, Any]:
    import re

    def tokenize(s: str) -> List[str]:
        return [t for t in re.sub(r"[^a-z0-9\s+#.]", " ", s.lower()).split() if t]

    def unique(tokens: List[str]) -> List[str]:
        seen: set[str] = set()
        out: List[str] = []
        for t in tokens:
            if t not in seen:
                seen.add(t)
                out.append(t)
        return out

    job_tokens = unique(tokenize(job_desc))
    resume_tokens = set(unique(tokenize(resume_text)))
    missing = [t for t in job_tokens if t not in resume_tokens]
    overlap = [t for t in job_tokens if t in resume_tokens]
    score = 0 if not job_tokens else round(len(overlap) * 100 / len(job_tokens))

    suggestions = [
        f"Include concrete examples for '{kw}' if relevant."
        for kw in missing[:10]
    ]

    return {
        "match_score": int(score),
        "missing_keywords": missing[:20],
        "suggestions": suggestions,
        "analysis": f"Approximate match based on keyword overlap: {score}%.",
    }

