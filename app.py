import streamlit as st
import pandas as pd
import os
from utils import extract_text, analyze_resume
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Page Config
st.set_page_config(
    page_title="AI Resume Screener | Nutrabay inspired",
    page_icon="🎯",
    layout="wide"
)

# Custom Styling (Nutrabay inspired)
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        background-color: #ff4b2b;
        color: white;
        border-radius: 8px;
        padding: 0.6rem 2rem;
        font-weight: 600;
        border: none;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        background-color: #ff416c;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 75, 43, 0.3);
    }
    .header-container {
        padding: 2rem 0;
        text-align: center;
        background: linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%);
        color: white;
        border-radius: 0 0 20px 20px;
        margin-bottom: 2rem;
    }
    .card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 1rem;
    }
    .score-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
    }
    .high-score { background-color: #d4edda; color: #155724; }
    .mid-score { background-color: #fff3cd; color: #856404; }
    .low-score { background-color: #f8d7da; color: #721c24; }
    </style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
    <div class="header-container">
        <h1>🎯 AI-Powered Resume Screener</h1>
        <p>Expert Screening for High-Volume Hiring</p>
    </div>
""", unsafe_allow_html=True)

# Sidebar for API Configuration
with st.sidebar:
    st.image("https://nutrabay.com/wp-content/uploads/2021/04/NB80X80-1.png", width=80)
    st.subheader("Configuration")
    api_key = st.text_input("Gemini API Key", type="password", help="Enter your Google Gemini API Key")
    st.info("The AI uses Gemini-2.5-Flash for rapid and accurate screening.")

# Layout
col1, col2 = st.columns([1, 1])

with col1:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### 📄 Job Description")
    jd_text = st.text_area("Paste the Job Description here", height=300, placeholder="Required skills, experience, and responsibilities...")
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### 📤 Resumes")
    uploaded_files = st.file_uploader("Upload resumes (PDF or DOCX)", accept_multiple_files=True, type=['pdf', 'docx'])
    st.markdown('</div>', unsafe_allow_html=True)

# Processing
if st.button("🚀 Run AI Screening"):
    if not api_key:
        st.error("Please provide a Gemini API Key in the sidebar.")
    elif not jd_text:
        st.error("Please provide a Job Description.")
    elif not uploaded_files:
        st.error("Please upload at least one resume.")
    else:
        results = []
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        num_files = len(uploaded_files)
        
        # We handle file processing in parallel for better speed
        def process_single_resume(uploaded_file):
            temp_path = f"temp_{uploaded_file.name}"
            with open(temp_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            
            resume_text = extract_text(temp_path)
            os.remove(temp_path)
            
            analysis = analyze_resume(jd_text, resume_text, api_key)
            analysis['Candidate Name'] = os.path.splitext(uploaded_file.name)[0]
            return analysis

        with st.spinner("Analyzing resumes with AI..."):
            with ThreadPoolExecutor() as executor:
                futures = [executor.submit(process_single_resume, f) for f in uploaded_files]
                for i, future in enumerate(futures):
                    results.append(future.result())
                    progress_bar.progress((i + 1) / num_files)
                    status_text.text(f"Processed {i+1}/{num_files} resumes")
        
        # Display Results
        st.markdown("---")
        st.markdown("## 📊 Screening Results")
        
        if results:
            df = pd.DataFrame(results)
            # Sort by score descending
            df = df.sort_values(by="score", ascending=False)
            
            # Simple UI for results
            for idx, row in df.iterrows():
                score = row['score']
                badge_class = "high-score" if score > 80 else ("mid-score" if score >= 60 else "low-score")
                
                with st.expander(f"{row['Candidate Name']} - {row['recommendation']} (Score: {score})"):
                    c1, c2 = st.columns(2)
                    with c1:
                        st.markdown("**💪 Strengths**")
                        for s in row['strengths']:
                            st.markdown(f"- {s}")
                    with c2:
                        st.markdown("**⚠️ Gaps**")
                        for g in row['gaps']:
                            st.markdown(f"- {g}")
            
            # Table View as requested
            st.markdown("### 📋 Ranked Table")
            display_df = df[['Candidate Name', 'score', 'recommendation', 'strengths', 'gaps']]
            # Flatten lists for table display
            display_df['strengths'] = display_df['strengths'].apply(lambda x: ", ".join(x))
            display_df['gaps'] = display_df['gaps'].apply(lambda x: ", ".join(x))
            st.dataframe(display_df, use_container_width=True)
            
            # CSV Download
            csv = display_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download results as CSV",
                data=csv,
                file_name='screening_results.csv',
                mime='text/csv',
            )

# Footer
st.markdown("---")
st.markdown("<small>Built for Nutrabay Screening Assessment</small>", unsafe_allow_html=True)
