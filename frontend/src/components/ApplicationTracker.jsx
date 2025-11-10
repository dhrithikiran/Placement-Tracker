import React, { useState, useEffect } from 'react';
import apiService from '../api';


const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // State for the Schedule Interview Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    Round_Number: 1,
    Date_Time: '',
    Mode: 'Online',
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await apiService.getApplications();
      setApplications(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Failed to fetch applications.');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Status-to-bootstrap color mapping
  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied': return 'badge bg-primary';
      case 'Not Eligible': return 'badge bg-danger';
      case 'Interview Scheduled': return 'badge bg-warning text-dark';
      case 'Under Review': return 'badge bg-info text-dark';
      case 'Offered': return 'badge bg-success';
      case 'Accepted': return 'badge bg-success';
      case 'Withdrawn': return 'badge bg-secondary';
      case 'Rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  // --- Interview Scheduling Logic ---
  const openScheduleModal = (applicationId) => {
    setSelectedAppId(applicationId);
    setScheduleForm({ Round_Number: 1, Date_Time: '', Mode: 'Online' });
    setShowScheduleModal(true);
  };

  const handleScheduleChange = (e) => {
    setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !scheduleForm.Date_Time) {
      setMessage('Please fill in all required fields.');
      return;
    }
    
    // Combine application ID with form data
    const payload = {
      Application_ID: selectedAppId,
      ...scheduleForm,
    };

    try {
      const response = await apiService.scheduleInterview(payload);
      setMessage(`✅ ${response.data.message}`);
      fetchApplications(); // Refresh list to update status
      setShowScheduleModal(false);
    } catch (error) {
      setMessage('Failed to schedule interview.');
      console.error('Scheduling error:', error);
    }
  };

  // --- Offer Generation Logic ---
  const handleGenerateOffer = async (applicationId) => {
    if (!window.confirm("Are you sure you want to generate an offer for this application?")) return;
    
    try {
      const response = await apiService.generateOfferByApplication(applicationId);
      setMessage(`✅ ${response.data?.Message || response.data?.message || 'Offer generated'}`);
      fetchApplications(); // Refresh list to update status
    } catch (error) {
      setMessage('Failed to generate offer.');
      console.error('Offer generation error:', error);
    }
  };


  if (loading) return <p>Loading applications...</p>;

  return (
    <div className="content-container container">
      <h2 className="mb-3">📝 Application Tracker</h2>
      {message && <div className={`alert ${message.startsWith('❌') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Company & Role</th>
              <th>Package</th>
              <th>Min. CGPA</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.Application_ID}>
                <td>{app.Application_ID}</td>
                <td>{app.Student_Name} ({app.Branch})</td>
                <td>
                  <strong>{app.Company_Name}</strong>
                  <br />
                  <span className="text-small">{app.Role}</span>
                </td>
                <td>₹{app.Package} LPA</td>
                <td>{app.Min_CGPA}</td>
                <td>{new Date(app.Date_of_Application).toLocaleDateString()}</td>
                <td>
                  <span className={getStatusClass(app.Current_Status)}>{app.Current_Status}</span>
                  {app.Current_Status === 'Not Eligible' && app.Eligibility_Reason && (
                    <div className="mt-1">
                      <small className="text-danger d-block" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        ⚠️ {app.Eligibility_Reason}
                      </small>
                    </div>
                  )}
                </td>
                <td>
                  {(app.Current_Status === 'Applied' || app.Current_Status === 'Under Review') && (
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openScheduleModal(app.Application_ID)}
                    >
                      Schedule Interview
                    </button>
                  )}
                  
                  {app.Current_Status === 'Interview Scheduled' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleGenerateOffer(app.Application_ID)}
                    >
                      Generate Offer
                    </button>
                  )}
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* --- Schedule Interview Modal --- */}
      {showScheduleModal && (
        <div className="modal-backdrop">
          <div className="modal-content card p-3">
            <h3 className="mb-3">Schedule Interview for Application #{selectedAppId}</h3>
            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group mb-2">
                <label>Round Number:</label>
                <input
                  type="number"
                  name="Round_Number"
                  value={scheduleForm.Round_Number}
                  onChange={handleScheduleChange}
                  min="1"
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group mb-2">
                <label>Date & Time:</label>
                <input
                  type="datetime-local"
                  name="Date_Time"
                  value={scheduleForm.Date_Time}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3">
                <label>Mode:</label>
                <select name="Mode" value={scheduleForm.Mode} onChange={handleScheduleChange} required className="form-select">
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="modal-actions d-flex gap-2">
                <button type="submit" className="btn btn-primary">Schedule</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;