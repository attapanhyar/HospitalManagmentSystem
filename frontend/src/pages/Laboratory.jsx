import { useState, useEffect } from 'react';
import { FlaskConical, Plus, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Laboratory({ token }) {
  const [catalog, setCatalog] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ test_name: '', description: '', price: 0 });

  useEffect(() => {
    fetchCatalog();
  }, [token]);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/laboratory/catalog/`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/laboratory/catalog/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test_name: formData.test_name,
          description: formData.description || null,
          price: parseFloat(formData.price) || 0
        })
      });
      if (res.ok) {
        fetchCatalog();
        setShowModal(false);
        setFormData({ test_name: '', description: '', price: 0 });
      } else {
        alert("Failed to add test catalog item.");
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
            <FlaskConical color="var(--primary)" /> Laboratory & Pathology
          </h1>
          <p>Manage lab tests and results</p>
        </div>
        <button className="primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
          <Plus size={18} /> New Test Type
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3>Test Catalog</h3>
        <table className="data-table" style={{ marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {catalog.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No lab tests configured.</td>
              </tr>
            ) : (
              catalog.map(test => (
                <tr key={test.id}>
                  <td style={{ fontWeight: '500' }}>{test.test_name}</td>
                  <td>{test.description || '-'}</td>
                  <td><span className="badge neutral">${test.price.toFixed(2)}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Add New Test</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Test Name</label>
                <input required value={formData.test_name} onChange={e => setFormData({...formData, test_name: e.target.value})} placeholder="e.g. Complete Blood Count (CBC)" />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional details..." style={{ padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
              </div>
              <div className="input-group">
                <label>Test Price ($)</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <button type="submit" style={{ width: '100%', marginTop: '8px' }}>Add Test</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
