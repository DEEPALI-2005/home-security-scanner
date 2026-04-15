import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ReportPage.css';

function ReportPage() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedVulns, setSelectedVulns] = useState([]);
  const [reportTitle, setReportTitle] = useState('Security Vulnerability Report');
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const [generatedReports, setGeneratedReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVulnerabilities();
    fetchReports();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching vulnerabilities...'); // 🔍 Debug log
      
      const response = await api.get('/vulnerabilities');
      console.log('Vulnerabilities fetched:', response.data); // 🔍 Debug log
      
      setVulnerabilities(response.data);
    } catch (err) {
      console.error('Error fetching vulnerabilities:', err); // 🔍 Debug log
      setError('Failed to fetch vulnerabilities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      console.log('Reports fetched:', response.data);
      setGeneratedReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const handleSelectVuln = (id) => {
    setSelectedVulns(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedVulns.length === vulnerabilities.length) {
      setSelectedVulns([]);
    } else {
      setSelectedVulns(vulnerabilities.map(v => v.id));
    }
  };

  const generateReport = async () => {
    if (selectedVulns.length === 0) {
      setError('Please select at least one vulnerability');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/reports/generate', {
        vulnerabilityIds: selectedVulns,
        title: reportTitle
      });

      setSuccess('Report generated successfully! 📄');
      setSelectedVulns([]);
      setReportTitle('Security Vulnerability Report');
      fetchReports();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (filename) => {
    api.get(`/reports/download/${filename}`, {
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    }).catch(err => {
      setError('Failed to download report');
    });
  };

  const severityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#e74c3c';
      case 'HIGH': return '#f39c12';
      case 'MEDIUM': return '#f1c40f';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>📄 Generate Security Report</h1>
        <p>Select vulnerabilities to include in your PDF report</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && <div className="loading">Loading vulnerabilities...</div>}

      {vulnerabilities.length === 0 && !loading && (
        <div className="alert alert-error">No vulnerabilities found. Make sure you're logged in and the backend is running.</div>
      )}

      <div className="report-content">
        {/* Left Side - Vulnerability Selection */}
        <div className="vuln-selection">
          <div className="section-title">
            <h2>🔍 Select Vulnerabilities ({vulnerabilities.length})</h2>
            {vulnerabilities.length > 0 && (
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedVulns.length === vulnerabilities.length && vulnerabilities.length > 0}
                  onChange={handleSelectAll}
                />
                Select All ({selectedVulns.length}/{vulnerabilities.length})
              </label>
            )}
          </div>

          <div className="vuln-list">
            {vulnerabilities.length > 0 ? (
              vulnerabilities.map(vuln => (
                <div key={vuln.id} className="vuln-item">
                  <input
                    type="checkbox"
                    checked={selectedVulns.includes(vuln.id)}
                    onChange={() => handleSelectVuln(vuln.id)}
                  />
                  <div className="vuln-info">
                    <span className="vuln-name">{vuln.vulnerability_name}</span>
                    <span className="vuln-device">{vuln.device_name || 'Unknown'} ({vuln.device_ip})</span>
                  </div>
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: severityColor(vuln.severity) }}
                  >
                    {vuln.severity}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No vulnerabilities available</p>
            )}
          </div>
        </div>

        {/* Right Side - Report Settings */}
        <div className="report-settings">
          <div className="settings-box">
            <h3>⚙️ Report Settings</h3>

            <div className="form-group">
              <label>Report Title:</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>

            <div className="stats-box">
              <h4>📊 Selected Summary</h4>
              {selectedVulns.length > 0 ? (
                <>
                  <p>Total Selected: <strong>{selectedVulns.length}</strong></p>
                  {[
                    { label: 'CRITICAL', severity: 'CRITICAL' },
                    { label: 'HIGH', severity: 'HIGH' },
                    { label: 'MEDIUM', severity: 'MEDIUM' },
                    { label: 'LOW', severity: 'LOW' }
                  ].map(({ label, severity }) => {
                    const count = selectedVulns.filter(id => {
                      const vuln = vulnerabilities.find(v => v.id === id);
                      return vuln && vuln.severity === severity;
                    }).length;
                    return (
                      count > 0 && (
                        <p key={severity}>
                          <span style={{ color: severityColor(severity) }}>●</span> {label}: <strong>{count}</strong>
                        </p>
                      )
                    );
                  })}
                </>
              ) : (
                <p style={{ color: '#999' }}>No vulnerabilities selected</p>
              )}
            </div>

            <button
              className="btn-generate"
              onClick={generateReport}
              disabled={loading || selectedVulns.length === 0}
            >
              {loading ? '⏳ Generating...' : '📥 Generate PDF Report'}
            </button>
          </div>

          {/* Previous Reports */}
          <div className="previous-reports">
            <h3>📋 Previous Reports</h3>
            {generatedReports.length > 0 ? (
              <div className="reports-list">
                {generatedReports.map(report => (
                  <div key={report.id} className="report-item">
                    <div className="report-info">
                      <p className="report-title">{report.title}</p>
                      <p className="report-date">
                        {new Date(report.created_at).toLocaleDateString()} - {report.vulnerability_count} vulns
                      </p>
                    </div>
                    <button
                      className="btn-download"
                      onClick={() => downloadReport(report.filename)}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>No reports generated yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;