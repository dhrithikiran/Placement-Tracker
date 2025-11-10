import React, { useState, useEffect } from 'react';
import apiService from '../api'; // ✅ changed name

function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    Company_Name: '',
    Industry: '',
    Location: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCompanies(); // ✅ changed 'api' → 'apiService'
      setCompanies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      showMessage('Failed to fetch companies', 'error');
      setLoading(false);
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
    try {
      await apiService.createCompany(formData); // ✅ changed 'api' → 'apiService'
      showMessage('Company added successfully!', 'success');
      setFormData({
        Company_Name: '',
        Industry: '',
        Location: ''
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      showMessage('Failed to add company', 'error');
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

  return (
    <div className="component-container">
      <h2 className="component-title">🏢 Company Management</h2>

      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      <div className="form-container">
        <h3>➕ Add New Company</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="Company_Name"
                value={formData.Company_Name}
                onChange={handleInputChange}
                required
                placeholder="Enter company name"
              />
            </div>

            <div className="form-group">
              <label>Industry *</label>
              <input
                type="text"
                name="Industry"
                value={formData.Industry}
                onChange={handleInputChange}
                required
                placeholder="e.g., IT Services"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="Location"
                value={formData.Location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Mumbai"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ➕ Add Company
          </button>
        </form>
      </div>

      <div className="table-container">
        <h3>📋 All Companies</h3>
        {loading ? (
          <div className="loading">Loading companies...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No companies found
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.Company_ID}>
                    <td>{company.Company_ID}</td>
                    <td><strong>{company.Company_Name}</strong></td>
                    <td><span className="badge badge-blue">{company.Industry}</span></td>
                    <td>📍 {company.Location}</td>
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

export default CompanyManagement;
