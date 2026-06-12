const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Placement Tracker API is running!' });
});


// ==================== STUDENT ENDPOINTS ====================

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Student ORDER BY Student_ID');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new student
app.post('/api/students', async (req, res) => {
  const { Name, Email, Phone, Degree, Branch, CGPA, Backlogs } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Student (Name, Email, Phone, Degree, Branch) VALUES (?, ?, ?, ?, ?)',
      [Name, Email, Phone, Degree, Branch]
    );
    const studentId = result.insertId;
    
    // Create academic record if CGPA and Backlogs are provided
    if (CGPA !== undefined && CGPA !== '' && Backlogs !== undefined && Backlogs !== '') {
      try {
        await pool.query(
          'INSERT INTO Academic_Record (Student_ID, CGPA, Backlogs) VALUES (?, ?, ?)',
          [studentId, parseFloat(CGPA), parseInt(Backlogs)]
        );
      } catch (academicErr) {
        // If academic record creation fails, still return success for student creation
        console.error('Error creating academic record:', academicErr);
      }
    }
    
    res.status(201).json({ message: 'Student created', insertId: studentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a student
app.put('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const { Name, Email, Phone, Degree, Branch, CGPA, Backlogs } = req.body;
  try {
    // Update student info
    const [result] = await pool.query(
      'UPDATE Student SET Name = ?, Email = ?, Phone = ?, Degree = ?, Branch = ? WHERE Student_ID = ?',
      [Name, Email, Phone, Degree, Branch, studentId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Update or create academic record if CGPA and Backlogs are provided
    if (CGPA !== undefined && CGPA !== '' && Backlogs !== undefined && Backlogs !== '') {
      try {
        const [academicCheck] = await pool.query(
          'SELECT COUNT(*) AS cnt FROM Academic_Record WHERE Student_ID = ?',
          [studentId]
        );
        
        if (academicCheck[0].cnt > 0) {
          // Update existing academic record
          await pool.query(
            'UPDATE Academic_Record SET CGPA = ?, Backlogs = ? WHERE Student_ID = ?',
            [parseFloat(CGPA), parseInt(Backlogs), studentId]
          );
        } else {
          // Create new academic record
          await pool.query(
            'INSERT INTO Academic_Record (Student_ID, CGPA, Backlogs) VALUES (?, ?, ?)',
            [studentId, parseFloat(CGPA), parseInt(Backlogs)]
          );
        }
      } catch (academicErr) {
        console.error('Error updating academic record:', academicErr);
      }
    }
    
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM Student WHERE Student_ID = ?', [studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== COMPANY ENDPOINTS ====================

// Get all companies
app.get('/api/companies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Company ORDER BY Company_Name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new company
app.post('/api/companies', async (req, res) => {
  const { Company_Name, Industry, Location } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Company (Company_Name, Industry, Location) VALUES (?, ?, ?)',
      [Company_Name, Industry, Location]
    );
    res.status(201).json({ message: 'Company created', insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== JOB POSITION ENDPOINTS ====================

// Get all job positions
app.get('/api/positions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT jp.*, c.Company_Name
      FROM Job_Position jp
      JOIN Company c ON jp.Company_ID = c.Company_ID
      ORDER BY jp.Position_ID
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new job position
app.post('/api/positions', async (req, res) => {
  const { Company_ID, Role, Eligibility, Package, Min_CGPA, Max_Backlogs } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Job_Position (Company_ID, Role, Eligibility, Package, Min_CGPA, Max_Backlogs) VALUES (?, ?, ?, ?, ?, ?)',
      [Company_ID, Role, Eligibility, Package, Min_CGPA, Max_Backlogs]
    );
    res.status(201).json({ message: 'Position created', insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== APPLICATION ENDPOINTS ====================

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.Application_ID,
        a.Current_Status AS Current_Status,
        a.Date_of_Application,
        s.Student_ID,
        s.Name AS Student_Name,
        s.Branch,
        c.Company_Name,
        jp.Role,
        jp.Package,
        jp.Min_CGPA,
        jp.Max_Backlogs,
        ar.CGPA AS Student_CGPA,
        ar.Backlogs AS Student_Backlogs
      FROM Application_Status a
      JOIN Student s ON a.Student_ID = s.Student_ID
      JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
      JOIN Company c ON jp.Company_ID = c.Company_ID
      LEFT JOIN Academic_Record ar ON s.Student_ID = ar.Student_ID
      ORDER BY a.Application_ID DESC
    `);
    
    // Add eligibility reason for Not Eligible applications
    const rowsWithReasons = rows.map(row => {
      if (row.Current_Status === 'Not Eligible') {
        const reasons = [];
        if (row.Student_CGPA !== null && row.Student_CGPA < row.Min_CGPA) {
          reasons.push(`CGPA ${row.Student_CGPA} < Required ${row.Min_CGPA}`);
        }
        if (row.Student_Backlogs !== null && row.Student_Backlogs > row.Max_Backlogs) {
          reasons.push(`Backlogs ${row.Student_Backlogs} > Allowed ${row.Max_Backlogs}`);
        }
        if (reasons.length === 0) {
          reasons.push('Academic record missing');
        }
        row.Eligibility_Reason = reasons.join('; ');
      }
      return row;
    });
    
    res.json(rowsWithReasons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply for a position (with eligibility check)
app.post('/api/apply', async (req, res) => {
  const { Student_ID, Position_ID } = req.body;
  try {
    // Check eligibility using the CheckEligibility function
    const [eligibilityRows] = await pool.query(
      'SELECT CheckEligibility(?, ?) AS isEligible',
      [Student_ID, Position_ID]
    );
    
    const isEligible = eligibilityRows[0]?.isEligible === 1 || eligibilityRows[0]?.isEligible === true;
    
    // Get student and position details for better error messages
    const [studentRows] = await pool.query(
      'SELECT ar.CGPA, ar.Backlogs FROM Academic_Record ar WHERE ar.Student_ID = ?',
      [Student_ID]
    );
    
    const [positionRows] = await pool.query(
      'SELECT Min_CGPA, Max_Backlogs FROM Job_Position WHERE Position_ID = ?',
      [Position_ID]
    );
    
    if (studentRows.length === 0) {
      return res.status(400).json({ error: 'Student academic record not found. Please add CGPA and backlogs first.' });
    }
    
    if (positionRows.length === 0) {
      return res.status(400).json({ error: 'Position not found' });
    }
    
    const student = studentRows[0];
    const position = positionRows[0];
    
    if (!isEligible) {
      // Insert as Not Eligible
      const [result] = await pool.query(
        'INSERT INTO Application_Status (Student_ID, Position_ID, Current_Status) VALUES (?, ?, "Not Eligible")',
        [Student_ID, Position_ID]
      );
      return res.status(201).json({ 
        message: 'Application marked as Not Eligible',
        reason: `Student CGPA (${student.CGPA}) is below required (${position.Min_CGPA}) or backlogs (${student.Backlogs}) exceed allowed (${position.Max_Backlogs})`,
        applicationId: result.insertId,
        status: 'Not Eligible'
      });
    }
    
    // Insert as Applied if eligible
    const [result] = await pool.query(
      'INSERT INTO Application_Status (Student_ID, Position_ID, Current_Status) VALUES (?, ?, "Applied")',
      [Student_ID, Position_ID]
    );
    res.status(201).json({ message: 'Application submitted successfully!', applicationId: result.insertId, status: 'Applied' });
  } catch (err) {
    // Handle duplicate application error
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Student has already applied for this position' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Apply via stored procedure
app.post('/api/applications', async (req, res) => {
  const { Student_ID, Position_ID } = req.body;
  try {
    const [rows] = await pool.query('CALL ApplyForPosition(?, ?)', [Student_ID, Position_ID]);
    // rows[0] contains SELECT result from procedure
    const payload = Array.isArray(rows) && rows.length > 0 ? rows[0][0] : { message: 'Applied' };
    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== INTERVIEW ENDPOINTS ====================

// Get all interviews
app.get('/api/interviews', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        s.Name AS Student_Name,
        c.Company_Name,
        jp.Role
      FROM Interview i
      JOIN Application_Status a ON i.Application_ID = a.Application_ID
      JOIN Student s ON a.Student_ID = s.Student_ID
      JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
      JOIN Company c ON jp.Company_ID = c.Company_ID
      ORDER BY i.Date_Time DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule interview
app.post('/api/schedule_interview', async (req, res) => {
  const { Application_ID, Round_Number } = req.body;
  let { Date_Time, Mode } = req.body;
  try {
    // Normalize datetime: convert HTML datetime-local (YYYY-MM-DDTHH:MM) to MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
    if (typeof Date_Time === 'string') {
      Date_Time = Date_Time.replace('T', ' ');
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(Date_Time)) {
        Date_Time = `${Date_Time}:00`;
      }
    }
    const [result] = await pool.query(
      'INSERT INTO Interview (Application_ID, Round_Number, Date_Time, Mode) VALUES (?, ?, ?, ?)',
      [Application_ID, Round_Number, Date_Time, Mode]
    );
    res.status(201).json({ message: 'Interview scheduled', interviewId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update interview result via procedure
app.put('/api/interviews/:id', async (req, res) => {
  const interviewId = req.params.id;
  const { Result } = req.body;
  try {
    const [rows] = await pool.query('CALL UpdateInterviewResult(?, ?)', [interviewId, Result]);
    // If result is Passed, auto-generate offer for the interview's application (idempotent)
    if (Result === 'Passed') {
      const [appRows] = await pool.query('SELECT Application_ID FROM Interview WHERE Interview_ID = ?', [interviewId]);
      if (appRows.length) {
        const applicationId = appRows[0].Application_ID;
        // Use the same logic as the offer fallback route
        const [existsRows] = await pool.query('SELECT COUNT(*) AS cnt FROM Offer WHERE Application_ID = ?', [applicationId]);
        if (!(existsRows[0]?.cnt > 0)) {
          const [infoRows] = await pool.query(
            `SELECT jp.Company_ID, jp.Position_ID, jp.Package
             FROM Application_Status a
             JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
             WHERE a.Application_ID = ?`,
            [applicationId]
          );
          if (infoRows.length) {
            const { Company_ID, Position_ID, Package } = infoRows[0];
            await pool.query(
              'INSERT INTO Offer (Application_ID, Company_ID, Position_ID, Package, Offer_Status) VALUES (?, ?, ?, ?, "Pending")',
              [applicationId, Company_ID, Position_ID, Package]
            );
            await pool.query('UPDATE Application_Status SET Current_Status = "Offered" WHERE Application_ID = ?', [applicationId]);
          }
        }
      }
    }
    // If result is Failed, update application status to Rejected
    if (Result === 'Failed') {
      await pool.query(
        'UPDATE Application_Status SET Current_Status = "Rejected" WHERE Application_ID = (SELECT Application_ID FROM Interview WHERE Interview_ID = ?)',
        [interviewId]
      );
    }
    const payload = Array.isArray(rows) && rows.length > 0 ? rows[0][0] : { message: 'Interview updated' };
    res.json(payload);
  } catch (err) {
    // Fallback: if procedure isn't available, perform direct update
    try {
      await pool.query('UPDATE Interview SET Result = ? WHERE Interview_ID = ?', [Result, interviewId]);
      if (Result === 'Failed') {
        await pool.query(
          'UPDATE Application_Status SET Current_Status = "Rejected" WHERE Application_ID = (SELECT Application_ID FROM Interview WHERE Interview_ID = ?)',
          [interviewId]
        );
      }
      // If Passed, auto-generate offer
      if (Result === 'Passed') {
        const [appRows] = await pool.query('SELECT Application_ID FROM Interview WHERE Interview_ID = ?', [interviewId]);
        if (appRows.length) {
          const applicationId = appRows[0].Application_ID;
          const [existsRows] = await pool.query('SELECT COUNT(*) AS cnt FROM Offer WHERE Application_ID = ?', [applicationId]);
          if (!(existsRows[0]?.cnt > 0)) {
            const [infoRows] = await pool.query(
              `SELECT jp.Company_ID, jp.Position_ID, jp.Package
               FROM Application_Status a
               JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
               WHERE a.Application_ID = ?`,
              [applicationId]
            );
            if (infoRows.length) {
              const { Company_ID, Position_ID, Package } = infoRows[0];
              await pool.query(
                'INSERT INTO Offer (Application_ID, Company_ID, Position_ID, Package, Offer_Status) VALUES (?, ?, ?, ?, "Pending")',
                [applicationId, Company_ID, Position_ID, Package]
              );
              await pool.query('UPDATE Application_Status SET Current_Status = "Offered" WHERE Application_ID = ?', [applicationId]);
            }
          }
        }
      }
      return res.json({ message: 'Interview result updated' });
    } catch (err2) {
      return res.status(500).json({ error: err2.message });
    }
  }
});

// Delete interview
app.delete('/api/interviews/:id', async (req, res) => {
  const interviewId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM Interview WHERE Interview_ID = ?', [interviewId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Interview not found' });
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== OFFER ENDPOINTS ====================

// Get all offers
app.get('/api/offers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.*,
        s.Name AS Student_Name,
        s.Branch,
        c.Company_Name,
        jp.Role
      FROM Offer o
      JOIN Application_Status a ON o.Application_ID = a.Application_ID
      JOIN Student s ON a.Student_ID = s.Student_ID
      JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
      JOIN Company c ON jp.Company_ID = c.Company_ID
      ORDER BY o.Offer_ID DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate offer
app.post('/api/generate_offer', async (req, res) => {
  const { Application_ID, Company_ID, Position_ID, Package } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Offer (Application_ID, Company_ID, Position_ID, Package, Offer_Status) VALUES (?, ?, ?, ?, "Pending")',
      [Application_ID, Company_ID, Position_ID, Package]
    );
    res.status(201).json({ message: 'Offer created', offerId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate offer by Application_ID via stored procedure (no other inputs needed)
app.post('/api/generate_offer/:applicationId', async (req, res) => {
  const applicationId = req.params.applicationId;
  try {
    const [rows] = await pool.query('CALL GenerateOffer(?)', [applicationId]);
    const payload = Array.isArray(rows) && rows.length > 0 ? rows[0][0] : { message: 'Offer generated' };
    res.status(201).json(payload);
  } catch (err) {
    // Fallback path: generate offer without stored procedure
    try {
      // If offer already exists, return a friendly message
      const [existsRows] = await pool.query('SELECT COUNT(*) AS cnt FROM Offer WHERE Application_ID = ?', [applicationId]);
      if (existsRows[0]?.cnt > 0) {
        return res.json({ message: 'Offer already exists for this application' });
      }

      // Get company, position, package from the application/position
      const [infoRows] = await pool.query(
        `SELECT jp.Company_ID, jp.Position_ID, jp.Package
         FROM Application_Status a
         JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
         WHERE a.Application_ID = ?`,
        [applicationId]
      );
      if (!infoRows.length) {
        return res.status(404).json({ error: 'Application not found' });
      }
      const { Company_ID, Position_ID, Package } = infoRows[0];

      const [result] = await pool.query(
        'INSERT INTO Offer (Application_ID, Company_ID, Position_ID, Package, Offer_Status) VALUES (?, ?, ?, ?, "Pending")',
        [applicationId, Company_ID, Position_ID, Package]
      );

      // Update application status to Offered
      await pool.query('UPDATE Application_Status SET Current_Status = "Offered" WHERE Application_ID = ?', [applicationId]);

      return res.status(201).json({ message: 'Offer generated successfully!', offerId: result.insertId });
    } catch (err2) {
      return res.status(500).json({ error: err2.message });
    }
  }
});

// Maintenance: generate offers for all PASSED interviews without an offer
app.post('/api/maintenance/generate_offers_for_passed', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT a.Application_ID
      FROM Interview i
      JOIN Application_Status a ON i.Application_ID = a.Application_ID
      LEFT JOIN Offer o ON o.Application_ID = a.Application_ID
      WHERE i.Result = 'Passed' AND o.Offer_ID IS NULL
    `);

    let created = 0;
    for (const r of rows) {
      const applicationId = r.Application_ID;
      const [infoRows] = await pool.query(
        `SELECT jp.Company_ID, jp.Position_ID, jp.Package
         FROM Application_Status a
         JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
         WHERE a.Application_ID = ?`,
        [applicationId]
      );
      if (!infoRows.length) continue;
      const { Company_ID, Position_ID, Package } = infoRows[0];
      await pool.query(
        'INSERT INTO Offer (Application_ID, Company_ID, Position_ID, Package, Offer_Status) VALUES (?, ?, ?, ?, "Pending")',
        [applicationId, Company_ID, Position_ID, Package]
      );
      await pool.query('UPDATE Application_Status SET Current_Status = "Offered" WHERE Application_ID = ?', [applicationId]);
      created += 1;
    }
    res.json({ message: `Backfill complete`, offersCreated: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept offer
app.put('/api/offer/:id/accept', async (req, res) => {
  try {
    const offerId = req.params.id;
    
    // First check if offer exists
    const [checkRows] = await pool.query('SELECT Offer_ID, Offer_Status FROM Offer WHERE Offer_ID = ?', [offerId]);
    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    if (checkRows[0].Offer_Status === 'Accepted') {
      return res.json({ message: 'Offer already accepted' });
    }
    
    // Update offer status and response date - trigger will handle withdrawing other applications
    const [result] = await pool.query(
      'UPDATE Offer SET Offer_Status = "Accepted", Response_Date = CURRENT_TIMESTAMP WHERE Offer_ID = ?',
      [offerId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Offer not found or could not be updated' });
    }
    
    res.json({ message: 'Offer accepted successfully! Other applications for this student have been withdrawn.' });
  } catch (err) {
    console.error('Accept offer error:', err);
    // Return more detailed error message
    res.status(500).json({ 
      error: err.message || 'Failed to accept offer',
      details: err.sqlMessage || 'Database error occurred'
    });
  }
});

// Reject offer
app.put('/api/offer/:id/reject', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE Offer SET Offer_Status = "Rejected" WHERE Offer_ID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Offer not found' });
    res.json({ message: 'Offer rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== REPORT ENDPOINTS ====================

// Get branch-wise placement statistics
app.get('/api/report/branch_stats', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL GetPlacementStatsByBranch()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get company placement report
app.get('/api/report/company', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL GetCompanyPlacementReport()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==================== ACADEMIC RECORDS ENDPOINTS ====================

// Get academic records
app.get('/api/academic-records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Academic_Record ORDER BY Record_ID');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create academic record
app.post('/api/academic-records', async (req, res) => {
  const { Student_ID, CGPA, Backlogs } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Academic_Record (Student_ID, CGPA, Backlogs) VALUES (?, ?, ?)',
      [Student_ID, CGPA, Backlogs]
    );
    res.status(201).json({ message: 'Academic record created', recordId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update academic record
app.put('/api/academic-records/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  const { CGPA, Backlogs } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE Academic_Record SET CGPA = ?, Backlogs = ? WHERE Student_ID = ?',
      [CGPA, Backlogs, studentId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Academic record updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`✓ Backend server running on port ${PORT}`);
  console.log(`→ Test at: http://localhost:${PORT}/`);
});
