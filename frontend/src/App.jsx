import React, { useState } from 'react';
import './App.css';
import StudentManagement from './components/StudentManagement';
import CompanyManagement from './components/CompanyManagement';
import PositionManagement from './components/PositionManagement';
import JobDashboard from './components/JobDashboard';
import ApplicationTracker from './components/ApplicationTracker';
import OfferManagement from './components/OfferManagement';
import Interviews from './components/Interviews';
import Reports from './components/Reports';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <JobDashboard />;
      case 'applications':
        return <ApplicationTracker />;
      case 'offers':
        return <OfferManagement />;
      case 'interviews':
        return <Interviews setActiveTab={setActiveTab} />;
      case 'students':
        return <StudentManagement />;
      case 'companies':
        return <CompanyManagement />;
      case 'positions':
        return <PositionManagement />;
      case 'reports':
        return <Reports />;
      default:
        return <JobDashboard />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-3">
        <div className="container-fluid">
          <span className="navbar-brand">🎓 Campus Placement Tracker</span>
          <div className="d-flex gap-2 flex-wrap">
            <button className={`btn btn-${activeTab === 'dashboard' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('dashboard')}>📋 Dashboard</button>
            <button className={`btn btn-${activeTab === 'applications' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('applications')}>📝 Applications</button>
            <button className={`btn btn-${activeTab === 'interviews' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('interviews')}>🎤 Interviews</button>
            <button className={`btn btn-${activeTab === 'offers' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('offers')}>🎁 Offers</button>
            <button className={`btn btn-${activeTab === 'students' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('students')}>👥 Students</button>
            <button className={`btn btn-${activeTab === 'companies' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('companies')}>🏢 Companies</button>
            <button className={`btn btn-${activeTab === 'positions' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('positions')}>💼 Positions</button>
            <button className={`btn btn-${activeTab === 'reports' ? 'light' : 'outline-light'}`} onClick={() => setActiveTab('reports')}>📊 Reports</button>
          </div>
        </div>
      </nav>

      <main className="container mb-4">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;