import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

// ==========================================
// 🌌 INSTANT SCATTER PARTICLES
// ==========================================
const NeuralParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 4) + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes gentlePulseFloat {
          0% { transform: translateY(0px); opacity: 0.1; box-shadow: 0 0 5px 1px rgba(16, 185, 129, 0.2); }
          50% { transform: translateY(-25px); opacity: 0.9; box-shadow: 0 0 15px 4px rgba(16, 185, 129, 1); }
          100% { transform: translateY(0px); opacity: 0.1; box-shadow: 0 0 5px 1px rgba(16, 185, 129, 0.2); }
        }
        .data-mote {
          position: absolute;
          border-radius: 50%;
          background-color: #10b981; 
          animation: gentlePulseFloat linear infinite;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="data-mote"
          style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.left}%`, top: `${p.top}%`, animationDuration: `${p.duration}s`, animationDelay: `-${p.delay}s` }}
        />
      ))}
    </div>
  );
};

// ==========================================
// 🚀 CUSTOM UI COMPONENTS
// ==========================================
const SkeletonLoader = ({ role }) => (
  <div className="relative space-y-6 p-6 overflow-hidden rounded-2xl bg-white/[0.01] border border-white/[0.02]">
    <div className={`absolute left-0 w-full h-[2px] z-10 scan-laser ${role === 'professor' ? 'bg-emerald-400 shadow-[0_0_20px_4px_rgba(16,185,129,0.5)]' : 'bg-teal-400 shadow-[0_0_20px_4px_rgba(20,184,166,0.5)]'}`}></div>

    <div className="h-8 bg-white/5 rounded-full w-2/3 animate-pulse"></div>
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-white/5 rounded-full"></div>
      <div className="h-4 bg-white/5 rounded-full w-5/6"></div>
      <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
    </div>
    <div className="h-40 bg-white/5 rounded-3xl w-full border border-white/5 animate-pulse"></div>
    <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse"></div>
  </div>
);

const UploadProgress = ({ color }) => (
  <div className="w-full bg-black/40 rounded-full h-1 mt-3 overflow-hidden border border-white/5 shadow-inner">
    <div className={`h-1 rounded-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-teal-500'} animate-[fileUpload_1s_ease-out]`}></div>
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

  const handleStudentGenerate = async (overrideType = null) => {
    if (!studentFile) return alert("Bhai, pehle apna syllabus toh upload karo! 📄");
    setLoading(true); setLesson("");
    const modeToFetch = overrideType || studentPlanType;
    const formData = new FormData();
    formData.append("file", studentFile);
    try {
      const response = await fetch(`http://localhost:8000/student/generate/${modeToFetch}`, { method: "POST", body: formData });
      const data = await response.json();
      if (data.error) setLesson(`🚨 **Backend Error:** \n\n${data.error}`);
      else setLesson(data.content);
    } catch (error) { alert("Backend se rabta nahi ho saka."); }
    setLoading(false);
  };

  const downloadPPTX = async () => {
    try {
      const btn = document.getElementById('pptx-btn');
      if(btn) btn.innerHTML = "<span>⏳</span> Generating...";
      const response = await fetch("http://localhost:8000/generate-pptx", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: lesson, title: `AeroStudy_${role.toUpperCase()}` })
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
        <style> h1, h2, h3 { color: #000; margin-top: 24px; margin-bottom: 12px; font-weight: bold; } h2 { border-bottom: 2px solid #eee; padding-bottom: 8px; } p, li { line-height: 1.6; margin-bottom: 10px; font-size: 15px; } ul { padding-left: 20px; } table { width: 100%; border-collapse: collapse; margin: 1em 0; border: 1px solid #ddd; } th, td { border: 1px solid #ddd; padding: 12px; text-align: left; } th { background-color: #f8f9fa; font-weight: bold; } </style>
        ${cleanHTML}
      </div>
    `;
    html2pdf().set({ margin: 0.5, filename: `AeroStudy_${role}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(pdfContent).save().then(() => {
      if (btn) btn.innerHTML = "<span>📥</span> Save as PDF";
    }).catch((err) => { console.error(err); alert("🚨 PDF masla!"); if (btn) btn.innerHTML = "<span>📥</span> Save as PDF"; });
  };

  // ==========================================
  // 🎨 UI RENDER START
  // ==========================================
  return (
    <div className={`relative min-h-screen bg-[#0A110D] text-[#E2E8F0] overflow-x-hidden font-sans selection:bg-emerald-500/30 ${role === 'professor' ? 'scrollbar-emerald' : 'scrollbar-teal'}`}>

      <NeuralParticles />

      <style>{`
        * { transition: background-color 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.3s; }
        .scrollbar-emerald::-webkit-scrollbar { width: 6px; } .scrollbar-emerald::-webkit-scrollbar-thumb { background-color: #10b981; border-radius: 10px; }
        .scrollbar-teal::-webkit-scrollbar { width: 6px; } .scrollbar-teal::-webkit-scrollbar-thumb { background-color: #14b8a6; border-radius: 10px; }
        body { scrollbar-width: thin; scrollbar-color: ${role === 'professor' ? '#10b981 #0A110D' : role === 'student' ? '#14b8a6 #0A110D' : '#334155 #0A110D'}; }
        
        @keyframes blobBounce { 0% { transform: translate(0,0); } 100% { transform: translate(30px,-40px) scale(1.03); } }
        .aurora-blob { animation: blobBounce 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes floatGeo { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } 100% { transform: translateY(0) rotate(0deg); } }
        .geo-node { animation: floatGeo 8s ease-in-out infinite; }
        
        @keyframes floatItem { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .floating-badge { animation: floatItem 4s ease-in-out infinite; }

        .matte-tile, .matte-card { background: rgba(255, 255, 255, 0.015); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.04); box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 20px 40px -10px rgba(0,0,0,0.5); }
        .matte-tile { border-radius: 24px; } .matte-card { border-radius: 28px; }
        .matte-tile:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.025); border-color: rgba(16, 185, 129, 0.15); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 20px rgba(16,185,129,0.05), 0 20px 40px -10px rgba(0,0,0,0.6); }
        
        .panic-btn-glow { animation: panicPulse 2s infinite; }
        @keyframes panicPulse { 0% { box-shadow: 0 0 0 0px rgba(225,29,72,0.4); } 70% { box-shadow: 0 0 0 12px rgba(225,29,72,0); } 100% { box-shadow: 0 0 0 0px rgba(225,29,72,0); } }
        
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .shimmer::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.01) 20%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) ); animation: shimmer 2.5s infinite; }
        
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        .animate-content { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes scanLaser { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        .scan-laser { animation: scanLaser 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>

      {/* Noise & Gradients */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-emerald-900/15 blur-[140px] pointer-events-none aurora-blob z-0"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-teal-900/15 blur-[140px] pointer-events-none aurora-blob z-0" style={{animationDelay: '-10s', animationDirection: 'reverse'}}></div>

      {/* Floating Geometrics */}
      <div className="fixed top-[20%] right-[15%] w-16 h-16 border border-emerald-500/10 rounded-2xl rotate-12 geo-node pointer-events-none z-0 hidden md:block backdrop-blur-xl bg-emerald-500/[0.01]"></div>
      <div className="fixed bottom-[25%] left-[10%] w-24 h-24 border border-teal-500/10 rounded-full geo-node pointer-events-none z-0 hidden md:block backdrop-blur-xl bg-teal-500/[0.01]" style={{animationDelay: '-4s'}}></div>

      <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto flex flex-col min-h-screen justify-center">

        {/* === MAIN HUB === */}
        {role === null && (
          <div className="text-center animate-content relative w-full max-w-5xl mx-auto">

            {/* VIP ADDITION: Left Side Floating Badge (Gemini Core) */}
            <div className="absolute top-4 left-4 hidden md:flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm floating-badge">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Gemini Core Active</span>
            </div>

            {/* VIP ADDITION: Right Side Floating Badge (Neural Processing) */}
            <div className="absolute top-16 right-8 hidden md:flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm floating-badge" style={{animationDelay: '1.5s'}}>
              <span className="text-teal-400 text-[10px]">✦</span>
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Neural Processing</span>
            </div>

            {/* VIP ADDITION: Top Right System Status (Static) */}
            <div className="absolute top-0 right-4 hidden md:flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Network Online</span>
            </div>

            <h1 className="text-6xl md:text-[5.5rem] font-extrabold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-100 drop-shadow-sm leading-tight mt-8">
              AeroStudy.AI
            </h1>
            <p className="text-lg md:text-xl text-slate-400/80 font-medium mb-16 max-w-2xl mx-auto leading-relaxed border-b border-white/[0.03] pb-10">
              Your personalized cognitive workspace. Select an environment below to begin your focused session.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div onClick={() => setRole('student')} className="group cursor-pointer matte-tile p-8 flex items-center gap-6 transition-all duration-500">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[#0A110D] border border-teal-500/20 flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors"></div>
                  <svg className="w-9 h-9 text-teal-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-teal-300 tracking-tight">Student Core</h2>
                  <p className="text-slate-400/80 text-sm leading-relaxed">Access compressed knowledge, crash courses, and the emergency protocol.</p>
                </div>
              </div>
              <div onClick={() => setRole('professor')} className="group cursor-pointer matte-tile p-8 flex items-center gap-6 transition-all duration-500">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[#0A110D] border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                  <svg className="w-9 h-9 text-emerald-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-emerald-300 tracking-tight">Faculty Terminal</h2>
                  <p className="text-slate-400/80 text-sm leading-relaxed">Generate lesson plans, roadmaps, and validated assessments.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === WORKSPACE PAGES === */}
        {role !== null && (
          <div className="w-full max-w-3xl mx-auto flex-grow flex flex-col pt-6 md:pt-10">
            <header className="mb-10 flex flex-col items-center relative animate-content">
              <button onClick={() => { setRole(null); setLesson(""); }} className="absolute left-0 top-0 text-slate-400 hover:text-white transition-colors bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl backdrop-blur-xl shadow-sm group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Workspace
              </button>
              <div className="text-center pt-14 md:pt-16">
                <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${role === 'professor' ? 'from-emerald-300 to-green-200' : 'from-teal-300 to-cyan-200'}`}>
                  {role === 'professor' ? 'Faculty Command' : 'Learner Dashboard'}
                </h1>
                <p className="text-slate-500 text-xs tracking-[0.2em] uppercase font-mono">Status::{role === 'professor' ? 'ADMIN' : 'USER'}_SYNCED</p>
              </div>
            </header>

            <div className="matte-card p-8 md:p-10 flex flex-col items-center animate-content relative z-10">
              {role === 'professor' && (
                <div className="w-full">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mb-8">
                    {['lesson', 'course', 'exam', 'assignment'].map((type) => (
                      <button key={type} onClick={() => setPlanType(type)} className={`py-3.5 px-3 rounded-xl font-bold text-sm transition-all border ${planType === type ? 'bg-emerald-600/10 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-[1.02]' : 'bg-black/20 text-slate-400/80 border-white/5 hover:bg-white/[0.03] hover:border-emerald-500/20'}`}>
                        {type === 'lesson' ? '📖 Lesson Planner' : type === 'course' ? '📅 Roadmap' : type === 'exam' ? '📝 Smart Exam' : '📋 Rubric'}
                      </button>
                    ))}
                  </div>
                  <div className="w-full mb-6">
                    <label className="text-xs font-bold tracking-widest text-slate-400/80 uppercase mb-2">01::Source PDF</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setFile)} className="w-full file:mr-5 file:py-3 file:px-6 file:rounded-xl file:border file:border-white/5 file:bg-emerald-500/10 file:text-emerald-300 cursor-pointer border border-white/[0.04] p-2 rounded-2xl bg-black/20 shadow-inner" />
                    {showFileUploadProgress && <UploadProgress color="emerald" />}
                  </div>
                  <div className="w-full mb-8">
                    <label className="text-xs font-bold tracking-widest text-slate-400/80 uppercase mb-2">02::System Parameters</label>
                    {planType === 'exam' ? (
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-white/[0.04] bg-black/20 text-slate-200 outline-none cursor-pointer shadow-inner">
                        <option value="Easy">🟢 Easy (Recall)</option><option value="Medium">🟡 Medium (Apply)</option><option value="Hard">🔴 Hard (Synthesize)</option>
                      </select>
                    ) : (
                      <input type="number" min="1" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-white/[0.04] bg-black/20 text-slate-200 shadow-inner" placeholder="Week/Number" />
                    )}
                  </div>
                  <button onClick={handleProfessorGenerate} disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-lg text-white tracking-wide transition-all flex justify-center items-center gap-3 ${loading ? 'bg-emerald-900/30 cursor-not-allowed text-emerald-200/50' : 'bg-[#059669] hover:bg-[#047857] shadow-md hover:-translate-y-1'}`}>
                    {loading ? "⏳ Neural Network Computing..." : "✨ Execute Compilation"}
                  </button>
                </div>
              )}
              {role === 'student' && (
                <div className="w-full">
                  <div className="grid grid-cols-3 gap-3 md:gap-4 w-full mb-8">
                    {['plan', 'crash', 'test'].map((type) => (
                      <button key={type} onClick={() => setStudentPlanType(type)} className={`py-3.5 px-2 rounded-xl font-bold text-sm transition-all border ${studentPlanType === type ? 'bg-teal-600/10 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.1)] scale-[1.02]' : 'bg-black/20 text-slate-400/80 border-white/5 hover:bg-white/[0.03] hover:border-teal-500/20'}`}>
                        {type === 'plan' ? '📅 Plan' : type === 'crash' ? '🚀 Crash Course' : '📝 Mock Test'}
                      </button>
                    ))}
                  </div>
                  <div className="w-full mb-6">
                    <label className="text-xs font-bold tracking-widest text-slate-400/80 uppercase mb-2">01::Source PDF</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setStudentFile)} className="w-full file:mr-5 file:py-3 file:px-6 file:rounded-xl file:border file:border-white/5 file:bg-teal-500/10 file:text-teal-300 cursor-pointer border border-white/[0.04] p-2 rounded-2xl bg-black/20 shadow-inner" />
                    {showFileUploadProgress && <UploadProgress color="teal" />}
                  </div>
                  <div className="w-full flex flex-col gap-5">
                    <button onClick={() => handleStudentGenerate()} disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all flex justify-center items-center gap-3 ${loading ? 'bg-teal-900/30 cursor-not-allowed text-teal-200/50' : 'bg-[#0D9488] hover:bg-[#0F766E] shadow-md hover:-translate-y-1'}`}>
                      {loading ? "⏳ Analyzing Concepts..." : "✨ Execute Compilation"}
                    </button>
                    <div className="relative flex py-1 items-center opacity-60"><div className="flex-grow border-t border-white/[0.05]"></div><span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-mono bg-black/40 px-3 py-1 rounded-full">Protocol Override</span><div className="flex-grow border-t border-white/[0.05]"></div></div>
                    <button onClick={() => handleStudentGenerate('panic')} disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all flex justify-center items-center gap-3 panic-btn-glow ${loading ? 'bg-rose-900/20 cursor-not-allowed border border-rose-800/30' : 'bg-[#be123c] hover:bg-[#9f1239] border border-rose-500/50 hover:-translate-y-1'}`}>
                      🚨 INITIALIZE PANIC MODE (80/20)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RESULT AREA */}
            <div className="mt-8 flex-grow flex flex-col pb-12 animate-content relative z-10">
              {(loading || lesson) && (
                <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4 px-2 border-b border-white/[0.03] pb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-200 flex items-center gap-3"><span className="relative flex h-3 w-3"><span className={`${loading ? 'animate-ping' : ''} absolute h-full w-full rounded-full ${role === 'professor' ? 'bg-emerald-400' : 'bg-teal-400'} opacity-75`}></span><span className={`relative h-3 w-3 rounded-full ${role === 'professor' ? 'bg-emerald-500' : 'bg-teal-500'}`}></span></span>{loading ? 'Processing Document...' : 'Synthesized Output'}</h2>
                  {!loading && lesson && (
                    <div className="flex gap-2">
                      <button id="pptx-btn" onClick={downloadPPTX} className="bg-white/[0.02] border border-white/[0.05] text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-sm px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md flex items-center gap-2"><span>🎇</span> PPTX</button>
                      <button id="pdf-btn" onClick={downloadPDF} className="bg-white/[0.02] border border-white/[0.05] text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 hover:shadow-sm px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md flex items-center gap-2"><span>📥</span> PDF</button>
                    </div>
                  )}
                </div>
              )}
              <div id="lesson-content" className={`${!loading && lesson ? 'matte-card p-6 md:p-10' : ''} shimmer min-h-[300px]`}>
                {loading ? <SkeletonLoader role={role} /> : lesson ? <><style>{`#lesson-content h1, #lesson-content h2, #lesson-content h3 { color: #f8fafc; font-weight: 700; margin-top: 1.8em; margin-bottom: 0.8em; }#lesson-content h1 { font-size: 2.1em; border-b: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.4em; }#lesson-content h2 { font-size: 1.6em; border-b: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.3em; }#lesson-content h3 { font-size: 1.25em; color: ${role === 'professor' ? '#34d399' : '#2dd4bf'}; }#lesson-content p, #lesson-content li { color: #94a3b8; line-height: 1.8; margin-bottom: 1.2em; font-size: 1.05em; }#lesson-content ul, #lesson-content ol { padding-left: 1.5em; color: rgba(255,255,255,0.3); }#lesson-content li { margin-bottom: 0.6em; color: #cbd5e1; }#lesson-content strong { color: #e2e8f0; font-weight: 600; }#lesson-content a { color: #fff; background: ${role === 'professor' ? 'rgba(16,185,129,0.15)' : 'rgba(20,184,166,0.15)'}; padding: 3px 8px; border-radius: 6px; border: 1px solid ${role === 'professor' ? 'rgba(16,185,129,0.2)' : 'rgba(20,184,166,0.2)'}; display: inline-block; margin-top: 4px; }#lesson-content a:hover { background: ${role === 'professor' ? 'rgba(16,185,129,0.25)' : 'rgba(20,184,166,0.25)'}; transform: translateY(-1px); }#lesson-content table { width: 100%; border-collapse: separate; margin: 2em 0; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; background: rgba(0,0,0,0.2); overflow:hidden; }#lesson-content th, #lesson-content td { border-bottom: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03); padding: 14px 18px; text-align: left; }#lesson-content th { background-color: rgba(255,255,255,0.02); color: #f8fafc; font-size: 0.85em; text-transform: uppercase; }#lesson-content tr:hover td { background-color: rgba(255,255,255,0.01); }`}</style><div className="animate-content"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer">{props.children}</a> }}>{lesson}</ReactMarkdown></div></> : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;