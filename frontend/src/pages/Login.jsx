import { Activity } from 'lucide-react';

export default function Login({ setToken }) {
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', e.target.email.value);
      formData.append('password', e.target.password.value);

      const res = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
      } else {
        alert("Invalid credentials!");
      }
    } catch (e) {
      alert("Failed to connect to the backend server.");
    }
  };

  return (
    <div className="login-page">
      <div className="glass-panel login-box">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Activity size={48} color="var(--primary)" />
        </div>
        <h1>Hospital ERP Pro</h1>
        <p>Sign in to your account</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="admin@example.com" required defaultValue="admin@example.com" />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" required defaultValue="password123" />
          </div>
          
          <button type="submit" style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '16px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
