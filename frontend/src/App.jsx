import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState("");

  const handleGenerate = async () => {
    if (!file) return alert("Pehle syllabus PDF select karein!");

    setLoading(true);
    setLesson("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/generate-lesson/1", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setLesson(data.content);
    } catch (error) {
      console.error("Error:", error);
      alert("Backend se rabta nahi ho saka. FastAPI server on hai?");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const element = document.getElementById('lesson-content');
    const opt = {
      margin:       0.8,
      filename:     'AI_Lesson_Plan.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    // Main Container (Grid + Hidden Overflow for Blobs)
    <div className="relative min-h-screen bg-slate-50 overflow-hidden selection:bg-indigo-200 font-sans text-slate-800">

      {/* --- PREMIUM BACKGROUND EFFECTS --- */}
      {/* 1. Subtle Tech Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* 2. Animated Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob z-0"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000 z-0"></div>
      {/* --------------------------------- */}

      {/* Main Content Area (Z-10 keeps it above the background) */}
      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-12">

        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/60 border border-slate-200 backdrop-blur-md text-sm font-bold text-indigo-600 shadow-sm">
            ✨ Next-Gen Educator Tool
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 drop-shadow-sm">
            AI Lesson Creator
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Upload your syllabus and let <span className="text-indigo-600 font-bold">AI</span> design your curriculum in seconds.
          </p>
        </header>

        {/* Premium Glassmorphism Upload Card */}
        <div className="bg-white/50 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] border border-white/80 flex flex-col items-center space-y-8 transition-all hover:bg-white/60">

          <div className="w-full max-w-lg group">
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-2 transition-colors group-hover:text-indigo-600">
              Drop your Syllabus PDF here
            </label>
            <div className="relative border-2 border-dashed border-indigo-200/80 rounded-2xl p-4 bg-white/40 hover:bg-white/80 transition-all duration-300 hover:border-indigo-400 hover:shadow-inner">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer outline-none"
              />
            </div>
          </div>

          {/* Futuristic Magic Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full max-w-lg py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 shadow-lg flex justify-center items-center gap-3 relative overflow-hidden ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed text-white shadow-none' 
                : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1'
            }`}
          >
            {/* Button Shine Effect (Only visible when not loading) */}
            {!loading && <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>}

            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Syllabus...
                </>
              ) : (
                "✨ Generate Lesson Plan"
              )}
            </span>
          </button>
        </div>

        {/* Result Area */}
        {lesson && (
          <div className="mt-12 animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500">Lesson Plan</span>
              </h2>
              <button
                onClick={downloadPDF}
                className="bg-white border border-slate-200 hover:border-indigo-400 text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download PDF
              </button>
            </div>

            <div
              id="lesson-content"
              className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white prose prose-lg prose-indigo max-w-none text-slate-700 leading-relaxed"
            >
              <ReactMarkdown>{lesson}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;