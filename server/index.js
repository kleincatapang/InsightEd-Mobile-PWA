require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- NEW ROUTE: Check by USER ID (The "Gatekeeper") ---
app.get('/api/school-by-user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    // We search the 'submitted_by' column for the Firebase User ID
    const result = await pool.query('SELECT * FROM school_profiles WHERE submitted_by = $1', [uid]);
    
    if (result.rows.length > 0) {
      res.json({ exists: true, data: result.rows[0] });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error("User Check Error:", err);
    res.status(500).json({ error: "Database check failed" });
  }
});

// --- EXISTING ROUTE: Save School Profile (Unchanged) ---
app.post('/api/save-school', async (req, res) => {
  const data = req.body;
  const query = `
    INSERT INTO school_profiles (
      school_id, school_name, region, province, division, district, 
      municipality, leg_district, barangay, mother_school_id, 
      latitude, longitude, submitted_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (school_id) 
    DO UPDATE SET 
      school_name = EXCLUDED.school_name,
      region = EXCLUDED.region,
      province = EXCLUDED.province,
      division = EXCLUDED.division,
      district = EXCLUDED.district,
      municipality = EXCLUDED.municipality,
      leg_district = EXCLUDED.leg_district,
      barangay = EXCLUDED.barangay,
      mother_school_id = EXCLUDED.mother_school_id,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      submitted_by = EXCLUDED.submitted_by,
      submitted_at = CURRENT_TIMESTAMP;
  `;
  const values = [
    data.schoolId, data.schoolName, data.region, data.province, 
    data.division, data.district, data.municipality, data.legDistrict, 
    data.barangay, data.motherSchoolId, data.latitude, data.longitude, 
    data.submittedBy
  ];

  try {
    await pool.query(query, values);
    res.status(200).json({ message: "Saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// --- Helper Route: Check by School ID (Optional, keeps duplicates away) ---
app.get('/api/check-school/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM school_profiles WHERE school_id = $1', [id]);
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Check failed" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});