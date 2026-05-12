import { useState } from 'react';
import { Plus, Check, Clock, Edit2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientsList({ patients, handleSubmit, handleUpdate }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', medical_history: '' });

  const onSubmit = (e) => {
    if (isEditing) {
      handleUpdate(editId, formData);
    } else {
      handleSubmit(e, formData);
    }
    closeModal();
  };

  const openEditModal = (patient) => {
    setFormData({
      full_name: patient.full_name,
      phone_number: patient.phone_number,
      medical_history: patient.medical_history || ''
    });
    setEditId(patient.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ full_name: '', phone_number: '', medical_history: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Patients Directory</h2>
        <button onClick={() => { setIsEditing(false); setShowModal(true); }}>
          <Plus size={18} />
          New Patient
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {patients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No patients found. Add a new patient to get started.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Phone Number</th>
                <th>Medical History</th>
                <th>Sync Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '500' }}>{p.full_name}</td>
                  <td>{p.phone_number}</td>
                  <td>{p.medical_history ? (p.medical_history.substring(0, 30) + '...') : '-'}</td>
                  <td>
                    {p.synced ? (
                      <span className="badge success"><Check size={12} style={{marginRight: '4px'}}/> Synced</span>
                    ) : (
                      <span className="badge warning"><Clock size={12} style={{marginRight: '4px'}}/> Pending</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      className="secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      disabled={!p.synced}
                      title={!p.synced ? "Cannot view unsynced patient" : "View Chart"}
                    >
                      <Eye size={14} style={{ marginRight: '4px' }}/> Chart
                    </button>
                    <button 
                      className="secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => openEditModal(p)}
                      disabled={!p.synced}
                      title={!p.synced ? "Cannot edit unsynced patient" : "Edit patient"}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--surface)' }}>
            <h3 style={{ marginBottom: '24px' }}>{isEditing ? 'Edit Patient' : 'Register New Patient'}</h3>
            <form onSubmit={onSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  required 
                  pattern="^(03|\+923)[0-9]{9}$"
                  title="Pakistani format: 03XXXXXXXXX"
                  value={formData.phone_number}
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Medical History</label>
                <textarea 
                  rows="4"
                  value={formData.medical_history}
                  onChange={e => setFormData({...formData, medical_history: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="secondary" onClick={closeModal}>Cancel</button>
                <button type="submit">{isEditing ? 'Update Patient' : 'Save Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
