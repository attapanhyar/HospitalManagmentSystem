import { useState, useEffect } from 'react';
import { Briefcase, Plus } from 'lucide-react';

export default function HR({ token }) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetchProfiles();
  }, [token]);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('http://localhost:8000/hr/profiles/', {
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

  return (
    <div className="page-animate">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase color="var(--primary)" /> HR & Payroll
          </h1>
          <p className="text-secondary">Manage employees, attendance, and salaries</p>
        </div>
        <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3>Employee Directory</h3>
        <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Employee ID</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Designation</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Base Salary</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No employee records found.
                </td>
              </tr>
            ) : (
              profiles.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>#{p.user_id}</td>
                  <td style={{ padding: '12px' }}>{p.designation}</td>
                  <td style={{ padding: '12px' }}>${p.base_salary}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.hire_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
