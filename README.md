Placement Tracker — Full Stack Project
=====================================

Overview
--------
Placement Tracker is a full‑stack app to manage campus placements end‑to‑end:
- MySQL database with procedures, function, triggers, and views
- Node.js + Express backend
- React frontend (Create React App) with Bootstrap styling

Key Features
------------
- Student, Company, Job Position, Application, Interview, Offer management
- Eligibility checks on application (CGPA and Backlogs)
- Auto-generate offer on interview Passed
- Accepting an offer withdraws other applications (trigger)
- Reports: Branch statistics and Company report

Project Structure
-----------------
```
placement-tracker/
├── sql/placement_tracker.sql             # Database schema, seed data, procs, triggers, views
├── backend/                              # Node + Express API
│   ├── index.js
│   ├── db.js
│   ├── package.json
│   └── ...
├── frontend/                             # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── report/                               # Optional: final report & screenshots
└── README.md
```

Prerequisites
-------------
- Node.js 18+ and npm
- MySQL 8.x

1) Database Setup
-----------------
1. Start MySQL and create the database by running the SQL:
   - From a terminal:
     ```
     mysql -u root -p < sql/placement_tracker.sql
     ```
     This creates database `placement_tracker`, tables, sample data, stored procedures, function, triggers, and views.
2. Verify:
   - `SELECT COUNT(*) FROM placement_tracker.Student;`
   - `SELECT * FROM placement_tracker.Offer;`

2) Backend Setup
----------------
1. Configure DB connection in `backend/db.js` if needed:
   ```
   host: '127.0.0.1',
   user: 'root',
   password: 'YOUR_PASSWORD',
   database: 'placement_tracker'
   ```
2. Install and run:
   ```
   cd backend
   npm install
   npm run dev         # or: npm start
   ```
3. Expected logs:
   - `✓ Database connected successfully`
   - `✓ Backend server running on port 4000`

3) Frontend Setup
-----------------
1. Install and run:
   ```
   cd frontend
   npm install
   npm start
   ```
2. Open `http://localhost:3000`

Core API Endpoints (Summary)
----------------------------
- Students:
  - GET `/api/students`
  - POST `/api/students` (also creates academic record if CGPA/Backlogs provided)
  - PUT `/api/students/:id` (updates academic record if CGPA/Backlogs provided)
  - DELETE `/api/students/:id`
- Academic Records:
  - GET `/api/academic-records`
  - POST `/api/academic-records`
  - PUT `/api/academic-records/:studentId`
- Positions / Companies:
  - GET `/api/positions`, POST `/api/positions`
  - GET `/api/companies`, POST `/api/companies`
- Applications:
  - GET `/api/applications`
  - POST `/api/apply` (eligibility enforced)
  - POST `/api/applications` (stored procedure ApplyForPosition)
- Interviews:
  - GET `/api/interviews`
  - POST `/api/schedule_interview`
  - PUT `/api/interviews/:id` (set result Passed/Failed; Passed auto‑generates offer)
  - DELETE `/api/interviews/:id`
- Offers:
  - GET `/api/offers`
  - POST `/api/generate_offer/:applicationId` (generate by application)
  - PUT `/api/offer/:id/accept` (fires trigger to withdraw other applications)
  - PUT `/api/offer/:id/reject`
- Reports:
  - GET `/api/report/branch_stats`
  - GET `/api/report/company`

Database Logic
--------------
- Function:
  - `CheckEligibility(studentId, positionId)` — used by `/api/apply`
- Procedures:
  - `ApplyForPosition`, `ScheduleInterview`, `GenerateOffer`,
    `GetPlacementStatsByBranch`, `GetCompanyPlacementReport`, `UpdateInterviewResult`, `UpdateApplicationStatus`
- Trigger:
  - `after_offer_accepted` — on offer Accepted:
    - Sets the application to Accepted
    - Withdraws other applications for the same student
    - Inserts a comment
- Views:
  - `vw_active_applications`, `vw_placement_summary`, plus named views:
    - `PlacementStatsByBranch`, `CompanyPlacementReport`

Typical Demo Flow
-----------------
1. Add a Student (with CGPA and Backlogs)
2. Apply for a Position from Dashboard (eligibility enforced)
3. Schedule Interview (status becomes “Interview Scheduled”)
4. Mark interview “Passed” (auto‑generates Pending offer)
5. Accept the offer (trigger withdraws other applications)
6. View reports under the Reports tab

Troubleshooting
---------------
- Offers not appearing:
  - Ensure interviews are marked “Passed”
  - Use: `POST /api/maintenance/generate_offers_for_passed`
  - Check: `GET /api/offers`
- Accept offer fails with DB error:
  - Make sure the SQL trigger `after_offer_accepted` is up‑to‑date (no UPDATE on Offer inside the trigger).
  - Re-run `sql/placement_tracker.sql`.
- Eligibility not enforced:
  - Ensure students have academic records (CGPA, Backlogs)
  - `/api/apply` uses `CheckEligibility` and returns reason when Not Eligible

Screenshots & Report (optional)
-------------------------------
Place screenshots and a PDF report in:
```
report/
├── Placement_Tracker_Report.pdf
└── screenshots/
    ├── db_schema.png
    ├── trigger_demo.png
    ├── frontend_dashboard.png
    ├── offer_management.png
    └── placement_report.png
```

License
-------
For academic use. Customize as needed for your submission. 


