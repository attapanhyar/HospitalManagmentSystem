import { useState, useEffect } from 'react';
import { Briefcase, Plus, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function HR({ token }) {
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ user_id: '', designation: '', base_salary: 0, hire_date: '' });

  useEffect(() => {
    fetchProfiles();
    fetchUsers();
  }, [token]);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/hr/profiles/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/hr/profiles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: parseInt(formData.user_id) || 0,
          designation: formData.designation,
          base_salary: parseFloat(formData.base_salary) || 0,
          hire_date: formData.hire_date
        })
      });
      if (res.ok) {
        fetchProfiles();
        setShowModal(false);
        setFormData({ user_id: '', designation: '', base_salary: 0, hire_date: '' });
      } else {
        alert("Failed to add employee profile.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-animate" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase color="var(--primary)" /> HR & Payroll
          </h1>
          <p>Manage employees, attendance, and salaries</p>
        </div>
        <button className="primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
          <Plus size={18} /> Add Employee Profile
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3>Employee Directory</h3>
        <table className="data-table" style={{ marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>System Email</th>
              <th>Designation</th>
              <th>Base Salary</th>
              <th>Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No employee records found.</td>
              </tr>
            ) : (
              profiles.map(p => {
                const user = users.find(u => u.id === p.user_id);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '500' }}>#{p.user_id}</td>
                    <td>{user ? user.email : 'Unknown'}</td>
                    <td><span className="badge neutral">{p.designation}</span></td>
                    <td>${p.base_salary.toFixed(2)}</td>
                    <td>{p.hire_date}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Add Profile</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Select System User</label>
                <select required value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})}>
                  <option value="">-- Select User --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Designation / Job Title</label>
                <input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Nurse" />
              </div>
              <div className="input-group">
                <label>Base Salary ($)</label>
                <input type="number" step="0.01" required value={formData.base_salary} onChange={e => setFormData({...formData, base_salary: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Hire Date</label>
                <input type="date" required value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} />
              </div>
              <button type="submit" style={{ width: '100%', marginTop: '8px' }}>Create Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
