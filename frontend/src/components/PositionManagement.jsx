import React, { useState, useEffect } from 'react';
import api from '../api';


function PositionManagement() {
  const [positions, setPositions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    Company_ID: '',
    Role: '',
    Eligibility: '',
    Package: '',
    Min_CGPA: '',
    Max_Backlogs: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
    fetchCompanies();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await api.getPositions();
      setPositions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching positions:', error);
      showMessage('Failed to fetch positions', 'error');
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.getCompanies();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (parseFloat(formData.Min_CGPA) < 0 || parseFloat(formData.Min_CGPA) > 10) {
      showMessage('CGPA must be between 0 and 10', 'error');
      return;
    }
    
    if (parseInt(formData.Max_Backlogs) < 0) {
      showMessage('Max Backlogs cannot be negative', 'error');
      return;
    }

    try {
      await api.createPosition(formData);
      showMessage('Position created successfully!', 'success');
      setFormData({
        Company_ID: '',
        Role: '',
        Eligibility: '',
        Package: '',
        Min_CGPA: '',
        Max_Backlogs: ''
      });
      fetchPositions();
    } catch (error) {
      console.error('Error creating position:', error);
      showMessage('Failed to create position', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const formatPackage = (amount) => {
    return `₹${(amount / 100000).toFixed(2)} LPA`;
  };

  return (
    <div className="component-container">
      <h2 className="component-title">💼 Position Management</h2>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="form-container">
        <h3>➕ Add New Position</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Company *</label>
              <select
                name="Company_ID"
                value={formData.Company_ID}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.Company_ID} value={company.Company_ID}>
                    {company.Company_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Role/Job Title *</label>
              <input
                type="text"
                name="Role"
                value={formData.Role}
                onChange={handleInputChange}
                required
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="form-group">
              <label>Package (in ₹) *</label>
              <input
                type="number"
                name="Package"
                value={formData.Package}
                onChange={handleInputChange}
                required
                placeholder="e.g., 600000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Minimum CGPA *</label>
              <input
                type="number"
                name="Min_CGPA"
                value={formData.Min_CGPA}
                onChange={handleInputChange}
                required
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g., 7.0"
              />
            </div>

            <div className="form-group">
              <label>Maximum Backlogs Allowed *</label>
              <input
                type="number"
                name="Max_Backlogs"
                value={formData.Max_Backlogs}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="e.g., 0"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Eligibility Criteria *</label>
              <textarea
                name="Eligibility"
                value={formData.Eligibility}
                onChange={handleInputChange}
                required
                placeholder="Describe eligibility criteria..."
                rows="3"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ➕ Create Position
          </button>
        </form>
      </div>

      <div className="table-container">
        <h3>📋 All Job Positions</h3>
        {loading ? (
          <div className="loading">Loading positions...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Min CGPA</th>
                <th>Max Backlogs</th>
                <th>Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No positions found
                  </td>
                </tr>
              ) : (
                positions.map((position) => (
                  <tr key={position.Position_ID}>
                    <td>{position.Position_ID}</td>
                    <td><strong>{position.Company_Name}</strong></td>
                    <td>{position.Role}</td>
                    <td><span className="badge badge-green">{formatPackage(position.Package)}</span></td>
                    <td>{position.Min_CGPA}</td>
                    <td>{position.Max_Backlogs}</td>
                    <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
                      {position.Eligibility}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PositionManagement;