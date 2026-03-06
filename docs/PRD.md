mkdir -p docs

cat << 'EOF' > docs/PRD.md
# Product Requirement Document

Portal Pendidikan IPT PSSCM

---

# Overview

Portal Pendidikan IPT PSSCM is a centralized learning management system designed for Persatuan Seni Silat Cekak Malaysia IPT chapters.

The platform enables instructors to manage learning materials, assignments, quizzes, and attendance while allowing ahli to participate in structured learning activities.

Each IPT portal operates independently within the same system.

Example portal:

portalipt.silatcekak.org.my/psscmuiam

The system must support approximately 60 IPT portals.

Pilot phase will begin with 4 IPT.

---

# Objectives

Provide structured online learning environment for IPT members.

Centralize course materials and training content.

Allow instructors to manage assignments and quizzes.

Track attendance and learning progress.

---

# Users

## Super Admin

Central administrator of the system.

Responsibilities:

Create IPT portals  
Assign IPT admins  
View system analytics  
Disable IPT portals  

---

## Admin (Penyelia IPT)

Responsible for managing IPT learning portal.

Responsibilities:

Create courses  
Create course weeks  
Enroll ahli  
Enroll tenaga pengajar  
Upload users via CSV  
Manage class schedules  
Monitor submissions  

---

## Tenaga Pengajar

Instructor responsible for delivering course content.

Responsibilities:

Upload course materials  
Create assignments  
Create quizzes  
Grade submissions  
Manage weekly modules  

---

## Ahli

Student enrolled in courses.

Responsibilities:

View learning materials  
Submit assignments  
Take quizzes  
View grades  
View attendance  

---

# Authentication

Users log in using:

IC Number  
Password

Admin creates accounts manually or uploads CSV lists.

---

# Course Structure

Courses are organized into weekly modules.

Example:

Course  
Week 1  
Week 2  
Week 3  

Each week may contain:

Learning materials  
Assignments  
Quizzes  

---

# Learning Materials

Supported types:

PDF documents  
PowerPoint slides  
Videos  
Google Drive links  
YouTube links  

---

# Assignment System

Assignments include:

Title  
Description  
Due date  

Students can submit:

File uploads  
Text responses  

Instructors can provide grades and feedback.

---

# Quiz System

Supported question types:

Multiple choice  
True or false  
Short answer  

Features:

Timer  
Randomized questions  
Automatic grading  

---

# Enrollment

Enrollment is managed by Admin.

Methods:

Manual enrollment  
CSV bulk upload  

---

# Dashboard

Ahli dashboard includes:

My courses  
Recent announcements  
Upcoming assignments  

---

# Notifications

Email notifications will be supported.

Events:

New assignments  
Graded assignments  
New course materials  

SMTP will be configured later.

---

# Attendance Tracking

Instructors can create attendance sessions.

Students are marked:

Present  
Absent  

Attendance history can be viewed by students and admins.

---

# Class Scheduling

Courses can have scheduled training sessions.

Sessions are visible in course pages.

---

# IPT Customization

Each IPT portal supports:

Logo  
Custom color theme  
Banner  

---

# Security

Strict tenant isolation is required.

Each IPT can only access its own data.

Security mechanisms:

Row Level Security  
Role-based permissions  

---

# Performance Targets

Dashboard load time:

Less than 2 seconds.

File upload support:

Up to 100MB per file.

---

# Estimated Usage

Per IPT

Ahli: ~50  
Tenaga Pengajar: ~20  
Courses: 4 to 6  

Target scale

60 IPT portals.

---

# Future Enhancements

Potential future features include:

Mobile app integration  
Certificate generation  
Advanced analytics  
EOF