import React, { useEffect, useState } from 'react';
import api from '../api';

const Interviews = ({ setActiveTab }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.getInterviews();
      setInterviews(res.data);
      setMessage('');
    } catch (e) {
      setMessage('Failed to load interviews.');
      // eslint-disable-next-line no-console
      console.error('Interviews load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const setResult = async (interviewId, result) => {
    try {
      const res = await api.updateInterviewResult(interviewId, { Result: result });
      setMessage(res.data?.Message || 'Interview result updated');
      await fetchInterviews();
    } catch (e) {
      setMessage('Failed to update interview result');
      // eslint-disable-next-line no-console
      console.error('Update result error:', e);
    }
  };

  const deleteInterview = async (interviewId) => {
    if (!window.confirm('Delete this interview?')) return;
    try {
      const res = await api.deleteInterview(interviewId);
      setMessage(res.data?.message || 'Interview deleted');
      await fetchInterviews();
    } catch (e) {
      setMessage('Failed to delete interview');
      // eslint-disable-next-line no-console
      console.error('Delete interview error:', e);
    }
  };

  // After marking as Passed, backend auto-generates offer; jump to Offers tab

  if (loading) return <p>Loading interviews...</p>;

  return (
    <div className="content-container">
      <h2>🎤 Interviews</h2>
      {message && <div className="alert alert-error">{message}</div>}

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Company</th>
              <th>Role</th>
              <th>Round</th>
              <th>Date & Time</th>
              <th>Mode</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No interviews found</td>
              </tr>
            ) : (
              interviews.map((iv) => (
                <tr key={iv.Interview_ID}>
                  <td>{iv.Interview_ID}</td>
                  <td>{iv.Student_Name}</td>
                  <td>{iv.Company_Name}</td>
                  <td>{iv.Role}</td>
                  <td>{iv.Round_Number}</td>
                  <td>{new Date(iv.Date_Time).toLocaleString()}</td>
                  <td>{iv.Mode}</td>
                  <td>{iv.Result}</td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={async () => {
                          await setResult(iv.Interview_ID, 'Passed');
                          // Small delay to allow offer insert; then go to Offers
                          setTimeout(() => setActiveTab && setActiveTab('offers'), 300);
                        }}
                      >
                        Mark Passed
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setResult(iv.Interview_ID, 'Failed')}>Mark Failed</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteInterview(iv.Interview_ID)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Interviews;


