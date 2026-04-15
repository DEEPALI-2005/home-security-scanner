const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all networks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, COUNT(d.id) as device_count
       FROM networks n
       LEFT JOIN devices d ON n.id = d.network_id
       GROUP BY n.id
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(500).json({ error: 'Failed to fetch networks' });
  }
});

// Get network by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM networks WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Network not found' });
    }

    const devicesResult = await pool.query(
      'SELECT * FROM devices WHERE network_id = $1',
      [id]
    );

    res.json({
      network: result.rows[0],
      devices: devicesResult.rows
    });
  } catch (error) {
    console.error('Error fetching network:', error);
    res.status(500).json({ error: 'Failed to fetch network' });
  }
});

// Create new network
router.post('/', async (req, res) => {
  try {
    const { user_id, network_name, network_range } = req.body;

    const result = await pool.query(
      `INSERT INTO networks (user_id, network_name, network_range)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, network_name, network_range]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating network:', error);
    res.status(500).json({ error: 'Failed to create network' });
  }
});

module.exports = router;