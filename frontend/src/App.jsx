import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

function App() {
  const [file, setFile] = useState(null);
  const [lessonNumber, setLessonNumber] = useState(1); // Naya State: Lesson Number ke liye
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState("");

  const handleGenerate = async () => {
    if (!file) return alert("Pehle syllabus PDF select karein!");
    if (!lessonNumber || lessonNumber < 1) return alert("Sahi lesson number likhein!");

    setLoading(true);
    setLesson("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Ab hum URL mein user ka select kiya hua number bhej rahe hain
      const response = await fetch(`http://localhost:8000/generate-lesson/${lessonNumber}`, {
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
      filename:     `AI_Lesson_Plan_Week_${lessonNumber}.pdf`, // PDF ka naam bhi dynamic ho gaya
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden selection:bg-indigo-200 font-sans text-slate-800">

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-[blob_7s_infinite_alternate] z-0"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-[blob_7s_infinite_alternate] animation-delay-2000 z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-12">

        <header className="text-center mb-12">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/60 border border-slate-200 backdrop-blur-md text-sm font-bold text-indigo-600 shadow-sm">
            ✨ Dynamic AI Educator
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
            AI Lesson Creator
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Upload syllabus, select your week, and let AI do the heavy lifting.
          </p>
        </header>

        <div className="bg-white/50 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] border border-white/80 flex flex-col items-center transition-all">

          {/* File Upload Box */}
          <div className="w-full max-w-lg mb-6 group">
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-2">
              1. Drop your Syllabus PDF
            </label>
            <div className="relative border-2 border-dashed border-indigo-200/80 rounded-2xl p-4 bg-white/40 hover:bg-white/80 transition-all duration-300">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 cursor-pointer outline-none"
              />
            </div>
          </div>

          {/* NAYA FEATURE: Lesson Number Input */}
          <div className="w-full max-w-lg mb-8 group">
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-2">
              2. Which lesson/week do you want?
            </label>
            <input
              type="number"
              min="1"
              value={lessonNumber}
              onChange={(e) => setLessonNumber(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border-2 border-indigo-100 bg-white/60 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all text-lg font-bold text-slate-700"
              placeholder="E.g., 2"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full max-w-lg py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 shadow-lg flex justify-center items-center gap-3 relative overflow-hidden ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed text-white shadow-none' 
                : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? "✨ Generating..." : `✨ Generate Lesson #${lessonNumber}`}
            </span>
          </button>
        </div>

        {lesson && (
          <div className="mt-12 animate-[slideUp_0.6s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Lesson Plan for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500">Week {lessonNumber}</span>
              </h2>
              <button
                onClick={downloadPDF}
                className="bg-white border border-slate-200 hover:border-indigo-400 text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
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