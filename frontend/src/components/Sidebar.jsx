import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Activity, CreditCard, Pill, FlaskConical, Briefcase, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-logo">
        <Activity size={28} color="var(--primary)" />
        Hospital Pro
      </div>
      
      <nav className="nav-links">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/patients" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Users size={20} />
          Patients
        </NavLink>
        
        <NavLink 
          to="/appointments" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Calendar size={20} />
          Appointments
        </NavLink>
        
        <NavLink 
          to="/billing" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <CreditCard size={20} />
          Billing & Finance
        </NavLink>

        <NavLink 
          to="/pharmacy" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Pill size={20} />
          Pharmacy
        </NavLink>
        
        <NavLink 
          to="/laboratory" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <FlaskConical size={20} />
          Laboratory
        </NavLink>
        
        <NavLink 
          to="/hr" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Briefcase size={20} />
          HR & Payroll
        </NavLink>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <BarChart3 size={20} />
          Analytics
        </NavLink>
      </nav>
    </div>
  );
}
