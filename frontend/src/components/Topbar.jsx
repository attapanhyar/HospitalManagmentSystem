import { LogOut, Bell, Search } from 'lucide-react';

export default function Topbar({ isOnline, setToken }) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search patients, appointments..." 
          style={{ border: 'none', padding: '0', background: 'transparent', outline: 'none', width: '250px' }} 
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className={`badge ${isOnline ? 'success' : 'warning'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline Mode'}
        </div>
        
        <button style={{ background: 'transparent', color: 'var(--text-muted)', padding: '8px' }}>
          <Bell size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
            A
          </div>
          <button 
            onClick={() => setToken(null)}
            style={{ background: 'transparent', color: 'var(--danger)', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
