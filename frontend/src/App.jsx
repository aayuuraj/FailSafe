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

  // --- Human-Readable Form Sections ---
  // The 'label' and 'l' are what the user sees. The 'name' and 'v' are what the AI needs.
  const formSections = [
    {
      title: "1. Demographics & School",
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
      title: "2. Family Background",
      fields: [
        { name: "Medu", label: "Mother's Education (0=None, 4=College)", type: "number", min: 0, max: 4 },
        { name: "Fedu", label: "Father's Education (0=None, 4=College)", type: "number", min: 0, max: 4 },
        { name: "Mjob", label: "Mother's Occupation", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health Sector", v: "health"}, {l: "Civil Services", v: "services"}, {l: "Stay at Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "Fjob", label: "Father's Occupation", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health Sector", v: "health"}, {l: "Civil Services", v: "services"}, {l: "Stay at Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "guardian", label: "Primary Guardian", type: "select", options: [{l: "Mother", v: "mother"}, {l: "Father", v: "father"}, {l: "Other", v: "other"}] },
        { name: "famsup", label: "Family Educational Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "3. Academic Environment",
      fields: [
        { name: "reason", label: "Reason for Choosing School", type: "select", options: [{l: "Course Preference", v: "course"}, {l: "Close to Home", v: "home"}, {l: "School Reputation", v: "reputation"}, {l: "Other", v: "other"}] },
        { name: "traveltime", label: "Commute Time (1=Short, 4=Long)", type: "number", min: 1, max: 4 },
        { name: "studytime", label: "Weekly Study Time (1=Low, 4=High)", type: "number", min: 1, max: 4 },
        { name: "schoolsup", label: "Extra School Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "nursery", label: "Attended Nursery School", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "higher", label: "Plans for Higher Education", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "4. Social & Lifestyle",
      fields: [
        { name: "internet", label: "Home Internet Access", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "romantic", label: "In a Romantic Relationship", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "famrel", label: "Family Relationship Quality (1-5)", type: "number", min: 1, max: 5 },
        { name: "freetime", label: "Amount of Free Time (1-5)", type: "number", min: 1, max: 5 },
        { name: "goout", label: "Frequency of Going Out (1-5)", type: "number", min: 1, max: 5 },
        { name: "Dalc", label: "Workday Alcohol Intake (1-5)", type: "number", min: 1, max: 5 },
        { name: "Walc", label: "Weekend Alcohol Intake (1-5)", type: "number", min: 1, max: 5 }
      ]
    },
    {
      title: "5. Health & Performance",
      fields: [
        { name: "health", label: "Current Health Status (1-5)", type: "number", min: 1, max: 5 },
        { name: "absences", label: "Total Absences (0-93)", type: "number", min: 0, max: 93 },
        { name: "failures", label: "History of Past Failures (0-4)", type: "number", min: 0, max: 4 },
        { name: "G1", label: "First Period Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "G2", label: "Second Period Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "paid", label: "Attends Extra Paid Classes", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "activities", label: "Extracurricular Activities", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
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

  const validateForm = () => {
    if (formData.age < 15 || formData.age > 22) return "Age must be between 15 and 22.";
    if (formData.absences < 0 || formData.absences > 93) return "Absences must be between 0 and 93.";
    if (formData.G1 < 0 || formData.G1 > 20) return "First Period Grade must be between 0 and 20.";
    if (formData.G2 < 0 || formData.G2 > 20) return "Second Period Grade must be between 0 and 20.";
    if (formData.failures < 0 || formData.failures > 4) return "Past Failures must be between 0 and 4.";
    return null;
  };

  const analyzeStudent = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

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
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1a365d', margin: '0 0 10px 0' }}>FAILSAFE Dashboard 🚨</h1>
          <p style={{ color: '#4a5568', fontSize: '1.1rem', margin: '0' }}>Proactive Early Intervention System for Educators.</p>
        </div>

        {/* Added alignItems: 'flex-start' here to prevent the overlap and stretching */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Form Panel */}
          <div style={{ flex: '1 1 60%', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <form onSubmit={analyzeStudent}>
              {formSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#2b6cb0', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>{section.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {section.fields.map((field) => (
                      <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>{field.label}</label>
                        {field.type === 'select' ? (
                          <select name={field.name} value={formData[field.name]} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc' }}>
                            {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                          </select>
                        ) : (
                          <input type="number" name={field.name} min={field.min} max={field.max} value={formData[field.name]} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#1a365d', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px' }}>
                {loading ? 'Running ML Analysis...' : 'Run Risk Analysis'}
              </button>
            </form>
          </div>

          {/* Right Results Panel */}
          <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
            <div style={{ position: 'sticky', top: '40px', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginTop: '0' }}>Analysis Results</h2>
              
              {error && <div style={{ color: '#c53030', backgroundColor: '#fff5f5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f56565' }}>{error}</div>}
              
              {result && (
                <div>
                  {/* Fixed spacing inside this box so it doesn't look squished */}
                  <div style={{ textAlign: 'center', padding: '25px 20px', borderRadius: '8px', backgroundColor: result.is_at_risk ? '#fff5f5' : '#f0fff4', border: `2px solid ${result.is_at_risk ? '#fc8181' : '#68d391'}` }}>
                    <h1 style={{ color: result.is_at_risk ? '#e53e3e' : '#38a169', margin: '0 0 10px 0', fontSize: '2rem' }}>
                      {result.is_at_risk ? '⚠️ HIGH RISK' : '✅ ON TRACK'}
                    </h1>
                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#4a5568', margin: '0' }}>
                      Failure Probability: {(result.risk_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <h3 style={{ marginTop: '25px', color: '#2d3748', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>Key Predictive Drivers</h3>
                  <ul style={{ paddingLeft: '20px', color: '#4a5568', lineHeight: '1.6' }}>
                    {result.top_risk_factors.map((factor, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{formatInsight(factor)}</li>
                    ))}
                  </ul>
                  
                  <h3 style={{ marginTop: '25px', color: '#2d3748' }}>Intervention Plan</h3>
                  <div style={{ padding: '15px', backgroundColor: '#ebf8ff', borderLeft: '5px solid #3182ce', color: '#2b6cb0', fontWeight: '500', lineHeight: '1.5' }}>
                    {formatInsight(result.recommended_intervention)}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;