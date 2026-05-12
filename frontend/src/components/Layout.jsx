import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ isOnline, setToken }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar isOnline={isOnline} setToken={setToken} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
