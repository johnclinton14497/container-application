const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const pool = new Pool({
  user: 'postgres',
  host: '104.196.216.21',
  database: 'postgres',
  password: 'admin@123',
  port: 5432,
});

const runMigrationScript = async () => {
  try {
    const exists = await pool.query(
      `SELECT EXISTS (
        SELECT 1
        FROM   information_schema.tables
        WHERE  table_schema = 'public'
        AND    table_name = 'sample_data'
      );`
    );

    if (!exists.rows[0].exists) {
      await pool.query(
        `CREATE TABLE sample_data (
          id serial PRIMARY KEY,
          name VARCHAR(255)
        );`
      );

      await pool.query(
        `INSERT INTO sample_data (name) VALUES
        ('Item 1'),
        ('Item 2'),
        ('Item 3');`
      );

      console.log('Table created and migration script executed successfully.');
    } else {
      console.log('Table already exists, migration script skipped.');
    }
  } catch (error) {
    console.error('Error executing migration script:', error);
  }
};

const addNewData = async () => {
  try {
    await pool.query(
      `INSERT INTO sample_data (name) VALUES
      ('New Item 1'),
      ('New Item 2'),
        ('New Data');`
    );

    console.log('New data added.');
  } catch (error) {
    console.error('Error adding new data:', error);
  }
};

app.get('/api/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sample_data');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  runMigrationScript(); // Run the migration script when the server starts
  addNewData(); // Add new data when the server starts
});

