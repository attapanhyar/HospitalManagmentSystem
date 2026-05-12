import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';

export default function Appointments({ token, patients }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ patient_id: '', doctor_id: '', notes: '' });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('http://localhost:8000/appointments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:8000/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming role filtering if applicable, else show all
        setDoctors(data); 
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id) {
      alert("Please select both a patient and a doctor.");
      return;
    }
    
    try {
      const res = await fetch('http://localhost:8000/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ patient_id: '', doctor_id: '', notes: '' });
        fetchAppointments();
      } else {
        alert("Failed to schedule appointment.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Appointments Schedule</h2>
        <button onClick={() => setShowModal(true)}>
          <CalendarIcon size={18} />
          Schedule Appointment
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {appointments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No appointments scheduled yet.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.patient_id}</td>
                  <td>{a.doctor_id}</td>
                  <td>{new Date(a.appointment_time).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${a.status === 'scheduled' ? 'warning' : 'success'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--surface)' }}>
            <h3 style={{ marginBottom: '24px' }}>Schedule Appointment</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Select Patient</label>
                <select 
                  value={formData.patient_id} 
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.filter(p => p.synced).map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.phone_number})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Select Doctor</label>
                <select 
                  value={formData.doctor_id} 
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.email} ({d.role})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Notes</label>
                <textarea 
                  rows="3"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Optional details..."
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
