# CareSync

A hospital appointment and patient management system. Patients book appointments online, doctors manage consultations and prescriptions digitally, and admins oversee the entire system — replacing manual registers and paper records.

**Live:** [hospital-gilt-eight.vercel.app](https://hospital-gilt-eight.vercel.app/)

## Tech Stack

React.js · Spring Boot · MySQL · JWT Security

## Features

- Online appointment booking with department and doctor selection
- Queue token system, scoped per doctor per day
- Double-booking prevention (service-layer check + database constraint)
- Role-based access for Patient, Doctor, and Admin
- Digital prescriptions with PDF download
- Automatic bill generation and payment tracking
- Admin dashboard: manage doctors and departments, view all appointments, patients, and reports

## Architecture


React UI → JWT → Spring Security → Controller → Service → Repository → MySQL


## Database

8 tables: users, patients, departments, doctors, appointments, prescriptions, bills, payments.

- users → patients, users → doctors — one-to-one
- departments → doctors, patients/doctors → appointments — one-to-many
- appointments → prescriptions, appointments → bills — one-to-one
- bills → payments — one-to-many

A unique constraint on (doctor_id, appt_date, appt_time) prevents double booking at the database level.


