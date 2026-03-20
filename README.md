# 🚀 AI Resume Screener (Nutrabay Inspired)

An intelligent, professional resume screening application that leverages the power of Gemini AI to match candidates against job descriptions with high accuracy. 

![Logo](frontend/image.png)

## ✨ Features

- **Multi-Resume Support**: Bulk upload multiple PDF or DOCX resumes.
- **AI Scoring**: Advanced matching algorithm using Gemini 2.5/3 Flash models.
- **Interactive Loading**: A creative, resume-themed scanning animation to keep users engaged.
- **Professional Dashboard**: Sorted results with color-coded scores, key strengths, and specific gaps.
- **Detailed Insights**: Deep dive into individual candidate analysis via a clean modal view.
- **Vercel Ready**: Fully optimized for serverless deployment with `/tmp` filesystem support.

## 📸 Snapshots

### 1. Main Dashboard <img width="1345" height="706" alt="Screenshot 2026-03-20 at 21 44 47" src="https://github.com/user-attachments/assets/cc69fa62-93e4-43d6-93bb-f4d9297c772d" />
*Clean, minimalistic input section for JD and file uploads.*

### 2. Scanning Animation
<img width="1241" height="630" alt="Screenshot 2026-03-20 at 21 45 40" src="https://github.com/user-attachments/assets/d86c5aaf-8365-4faa-ba7f-a1950e0d8d85" />

*Interactive UI showing real-time AI processing status.*

### 3. Screened Results
<img width="1286" height="679" alt="Screenshot 2026-03-20 at 21 46 49" src="https://github.com/user-attachments/assets/55de0adc-ba54-42d6-a2aa-db595a5d77f7" />

*Dynamic table with sorted scores and candidate comparisons.*

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, FastAPI, Uvicorn
- **AI**: Gemini Generative AI (Google GenAI SDK)
- **Parsing**: pdfplumber, python-docx
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6)
- **Deployment**: Vercel Serverless

## 🚀 Quick Start

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/resume-analyser.git
   cd resume-analyser
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python3 app.py
   ```
   *Access at `http://localhost:8000`*

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   *Vercel will automatically build the environment using the included `vercel.json` and `requirements.txt`.*

## ⚙️ Configuration

- **API Key**: The application requires a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
- **Model**: Defaulted to `gemini-1.5-flash` or `gemini-2.0-flash-exp` for the best price-performance balance.

---
*Inspired by the Nutrabay aesthetic for clean, fast, and professional enterprise tools.*
