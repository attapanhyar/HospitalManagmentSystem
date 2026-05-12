import { useState, useEffect } from 'react';
import { Pill, Plus, X } from 'lucide-react';

export default function Pharmacy({ token }) {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', stock_quantity: 0, unit_price: 0, expiry_date: '' });

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/pharmacy/inventory/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/pharmacy/inventory/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          unit_price: parseFloat(formData.unit_price) || 0,
          expiry_date: formData.expiry_date || null
        })
      });
      if (res.ok) {
        fetchInventory();
        setShowModal(false);
        setFormData({ name: '', stock_quantity: 0, unit_price: 0, expiry_date: '' });
      } else {
        alert("Failed to add inventory.");
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
            <Pill color="var(--primary)" /> Pharmacy & Inventory
          </h1>
          <p>Manage medicine stock and dispensations</p>
        </div>
        <button className="primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
          <Plus size={18} /> Add Stock
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3>Inventory List</h3>
        <table className="data-table" style={{ marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Stock Quantity</th>
              <th>Unit Price</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No inventory items found.</td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '500' }}>{item.name}</td>
                  <td>
                    <span className={`badge ${item.stock_quantity > 10 ? 'success' : 'danger'}`}>
                      {item.stock_quantity} units
                    </span>
                  </td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.expiry_date || 'N/A'}</td>
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
              <h2>Add New Stock</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Medicine Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Paracetamol 500mg" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Quantity</label>
                  <input type="number" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Unit Price ($)</label>
                  <input type="number" step="0.01" required value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Expiry Date</label>
                <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
              </div>
              <button type="submit" style={{ width: '100%', marginTop: '8px' }}>Add Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
