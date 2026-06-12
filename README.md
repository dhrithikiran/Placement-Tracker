# Placement Tracker – Full Stack Placement Management System

## Project Overview

Placement Tracker is a full-stack web application designed to streamline campus placement operations by providing a centralized platform for managing students, companies, applications, interviews, and offers.

The system addresses the challenges faced by placement cells when handling large volumes of placement-related activities through spreadsheets and disconnected workflows. By automating key processes and enforcing business rules at the database level, Placement Tracker improves efficiency, reduces manual errors, and provides better visibility into the placement process.

> **Current Scope:** This application is designed primarily for placement cell administrators. Student-facing functionality is identified as future work.

---

## Key Features

### Company and Position Management

* Add and manage recruiting companies.
* Create and maintain job positions with eligibility criteria.
* Track available opportunities centrally.

### Student and Application Tracking

* Maintain student profiles and academic records.
* Monitor applications throughout the placement lifecycle.
* Enforce eligibility checks using CGPA and backlog requirements.

### Interview Scheduling and Tracking

* Schedule interviews for shortlisted candidates.
* Track interview outcomes.
* Automatically update application states based on interview results.

### Offer Management

* Generate offers for successful candidates.
* Accept or reject offers.
* Automatically withdraw competing applications when an offer is accepted.

### Reporting and Insights

* Branch-wise placement statistics.
* Company placement reports.
* Placement summary views.

### Demo-Ready Experience

* Includes pre-seeded sample data for students, companies, positions, and applications to enable immediate testing and evaluation.

---

## System Workflow

A typical placement workflow consists of the following steps:

1. Placement officers add students and academic records.
2. Companies and job positions are created with eligibility criteria.
3. Eligible students apply for positions.
4. Interviews are scheduled for shortlisted candidates.
5. Interview outcomes are recorded.
6. Successful interviews generate offers automatically.
7. Students accept or reject offers.
8. Acceptance triggers withdrawal of competing applications.
9. Placement officers monitor progress through reports and trackers.

---

## Tech Stack

### Frontend

* React (Create React App)
* Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MySQL 8

### Additional Libraries

* mysql2
* dotenv
* nodemon

---

## Project Structure

```text
placement-tracker/
├── sql/
│   └── placement_tracker.sql
├── backend/
├── frontend/
├── report/
└── README.md
```

---

## Installation & Running the Project

### Prerequisites

* Node.js 18+
* npm
* MySQL 8.x

---

### Database Setup

Import the database schema and seed data:

```bash
mysql -u root -p < sql/placement_tracker.sql
```

This initializes:

* Database schema
* Tables
* Stored procedures
* Functions
* Triggers
* Views
* Sample data

---

### Backend Setup

Create a `.env` file inside the `backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=placement_tracker
```

Install dependencies and start the server:

```bash
cd backend
npm install
npm run dev
```

Expected output:

```text
✓ Database connected successfully
✓ Backend server running on port 4000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Access the application at:

```text
http://localhost:3000
```

---

## Demo/Test Data

The project includes pre-inserted sample records to facilitate quick evaluation without requiring manual setup.

Sample datasets include:

* Students
* Companies
* Job Positions
* Applications
* Interviews
* Offers

---

## Collaborators

* Bhanavi D Reddy

---

## Future Enhancements

### Role-Based Access Control

* Separate placement office and student portals.
* Permission-based functionality.

### Student Portal

* Student authentication.
* View opportunities.
* Apply for positions.
* Accept or reject offers.
* Track application progress.

### Position Management Improvements

* Track remaining open positions.
* Automatically archive positions once vacancies are filled.

### Placement Office Enhancements

* Enhanced application tracker.
* Improved interview scheduler and tracker.
* Student progress dashboards.
* Better usability and workflow support.

### Reporting Improvements

* Standardized statuses and metrics.
* Advanced analytics and placement trends.
* Exportable reports.

---

## Conclusion

Placement Tracker demonstrates how full-stack technologies and database-driven business rules can be combined to digitize and streamline campus recruitment workflows. By automating repetitive tasks, enforcing placement policies, and providing actionable insights, the system offers a practical foundation for modern placement management.

The project highlights real-world concepts including workflow automation, relational database design, trigger-based state management, RESTful API development, and responsive frontend integration.

---

## License

This project was developed for academic purposes and can be extended or customized for institutional use.
