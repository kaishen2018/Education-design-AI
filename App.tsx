
import React, { useState, useRef, useEffect } from 'react';
import { generateCurriculum, chatWithLesson } from './services/geminiService';
import { CurriculumDesign, Message, PersonaArchetype, PersonaConfig } from './types';
import ModuleCard from './components/ModuleCard';
import CompetencyRadar from './components/RadarChart';

const PERSONAS: PersonaConfig[] = [
  {
    id: 'Socratic',
    name: '苏格拉底向导',
    icon: 'fa-brain',
    description: '通过提问引导思考',
    instruction: '引导学生发现答案'
  },
  {
    id: 'Enthusiastic',
    name: '热情的导师',
    icon: 'fa-fire-alt',
    description: '充满能量与鼓励',
    instruction: '积极赞美与激发'
  },
  {
    id: 'Explorer',
    name: '好奇探险家',
    icon: 'fa-compass',
    description: '共同探索新奇世界',
    instruction: '与学生并肩探索'
  }
];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(`请以“为我们的城市设计一个漂浮在海上的社区”为教学主题，为小学四年级学生设计一个微型课程单元。要求包含跨学科融合、角色代入、快乐学习机制和新型评价。`);
  const [isLoading, setIsLoading] = useState(false);
  const [design, setDesign] = useState<CurriculumDesign | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userMsg, setUserMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaArchetype>('Socratic');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateCurriculum(prompt);
      setDesign(result);
      setChatMessages([{
        role: 'assistant',
        content: `你好！我是你的 ${result.narrativeRole}。关于这个“${result.title}”的项目，你有什么想和我讨论的吗？`
      }]);
    } catch (error) {
      console.error(error);
      alert("生成课程设计时出错，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim() || !design || isChatLoading) return;

    const newMsgs: Message[] = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMsgs);
    setUserMsg('');
    setIsChatLoading(true);

    try {
      const context = `Lesson: ${design.title}. Overview: ${design.overview}. Role: ${design.narrativeRole}. Joy Mechanism: ${design.joyMechanism.description}`;
      const response = await chatWithLesson(newMsgs, userMsg, context, selectedPersona);
      setChatMessages([...newMsgs, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EduDesign AI
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600">PBL理念</a>
            <a href="#" className="hover:text-indigo-600">现象式教学</a>
            <a href="#" className="hover:text-indigo-600">STEAM整合</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-lightbulb text-amber-500"></i>
              定义你的教学主题
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入你的教学主题或具体需求..."
              className="w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-slate-50"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
              }`}
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> 设计中...</>
              ) : (
                <><i className="fas fa-magic"></i> 生成未来课程方案</>
              )}
            </button>
          </div>

          {/* Assistant Panel (Only visible after generation) */}
          {design && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <i className="fas fa-robot text-indigo-500"></i>
                  AI 学习向导
                </h2>
                <div className="flex gap-1">
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(p.id)}
                      title={p.name}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        selectedPersona === p.id 
                          ? 'bg-indigo-600 text-white scale-110 shadow-md' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <i className={`fas ${p.icon} text-xs`}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Description */}
              <div className="px-3 py-2 bg-indigo-50 rounded-xl mb-4 border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">
                  当前人格：{PERSONAS.find(p => p.id === selectedPersona)?.name}
                </p>
                <p className="text-[11px] text-slate-600">
                  {PERSONAS.find(p => p.id === selectedPersona)?.description}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400">
                      <i className="fas fa-circle-notch fa-spin"></i> 思考中...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={userMsg}
                  onChange={(e) => setUserMsg(e.target.value)}
                  placeholder="提问探索..."
                  className="w-full p-3 pr-10 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-8">
          {!design && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center text-4xl mb-6">
                <i className="fas fa-drafting-compass"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">准备好迎接未来的教育了吗？</h3>
              <p className="text-slate-500 max-w-md">
                在左侧输入你的创意教学主题。我们将基于PBL、STEAM和现象式教学，为您生成跨学科的沉浸式课程设计。
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border animate-pulse">
               <div className="w-2/3 h-64 bg-slate-100 rounded-2xl"></div>
               <div className="w-1/2 h-8 bg-slate-100 rounded-full"></div>
               <div className="w-3/4 h-4 bg-slate-100 rounded-full"></div>
               <div className="w-3/4 h-4 bg-slate-100 rounded-full"></div>
            </div>
          )}

          {design && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Hero Banner */}
              <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={design.imageUrl || "https://picsum.photos/800/400"} 
                  className="w-full h-full object-cover" 
                  alt="Lesson Banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <div className="flex gap-2 mb-2">
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                      {design.targetGrade}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                      未来角色: {design.narrativeRole}
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">{design.title}</h2>
                  <p className="text-white/80 text-sm line-clamp-2">{design.overview}</p>
                </div>
              </div>

              {/* Modules Grid */}
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-puzzle-piece text-indigo-500"></i>
                  跨学科融合图谱
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {design.modules.map((m, i) => (
                    <ModuleCard key={i} module={m} index={i} />
                  ))}
                </div>
              </section>

              {/* Joy Learning Section */}
              <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">
                      快乐学习机制
                    </span>
                    <h3 className="text-2xl font-bold mb-4">{design.joyMechanism.title}</h3>
                    <p className="text-white/90 text-sm mb-6 leading-relaxed">
                      {design.joyMechanism.description}
                    </p>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                      <span className="text-xs font-bold block mb-1">💡 核心习得：</span>
                      <p className="text-sm font-medium italic">{design.joyMechanism.learningOutcome}</p>
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center text-5xl backdrop-blur-md border border-white/30 animate-bounce">
                      <i className="fas fa-gamepad"></i>
                    </div>
                  </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl"></div>
              </section>

              {/* Assessment & Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-award text-amber-500"></i>
                    多元成长评估
                  </h3>
                  <CompetencyRadar data={design.assessment} />
                  <div className="mt-6 space-y-3">
                    {design.assessment.map((m, i) => (
                      <div key={i} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-700">{m.name}</span>
                          <span className="text-[10px] text-indigo-600 font-bold">{m.value}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${m.value}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <i className="fas fa-rocket text-blue-500"></i>
                      结业展示形式
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                      <span className="font-bold text-indigo-600 block mb-2">{design.finalShowcase.format}</span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {design.finalShowcase.description}
                      </p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
                      <i className="fas fa-check-circle"></i> 评估理念
                    </h4>
                    <p className="text-xs text-emerald-700 italic">
                      “不以分数为目的，关注在这个过程中每一个被激发的灵感瞬间。”
                    </p>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            Built with <i className="fas fa-heart text-red-500"></i> for the Future of Education
          </p>
          <div className="mt-4 flex justify-center gap-4 text-slate-400 text-lg">
            <i className="fab fa-github hover:text-indigo-600 cursor-pointer"></i>
            <i className="fab fa-twitter hover:text-indigo-600 cursor-pointer"></i>
            <i className="fab fa-discord hover:text-indigo-600 cursor-pointer"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
