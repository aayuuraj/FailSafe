import { useState } from 'react';
import axios from 'axios';

// --- NEW: The UI Translator Dictionary ---
// This translates the ugly backend variables into professional phrases
const featureDictionary = {
  "G1": "first period grade",
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

// This function intercepts the backend sentence and swaps the words
const formatInsight = (sentence) => {
  let cleanSentence = sentence;
  Object.keys(featureDictionary).forEach(key => {
    // Finds the exact variable name and replaces it with the dictionary phrase
    const regex = new RegExp(`\\b${key}\\b`, "g");
    cleanSentence = cleanSentence.replace(regex, featureDictionary[key]);
  });
  return cleanSentence;
};

function App() {
  const [formData, setFormData] = useState({
    school: "GP", sex: "F", age: 18, address: "U", famsize: "GT3", Pstatus: "A",
    Medu: 4, Fedu: 4, Mjob: "at_home", Fjob: "teacher", reason: "course", guardian: "mother",
    traveltime: 2, studytime: 2, failures: 2, schoolsup: "yes", famsup: "no", paid: "no",
    activities: "no", nursery: "yes", higher: "yes", internet: "no", romantic: "no",
    famrel: 4, freetime: 3, goout: 4, Dalc: 1, Walc: 1, health: 3, absences: 0, G1: 7
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (formData.G1 < 0 || formData.G1 > 20) return "First Period Grade (G1) must be between 0 and 20.";
    if (formData.failures < 0 || formData.failures > 4) return "Past Class Failures must be between 0 and 4.";
    
    const scale1to4 = ['traveltime', 'studytime', 'Medu', 'Fedu'];
    const scale1to5 = ['famrel', 'freetime', 'goout', 'Dalc', 'Walc', 'health'];
    
    for (let field of scale1to4) {
      if (formData[field] < 0 || formData[field] > 4) return `Invalid entry for ${field}. Must be 0-4.`;
    }
    for (let field of scale1to5) {
      if (formData[field] < 1 || formData[field] > 5) return `Invalid entry for ${field}. Must be 1-5.`;
    }
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
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        data: formData
      });
      setResult(response.data);
    } catch (err) {
      setError("Error analyzing data. Is your FastAPI backend running?");
      console.error(err);
    }
    setLoading(false);
  };

  const formSections = [
    {
      title: "Demographics & School",
      fields: [
        { name: "age", label: "Age (15-22)", type: "number", min: 15, max: 22 },
        { name: "sex", label: "Sex", type: "select", options: [{l: "Female", v: "F"}, {l: "Male", v: "M"}] },
        { name: "address", label: "Address Type", type: "select", options: [{l: "Urban", v: "U"}, {l: "Rural", v: "R"}] },
        { name: "school", label: "School", type: "select", options: [{l: "Gabriel Pereira", v: "GP"}, {l: "Mousinho da Silveira", v: "MS"}] },
        { name: "reason", label: "Reason for School", type: "select", options: [{l: "Course Preference", v: "course"}, {l: "Close to Home", v: "home"}, {l: "School Reputation", v: "reputation"}, {l: "Other", v: "other"}] }
      ]
    },
    {
      title: "Academic Performance",
      fields: [
        { name: "G1", label: "First Period Grade (0-20)", type: "number", min: 0, max: 20 },
        { name: "absences", label: "Absences (Total Days)", type: "number", min: 0, max: 93 },
        { name: "failures", label: "Past Class Failures", type: "number", min: 0, max: 4 },
        { name: "studytime", label: "Study Time (1: Low - 4: High)", type: "number", min: 1, max: 4 },
        { name: "schoolsup", label: "Extra Educational Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "higher", label: "Wants Higher Education", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "Family Background",
      fields: [
        { name: "Medu", label: "Mother's Education (0: None - 4: Higher)", type: "number", min: 0, max: 4 },
        { name: "Fedu", label: "Father's Education (0: None - 4: Higher)", type: "number", min: 0, max: 4 },
        { name: "Mjob", label: "Mother's Job", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health Care", v: "health"}, {l: "Civil Services", v: "services"}, {l: "At Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "Fjob", label: "Father's Job", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health Care", v: "health"}, {l: "Civil Services", v: "services"}, {l: "At Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "guardian", label: "Primary Guardian", type: "select", options: [{l: "Mother", v: "mother"}, {l: "Father", v: "father"}, {l: "Other", v: "other"}] },
        { name: "famsup", label: "Family Educational Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "Lifestyle & Social",
      fields: [
        { name: "traveltime", label: "Travel Time (1: <15m - 4: >1hr)", type: "number", min: 1, max: 4 },
        { name: "freetime", label: "Free Time (1: Low - 5: High)", type: "number", min: 1, max: 5 },
        { name: "goout", label: "Going Out (1: Low - 5: High)", type: "number", min: 1, max: 5 },
        { name: "health", label: "Current Health (1: Bad - 5: Good)", type: "number", min: 1, max: 5 },
        { name: "internet", label: "Internet Access at Home", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1a365d', margin: '0 0 10px 0' }}>FAILSAFE Dashboard 🚨</h1>
          <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>Proactive Early Intervention System for Educators</p>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Left Side: The Form */}
          <div style={{ flex: '1 1 60%', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Student Profile Inputs</h2>
            <form onSubmit={analyzeStudent}>
              
              {formSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#2b6cb0', marginBottom: '15px', fontSize: '1.2rem' }}>{section.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    
                    {section.fields.map((field) => (
                      <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select 
                            name={field.name} 
                            value={formData[field.name]} 
                            onChange={handleChange}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc' }}
                          >
                            {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="number" 
                            name={field.name}
                            min={field.min}
                            max={field.max}
                            value={formData[field.name]} 
                            onChange={handleChange}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc' }}
                          />
                        )}
                      </div>
                    ))}

                  </div>
                </div>
              ))}

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 'bold', backgroundColor: '#1a365d', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px', transition: 'background 0.3s' }}
              >
                {loading ? 'Running ML Analysis...' : 'Run Risk Analysis'}
              </button>
            </form>
          </div>

          {/* Right Side: The Results (Sticky) */}
          <div style={{ flex: '1 1 35%' }}>
            <div style={{ position: 'sticky', top: '40px', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Analysis Results</h2>
              
              {error && <div style={{ padding: '15px', backgroundColor: '#fed7d7', color: '#9b2c2c', borderRadius: '8px', fontWeight: 'bold', borderLeft: '4px solid #e53e3e' }}>⚠️ {error}</div>}
              
              {!result && !error && (
                <div style={{ textAlign: 'center', color: '#a0aec0', padding: '40px 0' }}>
                  <p>Submit the student profile to generate an AI assessment.</p>
                </div>
              )}

              {result && !error && (
                <div>
                  <div style={{ textAlign: 'center', padding: '20px', borderRadius: '8px', backgroundColor: result.is_at_risk ? '#fff5f5' : '#f0fff4', border: `2px solid ${result.is_at_risk ? '#fc8181' : '#68d391'}` }}>
                    <h1 style={{ margin: 0, color: result.is_at_risk ? '#e53e3e' : '#38a169', fontSize: '2rem' }}>
                      {result.is_at_risk ? '⚠️ HIGH RISK' : '✅ ON TRACK'}
                    </h1>
                    <p style={{ margin: '10px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      Failure Probability: {(result.risk_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  {/* --- UPGRADED HEADINGS AND FORMATTED FACTORS --- */}
                  <h3 style={{ marginTop: '30px', color: '#2d3748', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>
                    Key Predictive Drivers
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#718096' }}>The primary factors influencing this student's assessment:</p>
                  <ul style={{ paddingLeft: '20px', color: '#4a5568', lineHeight: '1.6' }}>
                    {result.top_risk_factors.map((factor, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        {formatInsight(factor)} {/* Using the translator here! */}
                      </li>
                    ))}
                  </ul>

                  <h3 style={{ marginTop: '30px', color: '#2d3748' }}>Recommended Intervention</h3>
                  <div style={{ padding: '20px', backgroundColor: '#ebf8ff', borderLeft: '5px solid #3182ce', borderRadius: '4px', color: '#2b6cb0', fontWeight: '500', fontSize: '1.1rem' }}>
                    {/* Format the intervention text too, just in case! */}
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