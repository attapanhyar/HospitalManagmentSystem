import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, DollarSign } from 'lucide-react';

export default function Analytics({ token }) {
  const [metrics, setMetrics] = useState({ total_patients: 0, today_appointments: 0, total_revenue: 0 });

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://localhost:8000/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
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
            <BarChart3 color="var(--primary)" /> Advanced Analytics
          </h1>
          <p className="text-secondary">Enterprise real-time performance metrics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px' }}>
            <Users size={32} color="#3b82f6" />
          </div>
          <div>
            <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>Total Registered Patients</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{metrics.total_patients}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '16px', borderRadius: '12px' }}>
            <Calendar size={32} color="#a855f7" />
          </div>
          <div>
            <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>Today's Appointments</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>{metrics.today_appointments}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '12px' }}>
            <DollarSign size={32} color="#22c55e" />
          </div>
          <div>
            <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>Total Revenue Collected</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '28px' }}>${metrics.total_revenue.toFixed(2)}</h2>
          </div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <p className="text-secondary">Interactive charts would render here using Recharts or Chart.js</p>
      </div>
    </div>
  );
}
