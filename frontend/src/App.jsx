import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

// ==========================================
// CUSTOM UI COMPONENTS
// ==========================================
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse p-4">
    <div className="h-8 bg-white/5 rounded-full w-2/3"></div>
    <div className="space-y-3">
      <div className="h-4 bg-white/5 rounded-full"></div>
      <div className="h-4 bg-white/5 rounded-full w-5/6"></div>
      <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
    </div>
    <div className="h-40 bg-white/5 rounded-2xl w-full border border-white/5"></div>
    <div className="h-4 bg-white/5 rounded-full w-1/2"></div>
  </div>
);

const UploadProgress = ({ color }) => (
  <div className="w-full bg-black/40 rounded-full h-1 mt-3 overflow-hidden border border-white/5">
    <div className={`h-1 rounded-full ${color === 'purple' ? 'bg-purple-500' : 'bg-cyan-500'} animate-[fileUpload_1s_ease-out]`}></div>
  </div>
);

function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState("");
  const [showFileUploadProgress, setShowFileUploadProgress] = useState(false);

  const [file, setFile] = useState(null);
  const [planType, setPlanType] = useState('lesson');
  const [inputValue, setInputValue] = useState(1);
  const [difficulty, setDifficulty] = useState('Medium');

  const [studentFile, setStudentFile] = useState(null);
  const [studentPlanType, setStudentPlanType] = useState('plan');

  const handleFileChange = (e, setFileFunc) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileFunc(selectedFile);
      setShowFileUploadProgress(true);
      setTimeout(() => setShowFileUploadProgress(false), 1200);
    }
  };

  // ==========================================
  // 👨‍🏫 PROFESSOR FUNCTION
  // ==========================================
  const handleProfessorGenerate = async () => {
    if (!file) return alert("Pehle syllabus PDF select karein!");
    setLoading(true); setLesson("");

    const formData = new FormData();
    formData.append("file", file);

    let endpoint = "";
    if (planType === 'lesson') endpoint = `http://localhost:8000/generate-lesson/${inputValue}`;
    else if (planType === 'course') endpoint = `http://localhost:8000/generate-course-plan/${inputValue}`;
    else if (planType === 'exam') endpoint = `http://localhost:8000/generate-exam/${difficulty}`;
    else if (planType === 'assignment') endpoint = `http://localhost:8000/generate-assignment/${inputValue}`;

    try {
      const response = await fetch(endpoint, { method: "POST", body: formData });
      const data = await response.json();
      if (data.error) setLesson(`🚨 **Backend Error:** \n\n${data.error}`);
      else setLesson(data.content);
    } catch (error) { alert("Backend se rabta nahi ho saka."); }
    setLoading(false);
  };

  // ==========================================
  // 🎓 STUDENT FUNCTION
  // ==========================================
  const handleStudentGenerate = async (overrideType = null) => {
    if (!studentFile) return alert("Bhai, pehle apna syllabus toh upload karo! 📄");
    setLoading(true); setLesson("");

    const modeToFetch = overrideType || studentPlanType;
    const formData = new FormData();
    formData.append("file", studentFile);

    try {
      const response = await fetch(`http://localhost:8000/student/generate/${modeToFetch}`, {
        method: "POST", body: formData
      });
      const data = await response.json();
      if (data.error) setLesson(`🚨 **Backend Error:** \n\n${data.error}`);
      else setLesson(data.content);
    } catch (error) { alert("Backend se rabta nahi ho saka."); }
    setLoading(false);
  };

  // ==========================================
  // 🛠️ UTILITY FUNCTIONS
  // ==========================================
  const downloadPPTX = async () => {
    try {
      const btn = document.getElementById('pptx-btn');
      if(btn) btn.innerHTML = "<span>⏳</span> Generating...";
      const response = await fetch("http://localhost:8000/generate-pptx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lesson, title: `AeroStudy_${role.toUpperCase()}` })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `AeroStudy_${role}.pptx`;
        document.body.appendChild(a); a.click(); a.remove();
      } else { alert("🚨 PPTX Generate karne mein masla aaya!"); }
      if(btn) btn.innerHTML = "<span>🎇</span> Download PPTX";
    } catch (error) { alert("Backend se rabta nahi ho saka."); }
  };

  const downloadPDF = () => {
    const btn = document.getElementById('pdf-btn');
    if (btn) btn.innerHTML = "<span>⏳</span> Saving...";
    const originalElement = document.getElementById('lesson-content');
    let cleanHTML = originalElement.innerHTML.replace(/class="[^"]*"/g, '');

    const pdfContent = `
      <div style="padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background: #fff;">
        <style>
          h1, h2, h3 { color: #000; margin-top: 24px; margin-bottom: 12px; font-weight: bold; }
          h2 { border-bottom: 2px solid #eee; padding-bottom: 8px; }
          p, li { line-height: 1.6; margin-bottom: 10px; font-size: 15px; }
          ul { padding-left: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 1em 0; border: 1px solid #ddd; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
        </style>
        ${cleanHTML}
      </div>
    `;
    html2pdf().set({
      margin: 0.5, filename: `AeroStudy_${role}.pdf`, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(pdfContent).save().then(() => {
      if (btn) btn.innerHTML = "<span>📥</span> Save as PDF";
    }).catch((err) => {
      console.error(err); alert("🚨 PDF masla!");
      if (btn) btn.innerHTML = "<span>📥</span> Save as PDF";
    });
  };

  // ==========================================
  // 🎨 UI RENDER START
  // ==========================================
  return (
    <div className={`relative min-h-screen bg-[#060811] text-slate-300 overflow-x-hidden font-sans selection:bg-cyan-500/30 ${role === 'professor' ? 'scrollbar-purple' : 'scrollbar-cyan'}`}>

      <style>{`
        * { transition: background-color 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.3s; }
        .scrollbar-purple::-webkit-scrollbar { width: 6px; }
        .scrollbar-purple::-webkit-scrollbar-thumb { background-color: #a855f7; border-radius: 10px; box-shadow: 0 0 10px rgba(168,85,247,0.5); }
        .scrollbar-cyan::-webkit-scrollbar { width: 6px; }
        .scrollbar-cyan::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 10px; box-shadow: 0 0 10px rgba(6,182,212,0.5); }
        body { scrollbar-width: thin; scrollbar-color: ${role === 'professor' ? '#a855f7 #060811' : role === 'student' ? '#06b6d4 #060811' : '#475569 #060811'}; }
        
        @keyframes drift { 0% { transform: translate(0,0); } 50% { transform: translate(10%, 10%); } 100% { transform: translate(0,0); } }
        .ambient-glow { animation: drift 20s infinite alternate ease-in-out; }
        
        /* 🚀 New Float Animation for Badges */
        @keyframes floatItem { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .floating-badge { animation: floatItem 4s ease-in-out infinite; }
        .floating-badge-delayed { animation: floatItem 5s ease-in-out infinite; animation-delay: 1s; }

        @keyframes fileUpload { from { width: 0%; } to { width: 100%; } }
        
        .glass-card { position: relative; overflow: hidden; background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; }
        .glass-card::before { content:''; position: absolute; top:0; left:-100%; width:100%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent); transition: 0.5s; pointer-events:none; }
        .glass-card:hover::before { left:100%; }
        .glass-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.15); }
        
        @keyframes panicPulse { 0% { box-shadow: 0 0 0 0px rgba(239,68,68,0.7); } 70% { box-shadow: 0 0 0 15px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0px rgba(239,68,68,0); } }
        .panic-btn-glow { animation: panicPulse 1.5s infinite; }
        
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .shimmer::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.02) 20%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) ); animation: shimmer 2s infinite; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-content { animation: slideUpFade 0.6s ease-out; }
      `}</style>

      {/* 🌌 AMBIENT BACKGROUND GLOWS */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-800/10 blur-[150px] pointer-events-none ambient-glow z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-800/10 blur-[150px] pointer-events-none ambient-glow z-0" style={{animationDelay: '-10s'}}></div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto flex flex-col min-h-screen justify-center">

        {/* === ✨ UPGRADED CYBER HOME PAGE === */}
        {role === null && (
          <div className="text-center animate-content relative">

            {/* Floating Tech Badges */}
            <div className="hidden md:flex absolute top-10 left-0 floating-badge items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs text-slate-300 font-mono">Gemini 2.5 Active</span>
            </div>

            <div className="hidden md:flex absolute top-20 right-0 floating-badge-delayed items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <span className="text-purple-400">⚡</span>
              <span className="text-xs text-slate-300 font-mono">Real-Time Processing</span>
            </div>

            <div className="inline-block mb-6 px-5 py-2 rounded-full bg-black/30 border border-white/10 text-xs font-bold tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] uppercase">
              System Initialization
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold mb-7 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              AeroStudy.AI
            </h1>

            <p className="text-lg md:text-xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed border-b border-white/5 pb-8">
              The next generation of educational neural networks. Supercharge your workflow by selecting your dedicated operating system below.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Student Card with Vector SVG */}
              <div onClick={() => setRole('student')} className="group cursor-pointer glass-card p-12 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col items-center">

                {/* Custom SVG Icon replacing Emoji */}
                <svg className="w-20 h-20 text-cyan-400 mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" />
                </svg>

                <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Student Core</h2>
                <p className="text-slate-400 text-center text-sm leading-relaxed font-mono">
                  [Extract High-Yield Data] <br/> Activate Crash Courses & Emergency Panic Protocols.
                </p>
              </div>

              {/* Professor Card with Vector SVG */}
              <div onClick={() => setRole('professor')} className="group cursor-pointer glass-card p-12 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col items-center">

                {/* Custom SVG Icon replacing Emoji */}
                <svg className="w-20 h-20 text-purple-400 mb-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>

                <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Faculty Terminal</h2>
                <p className="text-slate-400 text-center text-sm leading-relaxed font-mono">
                  [Generate Architectures] <br/> Build Algorithmic Lesson Plans & Smart Rubrics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === INNER PAGES (No changes needed here, perfectly preserved) === */}
        {role !== null && (
          <div className="w-full max-w-3xl mx-auto flex-grow flex flex-col pt-10">

            <header className="mb-12 flex flex-col items-center relative animate-content">
              <button onClick={() => { setRole(null); setLesson(""); }} className="absolute left-0 top-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Core
              </button>
              <div className="text-center pt-16">
                <h1 className={`text-5xl font-extrabold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${role === 'professor' ? 'from-purple-400 to-pink-500' : 'from-cyan-400 to-blue-500'} drop-shadow-[0_0_15px_${role === 'professor' ? 'rgba(168,85,247,0.3)' : 'rgba(6,182,212,0.3)'}]`}>
                  {role === 'professor' ? 'Faculty Command Center' : 'Learner Dashboard'}
                </h1>
                <p className="text-slate-500 text-xs tracking-widest uppercase font-mono border-b border-white/5 pb-2">Session::{role === 'professor' ? 'ADMIN' : 'USER'}_ALPHA</p>
              </div>
            </header>

            <div className="glass-card p-9 flex flex-col items-center shadow-2xl animate-content">
              {/* PROFESSOR CONTROLS */}
              {role === 'professor' && (
                <>
                  <div className="grid grid-cols-2 gap-4 w-full mb-9">
                    {['lesson', 'course', 'exam', 'assignment'].map((type) => (
                      <button key={type} onClick={() => setPlanType(type)} className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all border ${planType === type ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-[1.02]' : 'bg-black/40 text-slate-400 border-white/5 hover:bg-white/5 hover:border-purple-500/30 hover:-translate-y-0.5'}`}>
                        {type === 'lesson' ? '📖 Lesson Planner' : type === 'course' ? '📅 Course Roadmap' : type === 'exam' ? '📝 Smart Assessment' : '📋 Grading Rubric'}
                      </button>
                    ))}
                  </div>

                  <div className="w-full mb-7">
                    <label className="block text-xs font-mono tracking-widest text-slate-500 uppercase mb-2.5">01::Data Source (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setFile)} className="w-full file:mr-5 file:py-3 file:px-6 file:rounded-xl file:border file:border-white/5 file:bg-purple-500/10 file:text-purple-300 file:font-bold hover:file:bg-purple-500/20 cursor-pointer border border-white/10 p-2.5 rounded-2xl bg-black/40 text-slate-300" />
                    {showFileUploadProgress && <UploadProgress color="purple" />}
                  </div>

                  <div className="w-full mb-9">
                    <label className="block text-xs font-mono tracking-widest text-slate-500 uppercase mb-2.5">02::System Parameters</label>
                    {planType === 'exam' ? (
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-black/40 text-white outline-none focus:border-purple-500 transition-colors cursor-pointer">
                        <option value="Easy">🔴 Basic Knowledge (Recall)</option><option value="Medium">🟡 Intermediate (Application)</option><option value="Hard">🟣 Advanced (Synthesis)</option>
                      </select>
                    ) : (
                      <input type="number" min="1" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-black/40 text-white outline-none focus:border-purple-500 transition-colors" placeholder="Enter week/number index" />
                    )}
                  </div>

                  <button onClick={handleProfessorGenerate} disabled={loading} className={`w-full py-4.5 rounded-2xl font-extrabold text-lg text-white tracking-wide transition-all flex justify-center items-center gap-3 ${loading ? 'bg-purple-900/40 cursor-not-allowed border border-purple-800' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-500 hover:-translate-y-1'}`}>
                    {loading ? "⏳ Neural Network Computing..." : "✨ Execute Academic Generation"}
                  </button>
                </>
              )}

              {/* STUDENT CONTROLS */}
              {role === 'student' && (
                <>
                  <div className="grid grid-cols-3 gap-4 w-full mb-9">
                    {['plan', 'crash', 'test'].map((type) => (
                      <button key={type} onClick={() => setStudentPlanType(type)} className={`py-4 px-2 rounded-xl font-bold text-sm transition-all border ${studentPlanType === type ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.02]' : 'bg-black/40 text-slate-400 border-white/5 hover:bg-white/5 hover:border-cyan-500/30 hover:-translate-y-0.5'}`}>
                        {type === 'plan' ? '📅 Structured Plan' : type === 'crash' ? '🚀 Crash Course' : '📝 Mock Assessment'}
                      </button>
                    ))}
                  </div>

                  <div className="w-full mb-7">
                    <label className="block text-xs font-mono tracking-widest text-slate-500 uppercase mb-2.5">01::Knowledge Input (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setStudentFile)} className="w-full file:mr-5 file:py-3 file:px-6 file:rounded-xl file:border file:border-white/5 file:bg-cyan-500/10 file:text-cyan-300 file:font-bold hover:file:bg-cyan-500/20 cursor-pointer border border-white/10 p-2.5 rounded-2xl bg-black/40 text-slate-300" />
                    {showFileUploadProgress && <UploadProgress color="cyan" />}
                  </div>

                  <div className="w-full flex flex-col gap-5">
                    <button onClick={() => handleStudentGenerate()} disabled={loading} className={`w-full py-4.5 rounded-2xl font-extrabold text-lg text-white transition-all flex justify-center items-center gap-3 ${loading ? 'bg-cyan-900/40 cursor-not-allowed border border-cyan-800' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-500 hover:-translate-y-1'}`}>
                      {loading ? "⏳ Extracting Key Concepts..." : "✨ Execute Core Generation"}
                    </button>

                    <div className="relative flex py-3 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-600 text-xs font-mono tracking-widest uppercase border border-white/5 px-3 py-1 rounded-full">Secure Emergency Protocol</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <button onClick={() => handleStudentGenerate('panic')} disabled={loading} className={`w-full py-4.5 rounded-2xl font-extrabold text-lg text-white transition-all flex justify-center items-center gap-3 panic-btn-glow ${loading ? 'bg-red-900/40 cursor-not-allowed border border-red-800' : 'bg-red-600 hover:bg-red-500 border border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]'}`}>
                      🚨 INITIALIZE PANIC MODE (80/20 High-Yield)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* RESULT AREA */}
            <div className="mt-8 flex-grow flex flex-col pb-12 animate-content">
              {(loading || lesson) && (
                <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4 border-b border-white/5 pb-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`${loading ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full ${role === 'professor' ? 'bg-purple-500' : 'bg-cyan-500'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${role === 'professor' ? 'bg-purple-600' : 'bg-cyan-600'}`}></span>
                    </span>
                    {loading ? 'Processing System Output' : 'System Generated Result'}
                  </h2>
                  {!loading && lesson && (
                    <div className="flex gap-2">
                      <button id="pptx-btn" onClick={downloadPPTX} className="bg-black/30 border border-white/10 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-300 hover:shadow-[0_0_15px_rgba(251,146,60,0.2)] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5">
                        <span>🎇</span> Download PPTX
                      </button>
                      <button id="pdf-btn" onClick={downloadPDF} className="bg-black/30 border border-white/10 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5">
                        <span>📥</span> Download PDF
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div id="lesson-content" className={`${!loading && lesson ? 'glass-card p-9' : ''} shimmer max-w-none flex-grow min-h-[300px]`}>
                {loading ? (
                  <SkeletonLoader />
                ) : lesson ? (
                  <>
                    <style>{`
                      #lesson-content h1, #lesson-content h2, #lesson-content h3 { color: #f8fafc; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.6em; }
                      #lesson-content h1 { font-size: 2.25em; border-b: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.3em; }
                      #lesson-content h2 { font-size: 1.75em; border-b: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.3em; margin-top: 1.8em; }
                      #lesson-content h3 { font-size: 1.35em; color: ${role === 'professor' ? '#d8b4fe' : '#a5f3fc'} }
                      #lesson-content p, #lesson-content li { color: #cbd5e1; line-height: 1.8; margin-bottom: 1.2em; font-size: 1.05em; }
                      #lesson-content ul, #lesson-content ol { padding-left: 1.5em; margin-bottom: 1.5em; list-style-type: disc; color: rgba(255,255,255,0.2) }
                      #lesson-content li { margin-bottom: 0.6em; color: #cbd5e1; }
                      #lesson-content strong { color: #e2e8f0; font-weight: 600; }
                      #lesson-content a { color: #38bdf8; text-decoration: none; font-weight: bold; transition: all 0.3s; padding: 0 2px; border-radius: 4px; }
                      #lesson-content a:hover { color: #fff; background-color: rgba(56,189,248,0.2); text-shadow: 0 0 10px rgba(56,189,248,0.8); }
                      #lesson-content table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 1.5em 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.2); }
                      #lesson-content th, #lesson-content td { border-bottom: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); padding: 14px 18px; text-align: left; }
                      #lesson-content th:last-child, #lesson-content td:last-child { border-right: 0; }
                      #lesson-content tr:last-child td { border-bottom: 0; }
                      #lesson-content th { background-color: rgba(255,255,255,0.03); color: #f8fafc; font-weight: 700; font-family: font-mono; font-size: 0.9em; text-transform: uppercase; }
                      #lesson-content tr:hover td { background-color: rgba(255,255,255,0.01); }
                    `}</style>
                    <div className="animate-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson}</ReactMarkdown>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;