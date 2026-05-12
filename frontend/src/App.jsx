import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import localforage from 'localforage';
import { API_BASE_URL } from './config';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import Appointments from './pages/Appointments';

import PatientDetails from './pages/PatientDetails';
import Billing from './pages/Billing';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import HR from './pages/HR';
import Analytics from './pages/Analytics';

export default function App() {
  const [token, setToken] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && token) {
      syncOfflineData();
    }
  }, [isOnline, token]);

  const syncOfflineData = async () => {
    try {
      const offlinePatients = await localforage.getItem('offlinePatients') || [];
      if (offlinePatients.length === 0) return;

      console.log(`Syncing ${offlinePatients.length} records to server...`);
      const newOffline = [];
      
      for (const p of offlinePatients) {
        try {
          const res = await fetch(`${API_BASE_URL}/patients/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(p)
          });
          
          if (!res.ok) {
            newOffline.push(p);
          }
        } catch (e) {
          newOffline.push(p);
        }
      }
      
      await localforage.setItem('offlinePatients', newOffline);
      fetchPatients();
    } catch (e) {
      console.error("Sync failed", e);
    }
  };

  const fetchPatients = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch(`${API_BASE_URL}/patients/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error("Failed to fetch patients", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatients();
    }
  }, [token]);

  const handlePatientSubmit = async (e, formData) => {
    e.preventDefault();
    const newPatient = { ...formData, synced: isOnline };
    
    if (isOnline) {
      try {
        await fetch(`${API_BASE_URL}/patients/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newPatient)
        });
        fetchPatients();
      } catch (e) {
        saveOffline(newPatient);
      }
    } else {
      saveOffline(newPatient);
    }
  };

  const handlePatientUpdate = async (patientId, formData) => {
    if (!isOnline) {
      alert("Cannot edit patient while offline.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchPatients();
      } else {
        alert("Failed to update patient.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    }
  };

  const saveOffline = async (patient) => {
    const offlinePatients = await localforage.getItem('offlinePatients') || [];
    offlinePatients.push(patient);
    await localforage.setItem('offlinePatients', offlinePatients);
    
    setPatients(prev => [...prev, { ...patient, id: 'temp-' + Date.now(), synced: false }]);
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout isOnline={isOnline} setToken={setToken} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard patients={patients} />} />
          <Route path="patients" element={<PatientsList patients={patients} handleSubmit={handlePatientSubmit} handleUpdate={handlePatientUpdate} />} />
          <Route path="patients/:id" element={<PatientDetails token={token} />} />
          <Route path="appointments" element={<Appointments token={token} patients={patients} />} />
          <Route path="billing" element={<Billing token={token} patients={patients} />} />
          <Route path="pharmacy" element={<Pharmacy token={token} />} />
          <Route path="laboratory" element={<Laboratory token={token} />} />
          <Route path="hr" element={<HR token={token} />} />
          <Route path="analytics" element={<Analytics token={token} />} />
        </Route>
      </Routes>
    </Router>
  );
}
