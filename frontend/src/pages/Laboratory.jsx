import { useState, useEffect } from 'react';
import { FlaskConical, Plus } from 'lucide-react';

export default function Laboratory({ token }) {
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    fetchCatalog();
  }, [token]);

  const fetchCatalog = async () => {
    try {
      const res = await fetch('http://localhost:8000/laboratory/catalog/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCatalog(data);
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
            <FlaskConical color="var(--primary)" /> Laboratory & Pathology
          </h1>
          <p className="text-secondary">Manage lab tests and results</p>
        </div>
        <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Test Type
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3>Test Catalog</h3>
        <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Test Name</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Description</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {catalog.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No lab tests configured.
                </td>
              </tr>
            ) : (
              catalog.map(test => (
                <tr key={test.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{test.test_name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{test.description || '-'}</td>
                  <td style={{ padding: '12px' }}>${test.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
