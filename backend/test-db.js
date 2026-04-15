const { Pool } = require('pg');
require('dotenv').config();

console.log('Connecting with:');
console.log('User:', process.env.DB_USER);
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'security_scanner'
});

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ ERROR DETAILS:', err);
  } else {
    console.log('✅ Connected!', result.rows[0]);
  }
  process.exit();
});