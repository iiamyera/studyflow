// ─── Firebase SDK Imports ─────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// ─── React Imports ────────────────────────────────────────────────────────────
import { useState, useEffect, createContext, useContext } from "react";

// ─── Firebase Initialization ──────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDM_QKyhtgtBsiUwxtXGel_xDr92BF6MbE",
  authDomain: "studyflow-17013.firebaseapp.com",
  projectId: "studyflow-17013",
  storageBucket: "studyflow-17013.firebasestorage.app",
  messagingSenderId: "195580835624",
  appId: "1:195580835624:web:28563cc528a382f033c21d",
  measurementId: "G-QRNPES3G2S",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─── Firebase Auth Layer ──────────────────────────────────────────────────────
const firebaseAuth = {
  signup: async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return { uid: cred.user.uid, name, email };
  },
  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: cred.user.uid,
      name: cred.user.displayName || cred.user.email.split("@")[0],
      email: cred.user.email,
    };
  },
  logout: () => signOut(auth),
};

// ─── Firebase DB Layer ────────────────────────────────────────────────────────
const firebaseDB = {
  // Real-time listener — returns unsubscribe fn
  subscribeTasks: (uid, callback) => {
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    return onSnapshot(q, (snap) => {
      const tasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() ?? Date.now(),
      }));
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
      callback(tasks);
    });
  },
  addTask: (uid, title) =>
    addDoc(collection(db, "tasks"), {
      userId: uid,
      title,
      completed: false,
      createdAt: serverTimestamp(),
    }),
  updateTask: (taskId, updates) => updateDoc(doc(db, "tasks", taskId), updates),
  deleteTask: (taskId) => deleteDoc(doc(db, "tasks", taskId)),
};

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const SpinnerIcon = () => (
  <span style={{
    display: "inline-block", width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  }} />
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("study-styles")) return;
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --accent: #6C63FF; --accent-light: #E8E6FF; --accent-dark: #5548e0;
      --radius: 14px; --radius-sm: 8px;
      --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .light { --bg:#F7F6F3; --bg2:#FFFFFF; --bg3:#EEECEA; --text:#1a1a1a; --text2:#6b6b6b; --text3:#9b9b9b; --border:#E2E0DB; --shadow:0 2px 12px rgba(0,0,0,0.07); --shadow-lg:0 8px 32px rgba(0,0,0,0.10); }
    .dark  { --bg:#111111; --bg2:#1C1C1C; --bg3:#242424; --text:#F0EEE8; --text2:#9a9a9a; --text3:#5a5a5a; --border:#2a2a2a; --shadow:0 2px 12px rgba(0,0,0,0.3); --shadow-lg:0 8px 32px rgba(0,0,0,0.4); }
    body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; transition:background var(--transition),color var(--transition); min-height:100vh; }
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    /* Navbar */
    .navbar{position:sticky;top:0;z-index:100;background:var(--bg2);border-bottom:1px solid var(--border);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(12px);box-shadow:var(--shadow);transition:background var(--transition),border-color var(--transition)}
    .navbar-logo{display:flex;align-items:center;gap:10px;font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;color:var(--text);letter-spacing:-0.02em}
    .navbar-logo .logo-icon{color:var(--accent)}
    .navbar-actions{display:flex;align-items:center;gap:10px}
    .nav-greeting{font-size:0.82rem;color:var(--text2);font-weight:400;padding-right:12px;border-right:1px solid var(--border)}
    /* Buttons */
    .btn{display:inline-flex;align-items:center;gap:7px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.875rem;font-weight:500;border-radius:var(--radius-sm);padding:9px 18px;transition:all var(--transition);white-space:nowrap}
    .btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border)}
    .btn-ghost:hover{background:var(--bg3);color:var(--text)}
    .btn-accent{background:var(--accent);color:#fff;font-weight:600;box-shadow:0 2px 8px rgba(108,99,255,0.25)}
    .btn-accent:hover{background:var(--accent-dark);transform:translateY(-1px);box-shadow:0 4px 16px rgba(108,99,255,0.35)}
    .btn-accent:active{transform:translateY(0)}
    .btn-accent:disabled{opacity:0.55;cursor:not-allowed;transform:none}
    .btn-danger{background:transparent;color:var(--text3);padding:6px;border-radius:6px;border:none;cursor:pointer;display:inline-flex;align-items:center;transition:all var(--transition)}
    .btn-danger:hover{background:#fee2e2;color:#dc2626}
    .dark .btn-danger:hover{background:rgba(220,38,38,0.15);color:#f87171}
    .btn-danger:disabled{opacity:0.4;cursor:not-allowed}
    .theme-toggle{width:38px;height:38px;border-radius:var(--radius-sm);background:var(--bg3);border:1px solid var(--border);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--transition)}
    .theme-toggle:hover{background:var(--border);color:var(--text);transform:translateY(-1px)}
    /* Auth */
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg)}
    .auth-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:48px 40px;width:100%;max-width:420px;box-shadow:var(--shadow-lg);animation:slideUp 0.4s cubic-bezier(0.4,0,0.2,1)}
    .auth-header{margin-bottom:32px}
    .auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:24px}
    .auth-title{font-family:'Syne',sans-serif;font-weight:700;font-size:1.6rem;letter-spacing:-0.03em;margin-bottom:6px}
    .auth-sub{color:var(--text2);font-size:0.9rem}
    .auth-tabs{display:flex;background:var(--bg3);border-radius:var(--radius-sm);padding:4px;margin-bottom:28px;gap:4px}
    .auth-tab{flex:1;padding:9px;text-align:center;border-radius:6px;font-size:0.875rem;font-weight:500;cursor:pointer;color:var(--text2);border:none;background:transparent;font-family:'DM Sans',sans-serif;transition:all var(--transition)}
    .auth-tab.active{background:var(--bg2);color:var(--text);box-shadow:var(--shadow)}
    /* Form */
    .form-group{margin-bottom:16px}
    .form-label{display:block;font-size:0.8rem;font-weight:500;color:var(--text2);margin-bottom:6px;letter-spacing:0.03em;text-transform:uppercase}
    .form-input{width:100%;padding:11px 14px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.95rem;transition:border-color var(--transition),box-shadow var(--transition);outline:none}
    .form-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(108,99,255,0.12)}
    .form-input::placeholder{color:var(--text3)}
    .form-error{color:#dc2626;font-size:0.82rem;margin-top:12px;padding:10px 14px;background:rgba(220,38,38,0.08);border-radius:var(--radius-sm);border-left:3px solid #dc2626}
    .dark .form-error{color:#f87171;background:rgba(248,113,113,0.08)}
    /* Dashboard */
    .dashboard{max-width:720px;margin:0 auto;padding:40px 24px}
    .dashboard-header{margin-bottom:36px}
    .dashboard-title{font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;letter-spacing:-0.04em;margin-bottom:6px}
    .dashboard-date{color:var(--text2);font-size:0.88rem}
    /* Progress */
    .progress-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px 28px;margin-bottom:28px;box-shadow:var(--shadow)}
    .progress-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
    .progress-label{font-size:0.8rem;font-weight:600;color:var(--text2);letter-spacing:0.06em;text-transform:uppercase}
    .progress-count{font-family:'Syne',sans-serif;font-weight:700;font-size:1.5rem;letter-spacing:-0.03em}
    .progress-count span{color:var(--text3);font-size:1rem;font-weight:400}
    .progress-bar-track{height:6px;background:var(--bg3);border-radius:99px;overflow:hidden}
    .progress-bar-fill{height:100%;border-radius:99px;transition:width 0.5s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,var(--accent),#a78bfa)}
    /* Task input */
    .task-input-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;margin-bottom:20px;box-shadow:var(--shadow);display:flex;gap:12px;align-items:flex-end}
    .task-input-wrap{flex:1}
    .task-input{width:100%;padding:11px 14px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.95rem;outline:none;transition:border-color var(--transition),box-shadow var(--transition)}
    .task-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(108,99,255,0.1)}
    .task-input::placeholder{color:var(--text3)}
    /* Tasks */
    .tasks-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
    .tasks-header{padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
    .tasks-heading{font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem}
    .tasks-count-badge{background:var(--bg3);color:var(--text2);font-size:0.78rem;font-weight:600;padding:3px 10px;border-radius:99px;border:1px solid var(--border)}
    .task-list{list-style:none}
    .task-item{display:flex;align-items:center;gap:14px;padding:16px 24px;border-bottom:1px solid var(--border);transition:background var(--transition);animation:fadeIn 0.25s ease}
    .task-item:last-child{border-bottom:none}
    .task-item:hover{background:var(--bg3)}
    .task-check{width:22px;height:22px;border-radius:6px;border:2px solid var(--border);background:transparent;cursor:pointer;flex-shrink:0;transition:all var(--transition);appearance:none;-webkit-appearance:none}
    .task-check:checked{background:var(--accent);border-color:var(--accent);background-image:url("data:image/svg+xml,%3Csvg width='12' height='10' viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center}
    .task-check:hover:not(:checked){border-color:var(--accent);background:rgba(108,99,255,0.06)}
    .task-title{flex:1;font-size:0.95rem;color:var(--text);transition:color var(--transition);line-height:1.4}
    .task-title.done{color:var(--text3);text-decoration:line-through;text-decoration-color:var(--text3)}
    .task-meta{font-size:0.78rem;color:var(--text3);margin-top:2px}
    .tasks-empty{padding:52px 24px;text-align:center;color:var(--text3);font-size:0.9rem}
    .tasks-empty-icon{font-size:2rem;margin-bottom:10px;opacity:0.5}
    /* App loading */
    .app-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:var(--bg);color:var(--text2);font-size:0.9rem;font-family:'DM Sans',sans-serif}
    .app-loading-spinner{width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite}
    /* Scrollbar */
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
    @media(max-width:480px){
      .auth-card{padding:32px 24px}
      .dashboard{padding:24px 16px}
      .task-input-card{flex-direction:column}
      .task-input-card .btn{width:100%;justify-content:center}
      .nav-greeting{display:none}
    }
  `;
  const el = document.createElement("style");
  el.id = "study-styles";
  el.textContent = css;
  document.head.appendChild(el);
};

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar({ user, onLogout, onToggleTheme }) {
  const { theme } = useTheme();
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon"><BookIcon /></span>
        <span>StudyFlow</span>
      </div>
      <div className="navbar-actions">
        {user && <span className="nav-greeting">Hi, {user.name.split(" ")[0]} 👋</span>}
        <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        {user && (
          <button className="btn btn-ghost" onClick={onLogout}>
            <LogoutIcon /> <span style={{ fontSize: "0.85rem" }}>Sign out</span>
          </button>
        )}
      </div>
    </nav>
  );
}

function AuthPage({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const friendlyError = (err) => {
    const code = err?.code || "";
    if (code.includes("email-already-in-use"))   return "This email is already registered. Try signing in.";
    if (code.includes("user-not-found") || code.includes("invalid-credential")) return "No account found. Please check your details or sign up.";
    if (code.includes("wrong-password"))          return "Incorrect password. Please try again.";
    if (code.includes("too-many-requests"))       return "Too many attempts. Please wait a moment and try again.";
    if (code.includes("network-request-failed"))  return "Network error. Check your connection and try again.";
    return err.message || "Something went wrong. Please try again.";
  };

  const handle = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (tab === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const user = tab === "login"
        ? await firebaseAuth.login(email, password)
        : await firebaseAuth.signup(email, password, name.trim());
      onAuth(user);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span style={{ color: "var(--accent)" }}><BookIcon /></span>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>StudyFlow</span>
          </div>
          <div className="auth-title">{tab === "login" ? "Welcome back" : "Get started"}</div>
          <div className="auth-sub">{tab === "login" ? "Sign in to your workspace" : "Create your free account"}</div>
        </div>

        <div className="auth-tabs">
          {["login", "signup"].map((t) => (
            <button key={t} className={`auth-tab${tab === t ? " active" : ""}`}
              onClick={() => { setTab(t); setError(""); }}>
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {tab === "signup" && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Smith" value={name}
              onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="jane@university.edu" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="btn btn-accent"
          style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "13px" }}
          onClick={handle} disabled={loading}>
          {loading ? <SpinnerIcon /> : (tab === "login" ? "Sign In" : "Create Account")}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="progress-card">
      <div className="progress-top">
        <span className="progress-label">Progress</span>
        <span className="progress-count">{completed} <span>/ {total} tasks</span></span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {total > 0 && (
        <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--text2)" }}>
          {pct === 100 ? "🎉 All done! Great work." : `${pct}% complete — keep going!`}
        </div>
      )}
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await onAdd(text.trim());
    setText("");
    setLoading(false);
  };
  return (
    <div className="task-input-card">
      <div className="task-input-wrap">
        <input className="task-input" placeholder="Add a new task… e.g. 'Review Chapter 4 notes'"
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />
      </div>
      <button className="btn btn-accent" onClick={submit} disabled={loading || !text.trim()}>
        {loading ? <SpinnerIcon /> : <><PlusIcon /> Add Task</>}
      </button>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const age = Math.floor((Date.now() - task.createdAt) / 60000);
  const ageStr = age < 1 ? "just now" : age < 60 ? `${age}m ago` : age < 1440 ? `${Math.floor(age / 60)}h ago` : `${Math.floor(age / 1440)}d ago`;
  return (
    <li className="task-item">
      <input type="checkbox" className="task-check" checked={task.completed}
        onChange={() => onToggle(task.id, !task.completed)} />
      <div style={{ flex: 1 }}>
        <div className="task-title">{task.title}</div>
        <div className="task-meta">{ageStr}</div>
      </div>
      <button className="btn-danger" disabled={deleting} title="Delete task"
        onClick={async () => { setDeleting(true); await onDelete(task.id); }}>
        <TrashIcon />
      </button>
    </li>
  );
}

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="tasks-card">
        <div className="tasks-empty">
          <div className="tasks-empty-icon">📋</div>
          No tasks yet. Add one above to get started!
        </div>
      </div>
    );
  }
  const active = tasks.filter(t => !t.completed);
  const done   = tasks.filter(t => t.completed);
  return (
    <div className="tasks-card">
      <div className="tasks-header">
        <span className="tasks-heading">Tasks</span>
        <span className="tasks-count-badge">{tasks.length}</span>
      </div>
      <ul className="task-list">
        {active.map(t => <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />)}
        {done.map(t   => <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />)}
      </ul>
    </div>
  );
}

function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Firestore real-time listener
  useEffect(() => {
    const unsub = firebaseDB.subscribeTasks(user.uid, setTasks);
    return unsub; // cleanup on unmount
  }, [user.uid]);

  const addTask    = (title) => firebaseDB.addTask(user.uid, title);
  const toggleTask = (id, completed) => firebaseDB.updateTask(id, { completed });
  const deleteTask = (id) => firebaseDB.deleteTask(id);
  const completed  = tasks.filter(t => t.completed).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">Your Workspace</div>
        <div className="dashboard-date">{today}</div>
      </div>
      <ProgressBar completed={completed} total={tasks.length} />
      <TaskInput onAdd={addTask} />
      <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme]       = useState(() => localStorage.getItem("studyflow-theme") || "light");
  const [user, setUser]         = useState(null);   // null=loading, false=logged out, obj=logged in
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("studyflow-theme", theme);
  }, [theme]);

  // Persist login across page refreshes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser
        ? { uid: firebaseUser.uid, name: firebaseUser.displayName || firebaseUser.email.split("@")[0], email: firebaseUser.email }
        : false
      );
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const toggleTheme  = () => setTheme(t => t === "light" ? "dark" : "light");
  const handleLogout = async () => { await firebaseAuth.logout(); setUser(false); };

  if (!authReady) {
    return (
      <div className={theme}>
        <div className="app-loading">
          <div className="app-loading-spinner" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>
        <Navbar user={user || null} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        {user
          ? <Dashboard user={user} />
          : <AuthPage onAuth={setUser} />
        }
      </div>
    </ThemeContext.Provider>
  );
}</content>
<parameter name="filePath">c:\Users\USER\Downloads\studyflow\src\StudyAssistant.jsx