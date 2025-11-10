const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT * FROM Student LIMIT 1');
    console.log('✓ Connection test successful!');
    console.log('Sample student:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection test failed:', err.message);
    process.exit(1);
  }
}

testConnection();