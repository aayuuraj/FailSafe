import { useState } from 'react';
import axios from 'axios';

// --- UI Translator Dictionary ---
const featureDictionary = {
  "G1": "first period grade",
  "G2": "second period grade",
  "absences": "attendance record (absences)",
  "failures": "history of past class failures",
  "Medu": "mother's education level",
  "Fedu": "father's education level",
  "Mjob": "mother's occupation",
  "Fjob": "father's occupation",
  "studytime": "weekly study time",
  "traveltime": "commute time",
  "freetime": "available free time",
  "goout": "frequency of socializing",
  "health": "current health status",
  "famrel": "family relationship quality",
  "schoolsup": "school educational support",
  "famsup": "family educational support",
  "paid": "extra paid tutoring",
  "activities": "extracurricular activities",
  "nursery": "nursery school attendance",
  "higher": "desire for higher education",
  "internet": "home internet access",
  "romantic": "romantic relationship status",
  "reason": "reason for choosing school",
  "guardian": "primary guardian",
  "address": "home address type (urban/rural)",
  "famsize": "family size",
  "Pstatus": "parent cohabitation status",
  "age": "age",
  "sex": "sex",
  "school": "school attended"
};

const formatInsight = (sentence) => {
  let cleanSentence = sentence;
  Object.keys(featureDictionary).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, "g");
    cleanSentence = cleanSentence.replace(regex, featureDictionary[key]);
  });
  return cleanSentence;
};

function App() {
  const [formData, setFormData] = useState({
    school: "GP", sex: "F", age: 18, address: "U", famsize: "GT3", Pstatus: "T",
    Medu: 4, Fedu: 4, Mjob: "at_home", Fjob: "teacher", reason: "course", guardian: "mother",
    traveltime: 2, studytime: 2, failures: 2, schoolsup: "yes", famsup: "no", paid: "no",
    activities: "no", nursery: "yes", higher: "yes", internet: "no", romantic: "no",
    famrel: 4, freetime: 3, goout: 4, Dalc: 1, Walc: 1, health: 3, absences: 0, G1: 7, G2: 10
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formSections = [
    {
      title: "Demographics & School",
      icon: "🏫",
      fields: [
        { name: "school", label: "School Attended", type: "select", options: [{l: "Gabriel Pereira", v: "GP"}, {l: "Mousinho da Silveira", v: "MS"}] },
        { name: "sex", label: "Student's Sex", type: "select", options: [{l: "Female", v: "F"}, {l: "Male", v: "M"}] },
        { name: "age", label: "Student's Age", type: "number", min: 15, max: 22 },
        { name: "address", label: "Home Area Type", type: "select", options: [{l: "Urban", v: "U"}, {l: "Rural", v: "R"}] },
        { name: "famsize", label: "Family Size", type: "select", options: [{l: "More than 3 members", v: "GT3"}, {l: "3 or fewer members", v: "LE3"}] },
        { name: "Pstatus", label: "Parents' Cohabitation", type: "select", options: [{l: "Living Together", v: "T"}, {l: "Living Apart", v: "A"}] }
      ]
    },
    {
      title: "Family Background",
      icon: "👨‍👩‍👧‍👦",
      fields: [
        { name: "Medu", label: "Mother's Education (0=None, 4=College)", type: "number", min: 0, max: 4 },
        { name: "Fedu", label: "Father's Education (0=None, 4=College)", type: "number", min: 0, max: 4 },
        { name: "Mjob", label: "Mother's Occupation", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health Sector", v: "health"}, {l: "Civil Services", v: "services"}, {l: "Stay at Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "Fjob", label: "Father's Occupation", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health Sector", v: "health"}, {l: "Civil Services", v: "services"}, {l: "Stay at Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "guardian", label: "Primary Guardian", type: "select", options: [{l: "Mother", v: "mother"}, {l: "Father", v: "father"}, {l: "Other", v: "other"}] },
        { name: "famsup", label: "Family Ed Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "Academic Environment",
      icon: "📚",
      fields: [
        { name: "reason", label: "Reason for Choosing School", type: "select", options: [{l: "Course Preference", v: "course"}, {l: "Close to Home", v: "home"}, {l: "School Reputation", v: "reputation"}, {l: "Other", v: "other"}] },
        { name: "traveltime", label: "Commute Time (1=Short, 4=Long)", type: "number", min: 1, max: 4 },
        { name: "studytime", label: "Weekly Study (1=Low, 4=High)", type: "number", min: 1, max: 4 },
        { name: "schoolsup", label: "Extra School Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "nursery", label: "Attended Nursery School", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "higher", label: "Plans for Higher Ed", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "Social & Lifestyle",
      icon: "🌍",
      fields: [
        { name: "internet", label: "Home Internet Access", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "romantic", label: "In a Relationship", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "famrel", label: "Family Relation Quality (1-5)", type: "number", min: 1, max: 5 },
        { name: "freetime", label: "Amount of Free Time (1-5)", type: "number", min: 1, max: 5 },
        { name: "goout", label: "Going Out Frequency (1-5)", type: "number", min: 1, max: 5 },
        { name: "Dalc", label: "Workday Alcohol (1-5)", type: "number", min: 1, max: 5 },
        { name: "Walc", label: "Weekend Alcohol (1-5)", type: "number", min: 1, max: 5 }
      ]
    },
    {
      title: "Health & Performance",
      icon: "📈",
      fields: [
        { name: "health", label: "Current Health Status (1-5)", type: "number", min: 1, max: 5 },
        { name: "absences", label: "Total Absences (0-93)", type: "number", min: 0, max: 93 },
        { name: "failures", label: "Past Class Failures (0-4)", type: "number", min: 0, max: 4 },
        { name: "G1", label: "First Period Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "G2", label: "Second Period Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "paid", label: "Extra Paid Classes", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "activities", label: "Extracurriculars", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    }
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    });
  };

  const analyzeStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post('https://failsafe-gytw.onrender.com/predict', {
        data: formData
      });
      setResult(response.data);
    } catch (err) {
      setError("Analysis failed. Ensure the backend is awake.");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#f4f7fb', minHeight: '100vh', padding: '50px 20px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '3rem', color: '#1e293b', margin: '0 0 10px 0', fontWeight: '800', letterSpacing: '-1px' }}>
            FAILSAFE<span style={{ color: '#3b82f6' }}>.</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.2rem', margin: '0', fontWeight: '500' }}>Proactive Early Intervention ML System for Educators</p>
        </div>

        {/* MAIN LAYOUT CONTAINER - Fixed overlapping with alignItems: flex-start and larger gap */}
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* LEFT PANEL: FORM */}
          <div style={{ flex: '1 1 60%', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', marginRight: '15px' }}>📝</div>
              <h2 style={{ color: '#0f172a', margin: '0', fontSize: '1.5rem' }}>Student Profile Data</h2>
            </div>

            <form onSubmit={analyzeStudent}>
              {formSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '40px' }}>
                  <h3 style={{ color: '#334155', marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {section.icon} {section.title}
                  </h3>
                  
                  {/* Clean Grid Layout for Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {section.fields.map((field) => (
                      <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>{field.label}</label>
                        {field.type === 'select' ? (
                          <select name={field.name} value={formData[field.name]} onChange={handleChange} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', outline: 'none', transition: 'border 0.2s', cursor: 'pointer' }}>
                            {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                          </select>
                        ) : (
                          <input type="number" name={field.name} min={field.min} max={field.max} value={formData[field.name]} onChange={handleChange} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', outline: 'none', transition: 'border 0.2s' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Modern Gradient Button */}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s, opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Analyzing with XGBoost...' : 'Run Risk Analysis 🚀'}
              </button>
            </form>
          </div>

          {/* RIGHT PANEL: AI ANALYSIS (Sticky sidebar) */}
          <div style={{ flex: '1 1 35%', minWidth: '340px', position: 'sticky', top: '40px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', marginRight: '15px' }}>📊</div>
                <h2 style={{ color: '#0f172a', margin: '0', fontSize: '1.5rem' }}>AI Analysis Results</h2>
              </div>
              
              {error && <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #ef4444', marginBottom: '20px', fontWeight: '500' }}>{error}</div>}
              
              {!result && !error && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: '0.5' }}>🔍</div>
                  <p style={{ fontSize: '1.1rem' }}>Submit the profile to generate predictive insights.</p>
                </div>
              )}

              {result && !error && (
                <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                  
                  {/* Risk Badge with Progress Bar */}
                  <div style={{ padding: '25px', borderRadius: '16px', backgroundColor: result.is_at_risk ? '#fef2f2' : '#f0fdf4', border: `2px solid ${result.is_at_risk ? '#fca5a5' : '#86efac'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h1 style={{ color: result.is_at_risk ? '#dc2626' : '#16a34a', margin: '0', fontSize: '1.8rem', fontWeight: '800' }}>
                        {result.is_at_risk ? '⚠️ HIGH RISK' : '✅ ON TRACK'}
                      </h1>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: result.is_at_risk ? '#dc2626' : '#16a34a' }}>
                        {(result.risk_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', backgroundColor: result.is_at_risk ? '#fee2e2' : '#dcfce3', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                      <div style={{ width: `${result.risk_probability * 100}%`, backgroundColor: result.is_at_risk ? '#ef4444' : '#22c55e', height: '100%', borderRadius: '8px' }}></div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '10px 0 0 0', textAlign: 'right' }}>Failure Probability</p>
                  </div>
                  
                  {/* Key Drivers Section */}
                  <div style={{ marginTop: '35px' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      🎯 Predictive Drivers
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.top_risk_factors.map((factor, i) => (
                        <div key={i} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', borderLeft: '4px solid #cbd5e1', color: '#475569', fontSize: '0.95rem' }}>
                          {formatInsight(factor)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Intervention Plan Section */}
                  <div style={{ marginTop: '35px' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      💡 Recommended Action
                    </h3>
                    <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', borderLeft: '4px solid #3b82f6', color: '#1e40af', fontWeight: '600', lineHeight: '1.5', fontSize: '1.05rem', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                      {formatInsight(result.recommended_intervention)}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;