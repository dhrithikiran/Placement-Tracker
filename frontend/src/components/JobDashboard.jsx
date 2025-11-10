import React, { useState, useEffect } from 'react';
import api from '../api';


function JobDashboard() {
  const [positions, setPositions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
    fetchStudents();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await api.getPositions();
      setPositions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStudentSelect = (positionId, studentId) => {
    setSelectedStudents({
      ...selectedStudents,
      [positionId]: studentId
    });
  };

  const handleApply = async (positionId) => {
    const studentId = selectedStudents[positionId];
    
    if (!studentId) {
      showMessage('Please select a student first', 'error');
      return;
    }

    try {
      const response = await api.applyForPosition({
        Student_ID: parseInt(studentId),
        Position_ID: positionId
      });
      
      // Check if application was marked as Not Eligible
      if (response.data?.status === 'Not Eligible') {
        showMessage(`⚠️ ${response.data.message}: ${response.data.reason || ''}`, 'error');
      } else {
        showMessage('✅ Application submitted successfully!', 'success');
      }
      
      // Clear selection
      const newSelections = { ...selectedStudents };
      delete newSelections[positionId];
      setSelectedStudents(newSelections);
    } catch (error) {
      console.error('Error applying:', error);
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          showMessage(`❌ ${error.response.data.error}`, 'error');
        } else if (error.response.data.message) {
          showMessage(`⚠️ ${error.response.data.message}`, 'error');
        } else {
          showMessage('❌ Failed to submit application', 'error');
        }
      } else {
        showMessage('❌ Failed to submit application', 'error');
      }
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const formatPackage = (amount) => {
    return `₹${(amount / 100000).toFixed(2)} LPA`;
  };

  return (
    <div className="component-container">
      <h2 className="component-title">📋 Available Job Positions</h2>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading positions...</div>
      ) : positions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          No positions available at the moment
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {positions.map((position) => (
            <div
              key={position.Position_ID}
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                {position.Company_Name}
              </h3>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem' }}>
                {position.Role}
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '6px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  💰 {formatPackage(position.Package)}
                </div>
              </div>

              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#fff3cd', 
                borderRadius: '6px',
                border: '1px solid #ffc107'
              }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#856404' }}>📋 Eligibility Criteria:</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    Min CGPA: <strong>{position.Min_CGPA}</strong>
                  </span>
                  <span style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    Max Backlogs: <strong>{position.Max_Backlogs}</strong>
                  </span>
                </div>
              </div>

              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: '#495057'
              }}>
                <strong>Eligibility:</strong>
                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>{position.Eligibility}</p>
              </div>

              <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Select Student:
                </label>
                <select
                  value={selectedStudents[position.Position_ID] || ''}
                  onChange={(e) => handleStudentSelect(position.Position_ID, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    marginBottom: '0.75rem'
                  }}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((student) => (
                    <option key={student.Student_ID} value={student.Student_ID}>
                      {student.Name} ({student.Branch})
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(position.Position_ID)}
                  style={{ width: '100%' }}
                  disabled={!selectedStudents[position.Position_ID]}
                >
                  📝 Submit Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobDashboard;