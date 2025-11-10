import React, { useState, useEffect } from 'react';
import apiService from '../api';


const Reports = () => {
  const [branchStats, setBranchStats] = useState([]);
  const [companyReport, setCompanyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Branch Stats
      const branchResponse = await apiService.getBranchStats();
      setBranchStats(branchResponse.data);

      // Fetch Company Report
      const companyResponse = await apiService.getCompanyReport();
      setCompanyReport(companyResponse.data);

    } catch (err) {
      setError('Failed to fetch one or both reports. Check console for details.');
      console.error('Report fetching error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to format package values
  const formatPackage = (pkg) => `₹${parseFloat(pkg).toFixed(2)} LPA`;
  
  // Helper to get color for high percentage
  const getPercentageStyle = (percent) => {
    const value = parseFloat(percent);
    if (value >= 75) return { color: 'green', fontWeight: 'bold' };
    if (value >= 50) return { color: 'darkorange' };
    return {};
  };

  if (loading) return <p className="container">Loading reports...</p>;
  if (error) return <p className="alert alert-danger container">❌ Error loading reports: {error}</p>;

  return (
    <div className="content-container container">
      <h2 className="mb-3">📊 Placement Reports & Statistics</h2>

      {/* --- SECTION 1: Branch Statistics Report --- */}
      <div className="report-section card shadow-sm mb-3">
        <div className="card-body">
        <h5 className="card-title">1. Placement Statistics by Branch</h5>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Total Students</th>
                <th>Students With Offers</th>
                <th>Placement %</th>
                <th>Total Applications</th>
                <th>Avg. Package</th>
                <th>Highest Package</th>
              </tr>
            </thead>
            <tbody>
              {branchStats.map((stats, index) => (
                <tr key={index}>
                  <td><strong>{stats.Branch}</strong></td>
                  <td>{stats.Total_Students}</td>
                  <td>{stats.Students_With_Offers}</td>
                  <td style={getPercentageStyle(stats.Placement_Percentage)}>
                    {stats.Placement_Percentage}%
                  </td>
                  <td>{stats.Total_Applications}</td>
                  <td>{formatPackage(stats.Avg_Package_Offered)}</td>
                  <td>{formatPackage(stats.Highest_Package)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* --- SECTION 2: Company Placement Report --- */}
      <div className="report-section card shadow-sm">
        <div className="card-body">
        <h5 className="card-title">2. Company Placement Report</h5>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Active Positions</th>
                <th>Total Applications</th>
                <th>Offers Accepted</th>
                <th>Offers Pending</th>
                <th>Avg. Package</th>
                <th>Highest Package</th>
              </tr>
            </thead>
            <tbody>
              {companyReport.map((report, index) => (
                <tr key={index}>
                  <td><strong>{report.Company_Name}</strong></td>
                  <td>{report.Active_Positions}</td>
                  <td>{report.Total_Applications}</td>
                  <td className="text-success">{report.Offers_Accepted}</td>
                  <td className="text-warning">{report.Offers_Pending}</td>
                  <td>{formatPackage(report.Avg_Package)}</td>
                  <td>{formatPackage(report.Highest_Package)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;