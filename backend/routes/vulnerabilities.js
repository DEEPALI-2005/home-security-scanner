const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all vulnerabilities
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, d.device_ip, d.device_name, d.device_type
       FROM vulnerabilities v
       LEFT JOIN devices d ON v.device_id = d.id
       ORDER BY v.severity DESC, v.discovered_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
});

// Get vulnerabilities by severity
router.get('/severity/:severity', async (req, res) => {
  try {
    const { severity } = req.params;
    const result = await pool.query(
      `SELECT v.*, d.device_ip, d.device_name
       FROM vulnerabilities v
       LEFT JOIN devices d ON v.device_id = d.id
       WHERE v.severity = $1
       ORDER BY v.discovered_at DESC`,
      [severity]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
});

// Get vulnerability by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*, d.device_ip, d.device_name, s.scan_timestamp
       FROM vulnerabilities v
       LEFT JOIN devices d ON v.device_id = d.id
       LEFT JOIN scans s ON v.scan_id = s.id
       WHERE v.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vulnerability:', error);
    res.status(500).json({ error: 'Failed to fetch vulnerability' });
  }
});

// Create new vulnerability
router.post('/', async (req, res) => {
  try {
    const { 
      scan_id, device_id, port_number, service_name, 
      vulnerability_name, severity, description, remediation_tip, cve_id 
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vulnerabilities 
       (scan_id, device_id, port_number, service_name, vulnerability_name, severity, description, remediation_tip, cve_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [scan_id, device_id, port_number, service_name, vulnerability_name, severity, description, remediation_tip, cve_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vulnerability:', error);
    res.status(500).json({ error: 'Failed to create vulnerability' });
  }
});

module.exports = router;