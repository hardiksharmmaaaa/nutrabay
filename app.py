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

TEMP_DIR = "/tmp"
# os.makedirs is now handled inside the analyze function to be more robust

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
    # Ensure a unique subfolder in /tmp if needed, or just use /tmp directly
    for file in files:
        # Sanitize filename and use absolute path in /tmp
        safe_filename = "".join([c for c in file.filename if c.isalnum() or c in "._-"]).strip()
        temp_path = os.path.join(TEMP_DIR, safe_filename)
        
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            resume_text = extract_text(temp_path)
            if not resume_text:
                results.append({
                    "candidate_name": os.path.splitext(file.filename)[0],
                    "score": 0,
                    "strengths": ["Failed to extract text"],
                    "gaps": ["File may be unreadable or empty"],
                    "recommendation": "Error"
                })
                continue

            analysis = analyze_resume(jd_text, resume_text, api_key)
            analysis['candidate_name'] = os.path.splitext(file.filename)[0]
            results.append(analysis)
        except Exception as e:
            print(f"Failed to process {file.filename}: {e}")
            results.append({
                "candidate_name": os.path.splitext(file.filename)[0],
                "score": 0,
                "strengths": ["Processing error"],
                "gaps": [str(e)],
                "recommendation": "Error"
            })
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    return {"results": results}

# Serve frontend static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
