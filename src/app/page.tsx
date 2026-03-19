"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, XCircle, ChevronRight, FileText, Loader2 } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setShowResults(false);
    setQuizAnswers({});

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/generate-training", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to generate training");
      
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    setShowResults(true);
    // Auto scroll to results maybe
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (!data && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900 font-sans">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Nutrabay <span className="text-teal-600">SOP Tutor</span>
            </h1>
          </div>
          <p className="text-slate-500 text-lg">
            Upload any standard operating procedure document to instantly generate training steps and a self-evaluation quiz.
          </p>

          <div
            className="border-2 border-dashed border-teal-200 bg-white rounded-3xl p-12 transition-all hover:border-teal-400 hover:shadow-md cursor-pointer group relative"
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-lg">
                  {file ? file.name : "Drag & drop your SOP PDF here"}
                </p>
                <p className="text-sm text-slate-400">
                  {file ? "Click to change file" : "or click to browse from your computer"}
                </p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={!file}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium text-lg py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Generate Training Workflow <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900 font-sans">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <Loader2 className="absolute inset-0 w-6 h-6 m-auto text-teal-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Extracting Knowledge...</h2>
            <p className="text-slate-500 mt-2">Our AI is reading the SOP, summarizing steps, and generating a quiz.</p>
          </div>
          
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-full w-1/2 mx-auto animate-pulse delay-75"></div>
            <div className="h-4 bg-slate-200 rounded-full w-5/6 mx-auto animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={16} />
            </div>
            Nutrabay <span className="text-teal-600">SOP Tutor</span>
          </h1>
          <button 
            onClick={() => { setData(null); setFile(null); }}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Start Over
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-3">Executive Summary</h2>
            <p className="text-slate-800 font-medium leading-relaxed">{data?.summary}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              Step-by-Step Guide
            </h2>
            <div className="space-y-4">
              {data?.steps?.map((step: string, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:border-teal-200 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center mt-0.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-700 text-white sticky top-24">
            <h2 className="text-2xl font-bold mb-2">Knowledge Check</h2>
            <p className="text-slate-400 mb-8 text-sm">Review the materials and test your understanding below.</p>

            <div className="space-y-8">
              {data?.quiz?.map((q: any, qIdx: number) => {
                const isCorrect = quizAnswers[qIdx] === q.correct_answer;
                
                return (
                  <div key={qIdx} className="space-y-4">
                    <p className="font-medium text-lg leading-snug">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt: string, oIdx: number) => {
                        const isSelected = quizAnswers[qIdx] === opt;
                        const isSuccess = showResults && opt === q.correct_answer;
                        const isError = showResults && isSelected && !isCorrect;

                        const baseClass = "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border";
                        const selectedClass = isSelected && !showResults ? "bg-teal-600/20 border-teal-500/50" : "bg-slate-900/50 border-transparent hover:bg-slate-900";
                        const successClass = isSuccess ? "bg-green-500/20 border-green-500/50" : "";
                        const errorClass = isError ? "bg-red-500/20 border-red-500/50" : "";
                        const disabledClass = showResults ? "pointer-events-none" : "";

                        const circleBase = "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center";
                        const circleSelected = isSelected && !showResults ? "border-teal-400" : "border-slate-600";
                        const circleSuccess = isSuccess ? "border-green-400 bg-green-500" : "";
                        const circleError = isError ? "border-red-400 bg-red-500" : "";

                        return (
                          <label 
                            key={oIdx} 
                            className={[baseClass, selectedClass, successClass, errorClass, disabledClass].filter(Boolean).join(" ")}
                          >
                            <input
                              type="radio"
                              name={`question-\${qIdx}`}
                              value={opt}
                              checked={isSelected}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                              className="hidden"
                              disabled={showResults}
                            />
                            <div className={[circleBase, circleSelected, circleSuccess, circleError].filter(Boolean).join(" ")}>
                              {isSelected && !showResults && <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />}
                              {isSuccess && <CheckCircle2 className="w-full h-full text-white" />}
                              {isError && <XCircle className="w-full h-full text-white" />}
                            </div>
                            <span className="text-slate-300 relative top-0.5">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {showResults && (
                      <div className={`p-4 rounded-xl mt-4 text-sm \${isCorrect ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                        <p className="font-bold mb-1">{isCorrect ? "Correct!" : "Incorrect"}</p>
                        <p className="opacity-90">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!showResults && (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < (data?.quiz?.length || 0)}
                className="w-full mt-10 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-lg py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answers
              </button>
            )}

            {showResults && (
              <div className="mt-8 pt-8 border-t border-slate-700 text-center">
                <p className="text-3xl font-bold text-white mb-2">
                  Score: {Object.keys(quizAnswers).filter(idx => quizAnswers[Number(idx)] === data?.quiz[Number(idx)].correct_answer).length} / {data?.quiz?.length || 0}
                </p>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setQuizAnswers({});
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-teal-400 hover:text-teal-300 font-medium mt-4 underline decoration-teal-500/30 underline-offset-4"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
