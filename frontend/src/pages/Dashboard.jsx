import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard({ patients }) {
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Dashboard Overview</h2>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Patients</h3>
            <p className="value">{patients.length}</p>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Appointments Today</h3>
            <p className="value">0</p>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Critical Cases</h3>
            <p className="value">0</p>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending Sync</h3>
            <p className="value">{patients.filter(p => !p.synced).length}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)' }}>Implement real-time activity feed here...</p>
      </div>
    </div>
  );
}
