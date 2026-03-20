import pdfplumber
import docx
import google.generativeai as genai
import json
import os
from typing import Dict, List, Any
from pydantic import BaseModel, Field

# Pydantic model for structured output
class AnalysisResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    strengths: List[str]
    gaps: List[str]
    recommendation: str

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text.strip()

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext == '.docx':
        return extract_text_from_docx(file_path)
    else:
        return ""

def analyze_resume(jd_text: str, resume_text: str, api_key: str) -> Dict[str, Any]:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an expert technical recruiter. Your task is to evaluate a candidate's resume against a specific Job Description (JD).
    
    Job Description:
    {jd_text}
    
    Resume:
    {resume_text}
    
    Instructions:
    1. Calculate a match score between 0 and 100.
    2. Identify top 3-5 strengths relative to the JD.
    3. Identify 3-5 gaps or areas for improvement relative to the JD.
    4. Provide a final recommendation: "Strong Fit" (Score > 80), "Moderate Fit" (60-79), or "Not Fit" (<60).
    
    Return the response ONLY as a JSON object with the following keys:
    {{
        "score": 85,
        "strengths": ["...", "..."],
        "gaps": ["...", "..."],
        "recommendation": "Strong Fit"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean up possible markdown code blocks from response
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return data
    except Exception as e:
        return {
            "score": 0,
            "strengths": ["Error processing analysis"],
            "gaps": [str(e)],
            "recommendation": "Error"
        }
