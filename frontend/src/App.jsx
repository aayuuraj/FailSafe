import { useState, useEffect } from 'react';
import axios from 'axios';

const featureDictionary = {
  "G1": "first period grade", "G2": "second period grade", "absences": "attendance record (absences)",
  "failures": "history of past class failures", "Medu": "mother's education level", "Fedu": "father's education level",
  "Mjob": "mother's occupation", "Fjob": "father's occupation", "studytime": "weekly study time",
  "traveltime": "commute time", "freetime": "available free time", "goout": "frequency of socializing",
  "health": "current health status", "famrel": "family relationship quality", "schoolsup": "school educational support",
  "famsup": "family educational support", "paid": "extra paid tutoring", "activities": "extracurricular activities",
  "nursery": "nursery school attendance", "higher": "desire for higher education", "internet": "home internet access",
  "romantic": "romantic relationship status", "reason": "reason for choosing school", "guardian": "primary guardian",
  "address": "home address type (urban/rural)", "famsize": "family size", "Pstatus": "parent cohabitation status",
  "age": "age", "sex": "sex", "school": "school attended"
};

const formatInsight = (sentence) => {
  let cleanSentence = sentence;
  Object.keys(featureDictionary).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, "g");
    cleanSentence = cleanSentence.replace(regex, featureDictionary[key]);
  });
  return cleanSentence;
};

// --- MAIN APP COMPONENT ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Faculty');

  const handleLogin = (newToken, name) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', name);
    setToken(newToken);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken(null);
    setUserName('');
  };

  if (!token) return <AuthScreen onLogin={handleLogin} />;
  return <DashboardScreen token={token} onLogout={handleLogout} userName={userName} />;
}

// --- AUTHENTICATION SCREEN ---
// --- AUTHENTICATION SCREEN ---
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        // Ensure you are using localhost, not 127.0.0.1 for Mac CORS safety
        const response = await axios.post('http://localhost:8000/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        onLogin(response.data.access_token, response.data.user_name);
      } else {
        await axios.post('http://localhost:8000/register', { email, password, full_name: fullName });
        setIsLogin(true);
        alert("Registration successful! Please log in.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred connecting to the server.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      
      <div style={{ backgroundColor: 'white', padding: '50px 40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 5px 0', letterSpacing: '-1px' }}>FAILSAFE<span style={{color: '#3b82f6'}}>.</span></h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px', fontWeight: '500' }}>{isLogin ? 'Faculty Portal Login' : 'Register New Account'}</p>
        
        {/* Error Message Box */}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Only show Full Name if they are registering */}
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc' }}
            />
          )}

          <input 
            type="email" 
            placeholder="University Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc' }}
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc' }}
          />
          
          <button 
            type="submit"
            disabled={loading}
            style={{ marginTop: '10px', padding: '16px', backgroundColor: loading ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Secure Login 🔒' : 'Create Account 🚀')}
          </button>

        </form>

        <p style={{ marginTop: '30px', color: '#64748b', fontSize: '0.95rem' }}>
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>

      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '50px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="ai-gradient-text" style={{ fontSize: '3rem', margin: '0 0 5px 0', fontWeight: '900', letterSpacing: '-1.5px' }}>FAILSAFE.</h1>
          <p style={{ color: '#64748b', fontWeight: '500' }}>{isLogin ? 'Faculty Portal Login' : 'Register New Faculty Account'}</p>
        </div>
        {error && <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && <input className="ai-input" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />}
          <input className="ai-input" type="email" placeholder="University Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="ai-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="ai-button">{loading ? 'Authenticating...' : (isLogin ? 'Secure Login 🔒' : 'Create Account 🚀')}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>
            {isLogin ? "Need an account? Register here" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD SCREEN (Protected) ---
function DashboardScreen({ token, onLogout, userName }) {
  // Batch State
  const [file, setFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  
  // History State
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Single Student State
  const [formData, setFormData] = useState({
    school: "GP", sex: "F", age: 18, address: "U", famsize: "GT3", Pstatus: "T",
    Medu: 4, Fedu: 4, Mjob: "at_home", Fjob: "teacher", reason: "course", guardian: "mother",
    traveltime: 2, studytime: 2, failures: 2, schoolsup: "yes", famsup: "no", paid: "no",
    activities: "no", nursery: "yes", higher: "yes", internet: "no", romantic: "no",
    famrel: 4, freetime: 3, goout: 4, Dalc: 1, Walc: 1, health: 3, absences: 0, G1: 7, G2: 10
  });
  const [singleResult, setSingleResult] = useState(null);
  const [loadingSingle, setLoadingSingle] = useState(false);

  const formSections = [
    {
      title: "Demographics & School", icon: "🏫",
      fields: [
        { name: "school", label: "School Attended", type: "select", options: [{l: "Gabriel Pereira", v: "GP"}, {l: "Mousinho da Silveira", v: "MS"}] },
        { name: "sex", label: "Student's Sex", type: "select", options: [{l: "Female", v: "F"}, {l: "Male", v: "M"}] },
        { name: "age", label: "Student's Age", type: "number", min: 15, max: 22 },
        { name: "address", label: "Home Area", type: "select", options: [{l: "Urban", v: "U"}, {l: "Rural", v: "R"}] },
        { name: "famsize", label: "Family Size", type: "select", options: [{l: "> 3 members", v: "GT3"}, {l: "≤ 3 members", v: "LE3"}] },
        { name: "Pstatus", label: "Parents' Cohabitation", type: "select", options: [{l: "Together", v: "T"}, {l: "Apart", v: "A"}] }
      ]
    },
    {
      title: "Family Background", icon: "👨‍👩‍👧‍👦",
      fields: [
        { name: "Medu", label: "Mother's Edu (0-4)", type: "number", min: 0, max: 4 },
        { name: "Fedu", label: "Father's Edu (0-4)", type: "number", min: 0, max: 4 },
        { name: "Mjob", label: "Mother's Job", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health", v: "health"}, {l: "Services", v: "services"}, {l: "At Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "Fjob", label: "Father's Job", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health", v: "health"}, {l: "Services", v: "services"}, {l: "At Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "guardian", label: "Primary Guardian", type: "select", options: [{l: "Mother", v: "mother"}, {l: "Father", v: "father"}, {l: "Other", v: "other"}] },
        { name: "famsup", label: "Family Ed Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "Academic Environment", icon: "📚",
      fields: [
        { name: "reason", label: "School Choice Reason", type: "select", options: [{l: "Course Pref", v: "course"}, {l: "Close to Home", v: "home"}, {l: "Reputation", v: "reputation"}, {l: "Other", v: "other"}] },
        { name: "traveltime", label: "Commute (1-4)", type: "number", min: 1, max: 4 },
        { name: "studytime", label: "Weekly Study (1-4)", type: "number", min: 1, max: 4 },
        { name: "schoolsup", label: "Extra School Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "nursery", label: "Attended Nursery", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "higher", label: "Plans for Higher Ed", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "Social & Lifestyle", icon: "🌍",
      fields: [
        { name: "internet", label: "Home Internet", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "romantic", label: "In a Relationship", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "famrel", label: "Family Relation (1-5)", type: "number", min: 1, max: 5 },
        { name: "freetime", label: "Free Time (1-5)", type: "number", min: 1, max: 5 },
        { name: "goout", label: "Going Out (1-5)", type: "number", min: 1, max: 5 },
        { name: "Dalc", label: "Workday Alcohol (1-5)", type: "number", min: 1, max: 5 },
        { name: "Walc", label: "Weekend Alcohol (1-5)", type: "number", min: 1, max: 5 }
      ]
    },
    {
      title: "Health & Performance", icon: "📈",
      fields: [
        { name: "health", label: "Health Status (1-5)", type: "number", min: 1, max: 5 },
        { name: "absences", label: "Total Absences", type: "number", min: 0, max: 93 },
        { name: "failures", label: "Past Failures (0-4)", type: "number", min: 0, max: 4 },
        { name: "G1", label: "Period 1 Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "G2", label: "Period 2 Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "paid", label: "Extra Paid Classes", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "activities", label: "Extracurriculars", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    }
  ];

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/students', { headers: { 'Authorization': `Bearer ${token}` }});
      setHistory(res.data);
    } catch(e) { console.error("Failed to fetch history"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file first.");
    setLoadingBatch(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await axios.post('http://127.0.0.1:8000/upload-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setBatchResults(response.data);
      fetchHistory(); // Refresh table after upload
    } catch (err) { alert("Batch upload failed."); }
    setLoadingBatch(false);
  };

  const handleSingleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value });
  };

  const analyzeSingleStudent = async (e) => {
    e.preventDefault();
    setLoadingSingle(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', { data: formData }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSingleResult(response.data);
      fetchHistory(); // Refresh table after prediction
    } catch (err) { alert("Analysis failed."); }
    setLoadingSingle(false);
  };
  // 1. Filter the history based on the search bar
const filteredHistory = history.filter(student => 
  student.student_id_string.toLowerCase().includes(searchTerm.toLowerCase())
);

// 2. Decide how many to show (All of them, or just the first 3)
const displayedHistory = isExpanded ? filteredHistory : filteredHistory.slice(0, 3);
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px 30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>FAILSAFE<span style={{ color: '#3b82f6' }}>.</span></h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 600, color: '#475569' }}>Welcome, {userName}</span>
          <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#ef4444' }}>Log Out</button>
        </div>
      </div>

      {/* Batch Upload Section */}
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.4rem', color: '#0f172a' }}>📁 Batch Student Processing (CSV)</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Upload a class roster to run inference on multiple students at once. Data is automatically saved to the PostgreSQL database.</p>
        <form onSubmit={handleFileUpload} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ padding: '10px', border: '2px dashed #cbd5e1', borderRadius: '8px', flex: 1 }} />
          <button type="submit" disabled={loadingBatch} style={{ padding: '14px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
            {loadingBatch ? 'Processing Batch...' : 'Run Batch Analysis'}
          </button>
        </form>
        {batchResults && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', color: '#166534' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>{batchResults.message}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Successfully analyzed and secured to database.</p>
          </div>
        )}
      </div>

      {/* Single Student & Analysis Split View */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '40px' }}>
        
        {/* Left: Input Form */}
        <div style={{ flex: '1 1 60%', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.4rem', color: '#0f172a', marginBottom: '20px' }}>👤 Individual Student Assessment</h3>
          <form onSubmit={analyzeSingleStudent}>
            {formSections.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '35px' }}>
                <h4 style={{ color: '#475569', marginBottom: '15px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{section.icon} {section.title}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {section.fields.map((field) => (
                    <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>{field.label}</label>
                      {field.type === 'select' ? (
                        <select className="ai-input" name={field.name} value={formData[field.name]} onChange={handleSingleChange}>
                          {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                        </select>
                      ) : (
                        <input className="ai-input" type="number" name={field.name} min={field.min} max={field.max} value={formData[field.name]} onChange={handleSingleChange} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loadingSingle} className="ai-button" style={{ width: '100%' }}>
              {loadingSingle ? 'Processing...' : 'Run Prediction Model 🚀'}
            </button>
          </form>
        </div>

        {/* Right: Analysis Output */}
        <div style={{ flex: '1 1 35%', minWidth: '340px', position: 'sticky', top: '40px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.4rem', color: '#0f172a', marginBottom: '20px' }}>🧠 Analysis Output</h3>
            {!singleResult ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0' }}>Awaiting parameters...</div>
            ) : (
              <div>
                <div style={{ padding: '25px', borderRadius: '16px', backgroundColor: singleResult.is_at_risk ? '#fef2f2' : '#f0fdf4', border: `1px solid ${singleResult.is_at_risk ? '#fca5a5' : '#bbf7d0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h1 style={{ color: singleResult.is_at_risk ? '#dc2626' : '#16a34a', margin: '0', fontSize: '1.5rem', fontWeight: '800' }}>
                      {singleResult.is_at_risk ? '⚠️ High Risk' : '✅ On Track'}
                    </h1>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: singleResult.is_at_risk ? '#dc2626' : '#16a34a' }}>
                      {(singleResult.risk_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* THE PROGRESS BAR IS BACK */}
                  <div style={{ width: '100%', backgroundColor: singleResult.is_at_risk ? '#fee2e2' : '#dcfce3', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${singleResult.risk_probability * 100}%`, backgroundColor: singleResult.is_at_risk ? '#ef4444' : '#22c55e', height: '100%', borderRadius: '8px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>Top SHAP Value Drivers</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {singleResult.top_risk_factors.map((factor, i) => (
                      <div key={i} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>{formatInsight(factor)}</div>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '10px' }}>Recommended Protocol</h4>
                  <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontWeight: '600', fontSize: '0.95rem' }}>
                    {formatInsight(singleResult.recommended_intervention)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Section */}
     <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
  
  {/* --- UPDATED HEADER WITH NEW BUTTONS --- */}
 <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
  
  {/* --- HEADER WITH SEARCH AND BUTTONS --- */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>📊 Risk Tracking & Interventions</h3>
    
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyItems: 'flex-end', justifyContent: 'flex-end' }}>
      
      {/* NEW SEARCH BAR */}
      <input 
        type="text" 
        placeholder="Search Student ID..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '200px', backgroundColor: '#f8fafc' }}
      />

      {/* Button Group */}
      <button 
        onClick={async () => {
          if (window.confirm("Delete ONLY the students you uploaded?")) {
            try {
              await axios.delete('http://localhost:8000/students/clear?scope=personal', { headers: { 'Authorization': `Bearer ${token}` } });
              fetchHistory(); 
              alert("Your personal records were deleted!");
            } catch(e) { console.error(e); }
          }
        }}
        style={{ padding: '10px 20px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
      >
        Clear My Data 🧹
      </button>

      <button 
        onClick={async () => {
          if (window.confirm("WARNING: HOD OVERRIDE. Delete ALL university students?")) {
            try {
              await axios.delete('http://localhost:8000/students/clear?scope=all', { headers: { 'Authorization': `Bearer ${token}` } });
              fetchHistory(); 
              alert("Global database wiped.");
            } catch(e) { alert("Access Denied. Only HODs can clear the global database."); }
          }
        }}
        style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
      >
        Clear Database for all ☢️
      </button>

      <button 
        onClick={fetchHistory}
        style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
      >
        Refresh 🔄
      </button>
    </div>
  </div>

  {/* --- THE TABLE --- */}
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
          <th style={{ padding: '15px' }}>Student ID</th>
          <th style={{ padding: '15px' }}>Risk Assessment</th>
          <th style={{ padding: '15px' }}>Top Predictive Factor</th>
          <th style={{ padding: '15px' }}>Generated Intervention Plan</th>
        </tr>
      </thead>
      <tbody>
        {/* WE USE displayedHistory HERE NOW */}
        {displayedHistory.length > 0 ? displayedHistory.map((student, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '15px', fontWeight: 600 }}>{student.student_id_string}</td>
            <td style={{ padding: '15px' }}>
              <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: student.is_at_risk ? '#fef2f2' : '#f0fdf4', color: student.is_at_risk ? '#dc2626' : '#16a34a' }}>
                {student.is_at_risk ? 'HIGH RISK' : 'OPTIMAL'} ({(student.risk_probability * 100).toFixed(1)}%)
              </span>
            </td>
            <td style={{ padding: '15px', fontSize: '0.9rem', color: '#475569' }}>
              {student.top_factors && student.top_factors[0] ? formatInsight(student.top_factors[0].replace("Student's ", "")) : "N/A"}
            </td>
            <td style={{ padding: '15px', fontSize: '0.9rem', color: '#1e40af', fontWeight: 500 }}>
              {formatInsight(student.intervention_plan)}
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No records match your search, or database is empty.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* --- NEW EXPAND/COLLAPSE BUTTON --- */}
  {filteredHistory.length > 3 && (
    <div style={{ textAlign: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }}
        onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
        onMouseOut={(e) => e.target.style.color = '#3b82f6'}
      >
        {isExpanded ? 'Collapse List ⬆️' : `View All ${filteredHistory.length} Students ⬇️`}
      </button>
    </div>
  )}

</div>
  {/* --- END OF UPDATED HEADER --- */}

  {/* Your existing table code stays exactly the same below here */}
 
</div>

      {/* STYLES */}
      <style>{`
        .ai-gradient-text { background: linear-gradient(135deg, #1e3a8a 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ai-input { padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; background-color: #f8fafc; color: #334155; font-family: inherit; font-size: 0.95rem; outline: none; transition: all 0.2s ease-in-out; }
        .ai-input:hover { border-color: #cbd5e1; }
        .ai-input:focus { border-color: #3b82f6; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .ai-button { padding: 16px; background: linear-gradient(to right, #2563eb, #4f46e5); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1.1rem; font-weight: 700; transition: transform 0.2s, box-shadow 0.2s; }
        .ai-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(79, 70, 229, 0.6); }
        .ai-button:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default App;