
import React, { useState, useEffect, useCallback } from 'react';

// --- INTERFACES ---
interface UserProfile {
  name: string;
  level: number;
  unlockedModuleId: number;
  xp: number;
  sigmas: number;
  lives: number;
}

interface Account extends UserProfile {
  passwordHash: string;
}

interface Module {
  id: number;
  title: string;
  range: [number, number];
  description: string;
  color: string;
}

interface Problem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
  moduleName: string;
}

interface ExamState {
  isActive: boolean;
  moduleId: number;
  questions: Problem[];
  currentIndex: number;
  score: number;
}

const MODULES: Module[] = [
  { id: 1, title: "Aritmética Primordial", range: [1, 100], color: "indigo", description: "Números, operações e fluência básica." },
  { id: 2, title: "Proporcionalidade", range: [101, 200], color: "sky", description: "Razões, proporções e porcentagens." },
  { id: 3, title: "Álgebra Inicial", range: [201, 300], color: "emerald", description: "Equações, variáveis e simbolismo." },
  { id: 4, title: "Geometria Plana", range: [301, 400], color: "amber", description: "Formas, ângulos, áreas e perímetros." },
  { id: 5, title: "Funções e Logaritmos", range: [401, 500], color: "orange", description: "Relações, gráficos e crescimento." },
  { id: 6, title: "Trigonometria", range: [501, 600], color: "rose", description: "Círculo trigonométrico e identidades." },
];

const generateProblem = (level: number): Problem => {
  const id = Math.random().toString(36).substr(2, 9);
  let question = "";
  let answer = "";
  let options: string[] = [];
  let hint = "";
  let moduleName = "";

  const genOptions = (ans: number) => {
    const set = new Set([ans]);
    while (set.size < 4) {
      const offset = Math.floor(Math.random() * 10) + 1;
      set.add(Math.random() > 0.5 ? ans + offset : ans - offset);
    }
    return Array.from(set).map(String).sort(() => Math.random() - 0.5);
  };

  if (level <= 100) {
    moduleName = "Aritmética";
    const a = Math.floor(Math.random() * 12) + (level % 10);
    const b = Math.floor(Math.random() * 8) + 2;
    question = `${a} + ${b} = ?`;
    answer = String(a + b);
    options = genOptions(a + b);
    hint = "Tente decompor os números.";
  } else if (level <= 200) {
    moduleName = "Proporcionalidade";
    const val = 10 + (level % 20);
    question = `Se 1 unidade custa ${val}, quanto custam 3?`;
    answer = String(val * 3);
    options = genOptions(val * 3);
    hint = "Multiplicação simples.";
  } else {
    moduleName = "Geral";
    question = `Quanto é 5 x 5?`;
    answer = "25";
    options = ["20", "25", "30", "15"];
    hint = "Soma repetida.";
  }

  return { id, question, options, answer, hint, moduleName };
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<'trilha' | 'play' | 'sobre' | 'exam' | 'gameover'>('trilha');
  const [level, setLevel] = useState(1);
  const [unlockedModuleId, setUnlockedModuleId] = useState(1);
  const [xp, setXp] = useState(0);
  const [sigmas, setSigmas] = useState(100);
  const [lives, setLives] = useState(5);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [answered, setAnswered] = useState(false);

  const [exam, setExam] = useState<ExamState>({
    isActive: false, moduleId: 0, questions: [], currentIndex: 0, score: 0
  });

  // Carregar Sessão
  useEffect(() => {
    const session = localStorage.getItem('mathpath_session');
    if (session) {
      const user = JSON.parse(session);
      setCurrentUser(user);
      setLevel(user.level);
      setUnlockedModuleId(user.unlockedModuleId);
      setXp(user.xp);
      setSigmas(user.sigmas);
      setLives(user.lives);
    }
  }, []);

  // Salvar Progresso
  useEffect(() => {
    if (currentUser) {
      const updatedUser: UserProfile = { name: currentUser.name, level, unlockedModuleId, xp, sigmas, lives };
      localStorage.setItem('mathpath_session', JSON.stringify(updatedUser));
      const accounts = JSON.parse(localStorage.getItem('mathpath_accounts') || '{}');
      if (accounts[currentUser.name]) {
        accounts[currentUser.name] = { ...accounts[currentUser.name], ...updatedUser };
        localStorage.setItem('mathpath_accounts', JSON.stringify(accounts));
      }
    }
  }, [level, unlockedModuleId, xp, sigmas, lives, currentUser]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const accounts = JSON.parse(localStorage.getItem('mathpath_accounts') || '{}');
    const name = formData.name.trim().toLowerCase();
    
    if (authMode === 'signup') {
      if (accounts[name]) return setAuthError("Usuário já existe.");
      const newUser = { name, passwordHash: formData.password, level: 1, unlockedModuleId: 1, xp: 0, sigmas: 100, lives: 5 };
      accounts[name] = newUser;
      localStorage.setItem('mathpath_accounts', JSON.stringify(accounts));
      setCurrentUser(newUser);
    } else {
      const acc = accounts[name];
      if (!acc || acc.passwordHash !== formData.password) return setAuthError("Erro de acesso.");
      setCurrentUser(acc);
      setLevel(acc.level);
      setUnlockedModuleId(acc.unlockedModuleId);
      setXp(acc.xp);
      setSigmas(acc.sigmas);
      setLives(acc.lives);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mathpath_session');
    setActiveTab('trilha');
  };

  const nextTask = useCallback(() => {
    setAnswered(false);
    setFeedback(null);
    if (exam.isActive) {
      if (exam.currentIndex < 9) {
        setExam(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      } else {
        const passed = exam.score >= 8;
        if (passed) {
          setUnlockedModuleId(prev => Math.max(prev, exam.moduleId + 1));
          setFeedback({ type: 'success', msg: "Módulo Desbloqueado!" });
        } else {
          setFeedback({ type: 'error', msg: "Estude mais e tente novamente." });
        }
        setTimeout(() => {
          setExam(prev => ({ ...prev, isActive: false }));
          setActiveTab('trilha');
          setFeedback(null);
        }, 2500);
      }
    } else {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setCurrentProblem(generateProblem(nextLevel));
    }
  }, [exam, level]);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);
    const correctAns = exam.isActive ? exam.questions[exam.currentIndex].answer : currentProblem?.answer;
    const isCorrect = option === correctAns;

    if (isCorrect) {
      setFeedback({ type: 'success', msg: "+20 XP | Sucesso!" });
      setXp(p => p + 20);
      if (exam.isActive) setExam(p => ({ ...p, score: p.score + 1 }));
      setTimeout(nextTask, 1200);
    } else {
      setFeedback({ type: 'error', msg: "Tente analisar novamente." });
      setLives(prev => {
        const newLives = Math.max(0, prev - 1);
        if (newLives === 0) {
          setTimeout(() => {
            setActiveTab('gameover');
            setExam(e => ({...e, isActive: false}));
          }, 1000);
        }
        return newLives;
      });
      setTimeout(() => {
        setAnswered(false);
        setFeedback(null);
      }, 1500);
    }
  };

  const startExam = (modId: number) => {
    const q = Array.from({ length: 10 }, () => generateProblem(MODULES[modId - 1].range[0] + 5));
    setExam({ isActive: true, moduleId: modId, questions: q, currentIndex: 0, score: 0 });
    setActiveTab('exam');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full animate-fadeIn border-t-8 border-indigo-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black italic tracking-tighter text-indigo-600 mb-1">MP.1000</h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">SISTEMA DE MAESTRIA ATIVA</p>
          </div>
          <div className="flex mb-8 bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>LOGIN</button>
            <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${authMode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>CADASTRO</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="text" placeholder="ID de Usuário" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold" required />
            <input type="password" placeholder="Chave de Acesso" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold" required />
            {authError && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-wider">{authError}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">INICIAR MISSÃO</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-medium">
      {/* HUD SUPERIOR */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest shadow-xl sticky top-0 z-50">
        <div className="flex space-x-6 items-center">
          <span className="text-indigo-400 border-r border-slate-700 pr-6">MP.DASH</span>
          <span>USR: {currentUser.name}</span>
          <span className="text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">Nível {level}</span>
          <span className="text-emerald-400">XP: {xp}</span>
        </div>
        <div className="flex space-x-6 items-center">
          <div className="flex items-center">
            <span className="mr-2">HP:</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${i < lives ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
          <button onClick={handleLogout} className="bg-rose-600/20 text-rose-400 px-3 py-1 rounded hover:bg-rose-600 hover:text-white transition-all">TERMINAR</button>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-[38px] z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black italic text-indigo-600 tracking-tighter">MATHPATH</span>
            <span className="text-xs font-black text-slate-300">1.000</span>
          </div>
          <nav className="flex space-x-2">
            <button onClick={() => setActiveTab('trilha')} className={`px-6 py-2 rounded-full text-xs font-black transition-all ${activeTab === 'trilha' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>MAPA</button>
            <button onClick={() => setActiveTab('sobre')} className={`px-6 py-2 rounded-full text-xs font-black transition-all ${activeTab === 'sobre' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>SOBRE</button>
          </nav>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        {activeTab === 'trilha' && (
          <div className="animate-fadeIn">
            <div className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Trilha de Aprendizagem</h2>
                <div className="flex items-center space-x-3 text-slate-500 text-[10px] font-black uppercase">
                  <span>Módulo Atual:</span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{MODULES[unlockedModuleId-1].title}</span>
                </div>
              </div>
              <div className="hidden md:block bg-indigo-50 border border-indigo-100 p-4 rounded-3xl">
                <span className="block text-[9px] font-black text-indigo-400 mb-1 uppercase tracking-wider">Progresso Global</span>
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(level/1000)*100}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MODULES.map((m) => {
                const isLocked = m.id > unlockedModuleId;
                const isCurrent = m.id === unlockedModuleId;
                return (
                  <div key={m.id} className={`group bg-white p-8 rounded-[40px] border-2 transition-all duration-300 relative overflow-hidden ${isLocked ? 'border-slate-100 opacity-60' : isCurrent ? 'border-indigo-500 shadow-xl scale-[1.02]' : 'border-slate-200 hover:border-indigo-400 hover:shadow-lg'}`}>
                    {isCurrent && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black px-4 py-1 rounded-bl-xl uppercase">Ativo</div>}
                    <div className="mb-6"><span className="text-[9px] font-black px-4 py-1.5 rounded-full uppercase bg-slate-100 text-slate-500">Módulo {m.id}</span></div>
                    <h3 className="font-black text-2xl mb-4 text-slate-800">{isLocked ? '🔒 ' : ''}{m.title}</h3>
                    <p className="text-xs text-slate-500 mb-10 leading-relaxed font-semibold">{m.description}</p>
                    <div className="flex gap-3">
                      {!isLocked ? (
                        <button onClick={() => {setLevel(Math.max(level, m.range[0])); setCurrentProblem(generateProblem(level)); setActiveTab('play');}} className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl text-xs font-black shadow-lg hover:bg-indigo-700 transition-all">PRATICAR</button>
                      ) : (
                        <div className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-3xl text-[10px] font-black text-center uppercase tracking-widest border border-slate-200">BLOQUEADO</div>
                      )}
                      {isCurrent && <button onClick={() => startExam(m.id)} className="flex-1 border-2 border-indigo-600 text-indigo-600 py-4 rounded-3xl text-xs font-black hover:bg-indigo-50 transition-all">EXAME</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(activeTab === 'play' || activeTab === 'exam') && (
          <div className="animate-fadeIn max-w-2xl mx-auto py-6">
            <div className="bg-white rounded-[60px] shadow-2xl border-[12px] border-indigo-50 overflow-hidden relative">
              {/* Barra de Progresso do Exame */}
              {activeTab === 'exam' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(exam.currentIndex / 10) * 100}%` }} />
                </div>
              )}
              
              <div className="p-12 text-center">
                <div className="flex justify-center items-center space-x-3 mb-12">
                  <span className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {activeTab === 'exam' ? `EXAME M${exam.moduleId}` : `NÍVEL ${level}`}
                  </span>
                  {activeTab === 'exam' && <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Questão {exam.currentIndex + 1}/10</span>}
                </div>

                <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-16 leading-tight tracking-tighter">
                  {activeTab === 'exam' ? exam.questions[exam.currentIndex].question : currentProblem?.question}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {(activeTab === 'exam' ? exam.questions[exam.currentIndex].options : currentProblem?.options || []).map((opt, i) => (
                    <button 
                      key={i} 
                      disabled={answered} 
                      onClick={() => handleAnswer(opt)} 
                      className={`py-6 rounded-[35px] font-black text-2xl border-2 transition-all active:scale-95 shadow-sm ${
                        answered && opt === (activeTab === 'exam' ? exam.questions[exam.currentIndex].answer : currentProblem?.answer) 
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200' 
                        : 'bg-white border-slate-100 hover:border-indigo-400 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="mt-12 h-6">
                  {feedback && (
                    <div className={`text-xs font-black uppercase tracking-widest animate-bounce ${feedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {feedback.msg}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <button onClick={() => { if(confirm("Abandonar progresso atual?")) setActiveTab('trilha'); setExam(e => ({...e, isActive: false})); }} className="text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-all">Abandonar Missão</button>
            </div>
          </div>
        )}

        {activeTab === 'gameover' && (
          <div className="animate-fadeIn max-w-lg mx-auto py-12 text-center">
            <div className="bg-white p-16 rounded-[60px] shadow-2xl border-b-8 border-rose-500">
              <div className="text-6xl mb-8">💔</div>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-4 uppercase">HP Crítico</h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed">Você gastou toda a sua energia mental. Recupere-se e revise os fundamentos do módulo atual.</p>
              <button onClick={() => { setLives(5); setActiveTab('trilha'); }} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl">RETORNAR AO MAPA</button>
            </div>
          </div>
        )}

        {activeTab === 'sobre' && (
          <div className="animate-fadeIn max-w-4xl mx-auto space-y-10">
            <section className="bg-white p-14 rounded-[60px] shadow-sm border border-slate-100">
              <h2 className="text-5xl font-black mb-8 text-indigo-600 italic tracking-tighter">Sobre o MP.1000</h2>
              <p className="text-slate-600 font-bold text-xl leading-relaxed border-l-4 border-indigo-500 pl-8 italic mb-8">
                "A excelência matemática não é um ato, mas um hábito de padrões lógicos recorrentes."
              </p>
              <p className="text-slate-500 leading-loose">O MathPath 1000 é um sistema de progressão aritmética projetado para desenvolvedores e estudantes que desejam maestria total. Com 1000 níveis de dificuldade crescente, o sistema adapta-se ao seu ritmo através de um motor de problemas dinâmicos.</p>
            </section>
          </div>
        )}
      </main>

      <footer className="p-10 text-center border-t border-slate-100 bg-white">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">PROTOCOLO MATHPATH // v1.0.4-STABLE</p>
      </footer>
    </div>
  );
};

export default App;
