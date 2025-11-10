import React, { useState, useEffect } from 'react';
import api from '../api';


function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Degree: '',
    Branch: '',
    CGPA: '',
    Backlogs: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsResponse, academicResponse] = await Promise.all([
        api.getStudents(),
        api.getAcademicRecords()
      ]);
      setStudents(studentsResponse.data);
      setAcademicRecords(academicResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      showMessage('Failed to fetch students', 'error');
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
      if (editMode) {
        await api.updateStudent(editId, formData);
        showMessage('Student updated successfully!', 'success');
      } else {
        await api.createStudent(formData);
        showMessage('Student created successfully!', 'success');
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      showMessage('Failed to save student', 'error');
    }
  };

  const handleEdit = async (student) => {
    // Fetch academic record for this student
    try {
      const academicResponse = await api.getAcademicRecords();
      const academicRecord = academicResponse.data.find(ar => ar.Student_ID === student.Student_ID);
      
      setFormData({
        Name: student.Name,
        Email: student.Email,
        Phone: student.Phone,
        Degree: student.Degree,
        Branch: student.Branch,
        CGPA: academicRecord ? academicRecord.CGPA : '',
        Backlogs: academicRecord ? academicRecord.Backlogs : ''
      });
      setEditMode(true);
      setEditId(student.Student_ID);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching academic record:', error);
      setFormData({
        Name: student.Name,
        Email: student.Email,
        Phone: student.Phone,
        Degree: student.Degree,
        Branch: student.Branch,
        CGPA: '',
        Backlogs: ''
      });
      setEditMode(true);
      setEditId(student.Student_ID);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.deleteStudent(id);
        showMessage('Student deleted successfully!', 'success');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        showMessage('Failed to delete student', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      Email: '',
      Phone: '',
      Degree: '',
      Branch: '',
      CGPA: '',
      Backlogs: ''
    });
    setEditMode(false);
    setEditId(null);
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
    <div className="component-container container">
      <h2 className="mb-3">👥 Student Management</h2>

      {message && (
        <div className={`alert ${messageType === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h5 className="card-title">{editMode ? '✏️ Edit Student' : '➕ Add New Student'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    required
                    placeholder="student@example.com"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Degree *</label>
                  <input
                    type="text"
                    name="Degree"
                    value={formData.Degree}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., B.Tech"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select
                    name="Branch"
                    value={formData.Branch}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">CGPA *</label>
                  <input
                    type="number"
                    name="CGPA"
                    value={formData.CGPA}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter CGPA (0-10)"
                    className="form-control"
                    step="0.01"
                    min="0"
                    max="10"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Backlogs *</label>
                  <input
                    type="number"
                    name="Backlogs"
                    value={formData.Backlogs}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter number of backlogs"
                    className="form-control"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editMode ? '💾 Update Student' : '➕ Add Student'}
              </button>
              {editMode && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">📋 All Students</h5>
          {loading ? (
            <div className="text-muted">Loading students...</div>
          ) : (
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Degree</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const academic = academicRecords.find(ar => ar.Student_ID === student.Student_ID);
                    return (
                      <tr key={student.Student_ID}>
                        <td>{student.Student_ID}</td>
                        <td>{student.Name}</td>
                        <td>{student.Email}</td>
                        <td>{student.Phone}</td>
                        <td>{student.Degree}</td>
                        <td><span className="badge bg-primary">{student.Branch}</span></td>
                        <td>
                          {academic ? (
                            <span className={`badge ${academic.CGPA >= 7.5 ? 'bg-success' : academic.CGPA >= 7 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {academic.CGPA}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">N/A</span>
                          )}
                        </td>
                        <td>
                          {academic ? (
                            <span className={`badge ${academic.Backlogs === 0 ? 'bg-success' : academic.Backlogs <= 2 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {academic.Backlogs}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">N/A</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEdit(student)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(student.Student_ID)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;