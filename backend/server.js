const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow the specified methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow the specified headers
  next();
});

const pool = new Pool({
  user: 'postgres',
  host: '172.17.0.2', // This is the name of the database service in Docker
  database: 'postgres',
  password: 'mysecretpassword',
  port: 5432,
});

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
});

// Migration Script
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

runMigrationScript();

