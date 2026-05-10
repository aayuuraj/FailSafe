import { useState } from 'react';
import axios from 'axios';

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
      title: "1. Demographics & School",
      fields: [
        { name: "school", label: "School", type: "select", options: [{l: "Gabriel Pereira", v: "GP"}, {l: "Mousinho da Silveira", v: "MS"}] },
        { name: "sex", label: "Sex", type: "select", options: [{l: "Female", v: "F"}, {l: "Male", v: "M"}] },
        { name: "age", label: "Age", type: "number", min: 15, max: 22 },
        { name: "address", label: "Area", type: "select", options: [{l: "Urban", v: "U"}, {l: "Rural", v: "R"}] },
        { name: "famsize", label: "Family Size", type: "select", options: [{l: "GT 3 Members", v: "GT3"}, {l: "LE 3 Members", v: "LE3"}] },
        { name: "Pstatus", label: "Parent Status", type: "select", options: [{l: "Together", v: "T"}, {l: "Apart", v: "A"}] }
      ]
    },
    {
      title: "2. Family Background",
      fields: [
        { name: "Medu", label: "Mother Edu (0-4)", type: "number", min: 0, max: 4 },
        { name: "Fedu", label: "Father Edu (0-4)", type: "number", min: 0, max: 4 },
        { name: "Mjob", label: "Mother Job", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health", v: "health"}, {l: "Services", v: "services"}, {l: "At Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "Fjob", label: "Father Job", type: "select", options: [{l: "Teacher", v: "teacher"}, {l: "Health", v: "health"}, {l: "Services", v: "services"}, {l: "At Home", v: "at_home"}, {l: "Other", v: "other"}] },
        { name: "guardian", label: "Guardian", type: "select", options: [{l: "Mother", v: "mother"}, {l: "Father", v: "father"}, {l: "Other", v: "other"}] },
        { name: "famsup", label: "Family Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "3. Academic Environment",
      fields: [
        { name: "reason", label: "Enrollment Reason", type: "select", options: [{l: "Course", v: "course"}, {l: "Home", v: "home"}, {l: "Reputation", v: "reputation"}, {l: "Other", v: "other"}] },
        { name: "traveltime", label: "Travel Time (1-4)", type: "number", min: 1, max: 4 },
        { name: "studytime", label: "Study Time (1-4)", type: "number", min: 1, max: 4 },
        { name: "schoolsup", label: "School Support", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "nursery", label: "Attended Nursery", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "higher", label: "Wants Higher Ed", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] }
      ]
    },
    {
      title: "4. Social & Lifestyle",
      fields: [
        { name: "internet", label: "Internet Access", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "romantic", label: "In Relationship", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
        { name: "famrel", label: "Family Relation (1-5)", type: "number", min: 1, max: 5 },
        { name: "freetime", label: "Free Time (1-5)", type: "number", min: 1, max: 5 },
        { name: "goout", label: "Going Out (1-5)", type: "number", min: 1, max: 5 },
        { name: "Dalc", label: "Workday Alc (1-5)", type: "number", min: 1, max: 5 },
        { name: "Walc", label: "Weekend Alc (1-5)", type: "number", min: 1, max: 5 }
      ]
    },
    {
      title: "5. Health & Performance",
      fields: [
        { name: "health", label: "Health (1-5)", type: "number", min: 1, max: 5 },
        { name: "absences", label: "Absences (0-93)", type: "number", min: 0, max: 93 },
        { name: "failures", label: "Past Failures", type: "number", min: 0, max: 4 },
        { name: "G1", label: "Period 1 (0-20)", type: "number", min: 0, max: 20 },
        { name: "G2", label: "Period 2 (0-20)", type: "number", min: 0, max: 20 },
        { name: "paid", label: "Paid Classes", type: "select", options: [{l: "Yes", v: "yes"}, {l: "No", v: "no"}] },
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

  const validateForm = () => {
    if (formData.age < 15 || formData.age > 22) return "Age must be between 15 and 22.";
    if (formData.absences < 0 || formData.absences > 93) return "Absences must be between 0 and 93.";
    if (formData.G1 < 0 || formData.G1 > 20) return "Period 1 Grade (G1) must be between 0 and 20.";
    if (formData.G2 < 0 || formData.G2 > 20) return "Period 2 Grade (G2) must be between 0 and 20.";
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
          <h1 style={{ fontSize: '2.5rem', color: '#1a365d', margin: '0' }}>FAILSAFE Dashboard 🚨</h1>
          <p style={{ color: '#4a5568' }}>Full-Spectrum Early Intervention System</p>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 60%', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <form onSubmit={analyzeStudent}>
              {formSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#2b6cb0', marginBottom: '15px' }}>{section.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {section.fields.map((field) => (
                      <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>{field.label}</label>
                        {field.type === 'select' ? (
                          <select name={field.name} value={formData[field.name]} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
                            {field.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                          </select>
                        ) : (
                          <input type="number" name={field.name} min={field.min} max={field.max} value={formData[field.name]} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: '#1a365d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {loading ? 'Analyzing...' : 'Run Risk Analysis'}
              </button>
            </form>
          </div>

          <div style={{ flex: '1 1 35%' }}>
            <div style={{ position: 'sticky', top: '40px', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Analysis Results</h2>
              {error && <div style={{ color: 'red' }}>{error}</div>}
              {result && (
                <div>
                  <div style={{ textAlign: 'center', padding: '20px', borderRadius: '8px', backgroundColor: result.is_at_risk ? '#fff5f5' : '#f0fff4', border: `2px solid ${result.is_at_risk ? '#fc8181' : '#68d391'}` }}>
                    <h1 style={{ color: result.is_at_risk ? '#e53e3e' : '#38a169', margin: '0' }}>{result.is_at_risk ? '⚠️ HIGH RISK' : '✅ ON TRACK'}</h1>
                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Probability: {(result.risk_probability * 100).toFixed(1)}%</p>
                  </div>
                  <h3 style={{ marginTop: '20px', color: '#2d3748' }}>Key Predictive Drivers</h3>
                  <ul style={{ paddingLeft: '20px', color: '#4a5568', lineHeight: '1.6' }}>
                    {result.top_risk_factors.map((factor, i) => (
                      <li key={i}>{formatInsight(factor)}</li>
                    ))}
                  </ul>
                  <h3 style={{ marginTop: '20px', color: '#2d3748' }}>Intervention Plan</h3>
                  <div style={{ padding: '15px', backgroundColor: '#ebf8ff', borderLeft: '5px solid #3182ce', color: '#2b6cb0', fontWeight: '500' }}>
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