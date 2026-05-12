import { useState, useEffect } from 'react';
import { Pill, Plus } from 'lucide-react';

export default function Pharmacy({ token }) {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:8000/pharmacy/inventory/', {
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

  return (
    <div className="page-animate">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill color="var(--primary)" /> Pharmacy & Inventory
          </h1>
          <p className="text-secondary">Manage medicine stock and dispensations</p>
        </div>
        <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Stock
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3>Inventory List</h3>
        <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Item Name</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Stock Quantity</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Unit Price</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No inventory items found.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{item.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: item.stock_quantity > 10 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.stock_quantity > 10 ? '#22c55e' : '#ef4444',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.stock_quantity} units
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>${item.unit_price}</td>
                  <td style={{ padding: '12px' }}>{item.expiry_date || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
