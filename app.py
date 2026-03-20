import os
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from utils import extract_text, analyze_resume
import uvicorn

app = FastAPI(title="Resume Analyser API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze(
    jd_text: str = Form(...),
    api_key: str = Form(...),
    files: List[UploadFile] = File(...)
):
    if not api_key:
        raise HTTPException(status_code=400, detail="API Key is required")
    if not jd_text:
        raise HTTPException(status_code=400, detail="Job Description is required")
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    results = []
    for file in files:
        temp_path = os.path.join(TEMP_DIR, file.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            resume_text = extract_text(temp_path)
            analysis = analyze_resume(jd_text, resume_text, api_key)
            analysis['candidate_name'] = os.path.splitext(file.filename)[0]
            results.append(analysis)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    return {"results": results}

# Serve frontend static files
if os.path.exists("frontend"):
    app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
