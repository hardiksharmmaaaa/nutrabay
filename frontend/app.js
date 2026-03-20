document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.getElementById('results-section');
    const resultsBody = document.getElementById('results-body');
    const apiKeyInput = document.getElementById('api-key');
    const jdText = document.getElementById('jd-text');
    const downloadCsvBtn = document.getElementById('download-csv');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let uploadedFiles = [];
    let currentResults = [];

    // Trigger file input on click
    dropZone.addEventListener('click', () => fileInput.click());

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ff4b2b';
        dropZone.style.background = 'rgba(255, 75, 43, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#eaeaea';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#eaeaea';
        dropZone.style.background = 'transparent';
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        for (const file of files) {
            if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
                uploadedFiles.push(file);
                addFileToList(file);
            }
        }
    }

    function addFileToList(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span><i class="fas fa-file"></i> ${file.name}</span>
            <i class="fas fa-times" style="cursor:pointer; color:#ff4b2b" onclick="removeFile('${file.name}')"></i>
        `;
        fileList.appendChild(item);
    }

    window.removeFile = (name) => {
        uploadedFiles = uploadedFiles.filter(f => f.name !== name);
        renderFileList();
    };

    function renderFileList() {
        fileList.innerHTML = '';
        uploadedFiles.forEach(addFileToList);
    }

    // Analyze handle
    analyzeBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value;
        const jd = jdText.value;

        if (!apiKey) return alert('Please enter your Gemini API Key');
        if (!jd) return alert('Please enter the Job Description');
        if (uploadedFiles.length === 0) return alert('Please upload at least one resume');

        // UI state: Loading
        analyzeBtn.classList.add('btn-loading');
        analyzeBtn.innerHTML = '<i class="fas fa-spinner"></i> Analyzing...';

        const formData = new FormData();
        formData.append('jd_text', jd);
        formData.append('api_key', apiKey);
        uploadedFiles.forEach(file => formData.append('files', file));

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Analysis failed');
            }

            const data = await response.json();
            currentResults = data.results;
            displayResults(currentResults);
        } catch (err) {
            alert(err.message);
        } finally {
            analyzeBtn.classList.remove('btn-loading');
            analyzeBtn.innerHTML = '<i class="fas fa-rocket"></i> Run AI Screening';
        }
    });

    function displayResults(results) {
        resultsSection.classList.remove('hidden');
        resultsBody.innerHTML = '';

        // Sort results by score desc
        results.sort((a, b) => b.score - a.score);

        results.forEach((res, index) => {
            const scoreClass = res.score >= 80 ? 'high-score' : (res.score >= 60 ? 'mid-score' : 'low-score');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${res.candidate_name}</strong></td>
                <td><span class="score-badge ${scoreClass}">${res.score}%</span></td>
                <td>${res.recommendation}</td>
                <td><div class="list-preview">${res.strengths.join(', ')}</div></td>
                <td><div class="list-preview">${res.gaps.join(', ')}</div></td>
                <td><button class="view-btn" onclick="showDetails(${index})">View Details</button></td>
            `;
            resultsBody.appendChild(row);
        });

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    window.showDetails = (index) => {
        const res = currentResults[index];
        const scoreClass = res.score >= 80 ? 'high-score' : (res.score >= 60 ? 'mid-score' : 'low-score');
        
        modalBody.innerHTML = `
            <h2>${res.candidate_name}</h2>
            <div style="margin: 20px 0; display:flex; align-items:center; gap:15px">
                <span class="score-badge ${scoreClass}" style="font-size: 1.2rem; padding: 8px 16px">${res.score}% Match</span>
                <span style="font-weight:600; color:#636e72">${res.recommendation}</span>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px">
                <div>
                    <h4 style="color:#2d3436; margin-bottom:10px">💪 Strengths</h4>
                    <ul style="padding-left:20px; font-size:0.95rem">
                        ${res.strengths.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h4 style="color:#2d3436; margin-bottom:10px">⚠️ Gaps</h4>
                    <ul style="padding-left:20px; font-size:0.95rem">
                        ${res.gaps.map(g => `<li>${g}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    };

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    downloadCsvBtn.addEventListener('click', () => {
        if (currentResults.length === 0) return;

        let csv = 'Candidate Name,Score,Recommendation,Strengths,Gaps\n';
        currentResults.forEach(res => {
            const strengths = `"${res.strengths.join(', ')}"`;
            const gaps = `"${res.gaps.join(', ')}"`;
            csv += `${res.candidate_name},${res.score},${res.recommendation},${strengths},${gaps}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'screening_results.csv';
        a.click();
    });
});
