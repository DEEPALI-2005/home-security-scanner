const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Get all reports
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF report
router.post('/generate', async (req, res) => {
  try {
    const { vulnerabilityIds, title } = req.body;
    
    if (!vulnerabilityIds || vulnerabilityIds.length === 0) {
      return res.status(400).json({ error: 'No vulnerabilities selected' });
    }
    
    // Get vulnerabilities with device info
    const vulnResult = await pool.query(
      `SELECT v.*, d.device_name, d.device_ip 
       FROM vulnerabilities v 
       JOIN devices d ON v.device_id = d.id 
       WHERE v.id = ANY($1)`,
      [vulnerabilityIds]
    );
    
    const vulnerabilities = vulnResult.rows;
    
    if (vulnerabilities.length === 0) {
      return res.status(404).json({ error: 'Vulnerabilities not found' });
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `report_${Date.now()}.pdf`;
    const filepath = path.join(reportsDir, filename);
    
    const stream = fs.createWriteStream(filepath);
    
    // Handle stream errors
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ error: 'Failed to create PDF' });
    });
    
    doc.pipe(stream);
    
    // PDF Header
    doc.fontSize(24).text(title, { align: 'center' });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.fontSize(11).text(`Total Vulnerabilities: ${vulnerabilities.length}`, { align: 'center' });
    doc.moveDown(2);
    
    // Summary by severity
    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    const lowCount = vulnerabilities.filter(v => v.severity === 'LOW').length;
    
    doc.fontSize(14).text('Severity Summary:', { underline: true });
    doc.fontSize(11).text(`🔴 CRITICAL: ${criticalCount}`);
    doc.text(`🟠 HIGH: ${highCount}`);
    doc.text(`🟡 MEDIUM: ${mediumCount}`);
    doc.text(`🟢 LOW: ${lowCount}`);
    doc.moveDown(2);
    
    // Vulnerabilities list
    doc.fontSize(14).text('Detailed Vulnerabilities:', { underline: true });
    doc.moveDown();
    
    vulnerabilities.forEach((vuln, index) => {
      doc.fontSize(12).text(`${index + 1}. ${vuln.vulnerability_name}`, { underline: true });
      doc.fontSize(10)
        .text(`Device: ${vuln.device_name} (${vuln.device_ip})`)
        .text(`Port: ${vuln.port_number} | Service: ${vuln.service_name}`)
        .text(`Severity: ${vuln.severity}`)
        .text(`CVE: ${vuln.cve_id}`)
        .text(`Description: ${vuln.description}`)
        .text(`Remediation: ${vuln.remediation_tip}`);
      doc.moveDown(0.5);
    });
    
    doc.end();
    
    stream.on('finish', async () => {
      try {
        // Save report to database
        await pool.query(
          'INSERT INTO reports (user_id, title, filename, vulnerability_count) VALUES ($1, $2, $3, $4)',
          [req.user.id, title, filename, vulnerabilities.length]
        );
        
        res.json({ message: 'Report generated successfully', filename });
      } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to save report to database' });
      }
    });
    
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download report
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Security check - validate filename format
    if (!filename.match(/^report_\d+\.pdf$/)) {
      return res.status(403).json({ error: 'Invalid filename' });
    }
    
    const filepath = path.join(reportsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }
    
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (err) {
    console.error('Error downloading report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;