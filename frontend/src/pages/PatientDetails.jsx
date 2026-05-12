import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Activity, FileText, Pill, CreditCard, ArrowLeft } from 'lucide-react';

export default function PatientDetails({ token }) {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [vitals, setVitals] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Consultation Form State
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [consultForm, setConsultForm] = useState({
    subjective: '', objective: '', assessment: '', plan: ''
  });

  // New Vitals Form State
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '', blood_pressure: '', heart_rate: '', weight: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, [id, token]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const pRes = await fetch(`http://localhost:8000/patients/${id}`, { headers });
      if (pRes.ok) setPatient(await pRes.json());
      
      const vRes = await fetch(`http://localhost:8000/ehr/patients/${id}/vitals`, { headers });
      if (vRes.ok) setVitals(await vRes.json());
      
      const cRes = await fetch(`http://localhost:8000/ehr/patients/${id}/consultations`, { headers });
      if (cRes.ok) setConsultations(await cRes.json());
      
      const iRes = await fetch(`http://localhost:8000/billing/patients/${id}/invoices`, { headers });
      if (iRes.ok) setInvoices(await iRes.json());
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/ehr/consultations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...consultForm, patient_id: parseInt(id), doctor_id: 1 }) // Hardcoded doctor_id for prototype
      });
      if (res.ok) {
        setShowConsultForm(false);
        fetchPatientData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/ehr/vitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...vitalsForm, patient_id: parseInt(id) })
      });
      if (res.ok) {
        setShowVitalsForm(false);
        fetchPatientData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading patient data...</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/patients" style={{ marginRight: '16px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <ArrowLeft size={20} style={{ marginRight: '4px' }}/> Back
        </Link>
        <h2 style={{ margin: 0 }}>{patient.full_name}'s Chart</h2>
      </div>

      <div className="card glass-panel" style={{ marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ padding: '16px', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)' }}>
          <User size={40} />
        </div>
        <div>
          <h3 style={{ margin: 0, marginBottom: '8px' }}>{patient.full_name}</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Phone: {patient.phone_number}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        {['overview', 'vitals', 'consultations', 'billing'].map(tab => (
          <button 
            key={tab}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '12px 24px',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: activeTab === tab ? '600' : '400'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="card glass-panel">
            <h3>Medical History</h3>
            <p>{patient.medical_history || 'No medical history recorded.'}</p>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={() => setShowVitalsForm(true)}>Record Vitals</button>
            </div>
            {showVitalsForm && (
              <div className="card glass-panel" style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSaveVitals} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label>Temperature (°C)</label>
                    <input type="number" step="0.1" value={vitalsForm.temperature} onChange={e => setVitalsForm({...vitalsForm, temperature: parseFloat(e.target.value)})} />
                  </div>
                  <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label>Blood Pressure</label>
                    <input type="text" placeholder="120/80" value={vitalsForm.blood_pressure} onChange={e => setVitalsForm({...vitalsForm, blood_pressure: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label>Heart Rate (BPM)</label>
                    <input type="number" value={vitalsForm.heart_rate} onChange={e => setVitalsForm({...vitalsForm, heart_rate: parseInt(e.target.value)})} />
                  </div>
                  <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label>Weight (kg)</label>
                    <input type="number" step="0.1" value={vitalsForm.weight} onChange={e => setVitalsForm({...vitalsForm, weight: parseFloat(e.target.value)})} />
                  </div>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="secondary" onClick={() => setShowVitalsForm(false)}>Cancel</button>
                    <button type="submit">Save</button>
                  </div>
                </form>
              </div>
            )}
            <div className="card glass-panel" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Temp</th>
                    <th>BP</th>
                    <th>HR</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map(v => (
                    <tr key={v.id}>
                      <td>{new Date(v.recorded_at).toLocaleString()}</td>
                      <td>{v.temperature ? `${v.temperature}°C` : '-'}</td>
                      <td>{v.blood_pressure || '-'}</td>
                      <td>{v.heart_rate ? `${v.heart_rate} bpm` : '-'}</td>
                      <td>{v.weight ? `${v.weight} kg` : '-'}</td>
                    </tr>
                  ))}
                  {vitals.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No vitals recorded</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={() => setShowConsultForm(true)}>New Consultation</button>
            </div>
            {showConsultForm && (
              <div className="card glass-panel" style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSaveConsultation}>
                  <div className="input-group">
                    <label>Subjective (Symptoms)</label>
                    <textarea rows="2" value={consultForm.subjective} onChange={e => setConsultForm({...consultForm, subjective: e.target.value})}></textarea>
                  </div>
                  <div className="input-group">
                    <label>Objective (Observations)</label>
                    <textarea rows="2" value={consultForm.objective} onChange={e => setConsultForm({...consultForm, objective: e.target.value})}></textarea>
                  </div>
                  <div className="input-group">
                    <label>Assessment (Diagnosis)</label>
                    <textarea rows="2" value={consultForm.assessment} onChange={e => setConsultForm({...consultForm, assessment: e.target.value})}></textarea>
                  </div>
                  <div className="input-group">
                    <label>Plan (Treatment)</label>
                    <textarea rows="2" value={consultForm.plan} onChange={e => setConsultForm({...consultForm, plan: e.target.value})}></textarea>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="secondary" onClick={() => setShowConsultForm(false)}>Cancel</button>
                    <button type="submit">Save Consultation</button>
                  </div>
                </form>
              </div>
            )}
            
            {consultations.map(c => (
              <div key={c.id} className="card glass-panel" style={{ marginBottom: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                  {new Date(c.created_at).toLocaleString()}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><strong>Subjective:</strong> <p>{c.subjective || '-'}</p></div>
                  <div><strong>Objective:</strong> <p>{c.objective || '-'}</p></div>
                  <div><strong>Assessment:</strong> <p>{c.assessment || '-'}</p></div>
                  <div><strong>Plan:</strong> <p>{c.plan || '-'}</p></div>
                </div>
              </div>
            ))}
            {consultations.length === 0 && <div className="card glass-panel" style={{ textAlign: 'center' }}>No consultations found</div>}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="card glass-panel" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{new Date(inv.issued_at).toLocaleDateString()}</td>
                    <td>PKR {inv.total_amount}</td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'success' : 'warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No invoices found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
