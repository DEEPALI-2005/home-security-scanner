import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const response = await api.get('/vulnerabilities');
      setVulnerabilities(response.data);
    } catch (err) {
      console.error('Error fetching vulnerabilities:', err);
      setError('Failed to fetch vulnerabilities. Backend might not have data yet.');
    } finally {
      setLoading(false);
    }
  };

  // Count vulnerabilities by severity
  const countBySeverity = (severity) => {
    return vulnerabilities.filter(v => v.severity === severity).length;
  };

  if (loading) return <div className="loading">Loading dashboard</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔒 Security Scanner Dashboard</h1>
        <div className="header-buttons">
          <Link to="/reports" className="btn-reports">
            📄 Generate Report
          </Link>
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}>
            🚪 Logout
          </button>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}

      <div className="stats-container">
        <div className="stat-card critical">
          <h3>🔴 CRITICAL</h3>
          <div className="number">
            {countBySeverity('CRITICAL')}
          </div>
        </div>
        <div className="stat-card high">
          <h3>🟠 HIGH</h3>
          <div className="number">
            {countBySeverity('HIGH')}
          </div>
        </div>
        <div className="stat-card medium">
          <h3>🟡 MEDIUM</h3>
          <div className="number">
            {countBySeverity('MEDIUM')}
          </div>
        </div>
        <div className="stat-card low">
          <h3>🟢 LOW</h3>
          <div className="number">
            {countBySeverity('LOW')}
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px', color: '#333', marginTop: '30px' }}>
        🔍 Vulnerabilities Found ({vulnerabilities.length})
      </h2>

      {vulnerabilities.length === 0 ? (
        <div className="empty-state">
          <h2>📭 No Vulnerabilities Found</h2>
          <p>Run a network scan to discover vulnerabilities</p>
        </div>
      ) : (
        <div className="vulnerabilities-list">
          {vulnerabilities.map((vuln) => (
            <div key={vuln.id} className={`vuln-card severity-${vuln.severity.toLowerCase()}`}>
              <div className="vuln-header">
                <h3>🔍 {vuln.vulnerability_name}</h3>
                <span className={`badge ${vuln.severity.toLowerCase()}`}>
                  {vuln.severity}
                </span>
              </div>
              <div className="vuln-body">
                <p><strong>Device:</strong> {vuln.device_name} ({vuln.device_ip})</p>
                <p><strong>Port:</strong> {vuln.port_number}</p>
                <p><strong>Service:</strong> {vuln.service_name}</p>
                <p><strong>CVE:</strong> {vuln.cve_id}</p>
              </div>
              <div className="vuln-description">
                <p><strong>Description:</strong> {vuln.description}</p>
              </div>
              <div className="vuln-fix">
                <p><strong>🔧 Fix:</strong> {vuln.remediation_tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;