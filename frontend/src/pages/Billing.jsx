import { useState, useEffect } from 'react';
import { CreditCard, Plus, Check } from 'lucide-react';

export default function Billing({ token, patients }) {
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    patient_id: '',
    total_amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/billing/invoices/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInvoices(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patient_id: parseInt(invoiceForm.patient_id),
        total_amount: parseFloat(invoiceForm.total_amount),
        items: [{
          description: invoiceForm.description,
          quantity: 1,
          unit_price: parseFloat(invoiceForm.total_amount),
          amount: parseFloat(invoiceForm.total_amount)
        }]
      };
      
      const res = await fetch(`http://localhost:8000/billing/invoices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowInvoiceForm(false);
        setInvoiceForm({ patient_id: '', total_amount: '', description: '' });
        fetchInvoices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessPayment = async (invoiceId, amount) => {
    try {
      const res = await fetch(`http://localhost:8000/billing/invoices/${invoiceId}/payments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount_paid: amount, payment_method: 'cash' })
      });
      
      if (res.ok) {
        fetchInvoices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading billing data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Billing & Finance</h2>
        <button onClick={() => setShowInvoiceForm(true)}>
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {showInvoiceForm && (
        <div className="card glass-panel" style={{ marginBottom: '24px' }}>
          <h3>New Invoice</h3>
          <form onSubmit={handleCreateInvoice}>
            <div className="input-group">
              <label>Patient</label>
              <select 
                required 
                value={invoiceForm.patient_id} 
                onChange={e => setInvoiceForm({...invoiceForm, patient_id: e.target.value})}
              >
                <option value="">Select Patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Description</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Consultation Fee"
                value={invoiceForm.description}
                onChange={e => setInvoiceForm({...invoiceForm, description: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Amount (PKR)</label>
              <input 
                type="number" 
                required 
                value={invoiceForm.total_amount}
                onChange={e => setInvoiceForm({...invoiceForm, total_amount: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="secondary" onClick={() => setShowInvoiceForm(false)}>Cancel</button>
              <button type="submit">Generate</button>
            </div>
          </form>
        </div>
      )}

      <div className="card glass-panel" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const patient = patients.find(p => p.id === inv.patient_id);
              return (
                <tr key={inv.id}>
                  <td>#INV-{inv.id}</td>
                  <td>{patient ? patient.full_name : 'Unknown Patient'}</td>
                  <td>{new Date(inv.issued_at).toLocaleDateString()}</td>
                  <td>PKR {inv.total_amount}</td>
                  <td>
                    <span className={`badge ${inv.status === 'paid' ? 'success' : (inv.status === 'partially_paid' ? 'warning' : 'danger')}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {inv.status !== 'paid' && (
                      <button 
                        className="secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleProcessPayment(inv.id, inv.total_amount)}
                      >
                        <CreditCard size={14} style={{ marginRight: '4px' }}/> Pay Full
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No invoices found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
