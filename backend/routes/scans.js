const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all scans
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, n.network_name, n.network_range
       FROM scans s
       LEFT JOIN networks n ON s.network_id = n.id
       ORDER BY s.scan_timestamp DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scans:', error);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

// Get scan by ID with vulnerabilities
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, n.network_name, n.network_range
       FROM scans s
       LEFT JOIN networks n ON s.network_id = n.id
       WHERE s.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const vulnResult = await pool.query(
      `SELECT * FROM vulnerabilities WHERE scan_id = $1`,
      [id]
    );

    res.json({
      scan: result.rows[0],
      vulnerabilities: vulnResult.rows
    });
  } catch (error) {
    console.error('Error fetching scan:', error);
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

// Create new scan
router.post('/', async (req, res) => {
  try {
    const { network_id, scan_status } = req.body;

    const result = await pool.query(
      `INSERT INTO scans (network_id, scan_status)
       VALUES ($1, $2)
       RETURNING *`,
      [network_id, scan_status || 'in_progress']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating scan:', error);
    res.status(500).json({ error: 'Failed to create scan' });
  }
});

module.exports = router;