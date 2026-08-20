# Prescripto — Doctor Appointment Booking System

## A Project Report

**Submitted in partial fulfilment of the requirements for the award of the degree of**

**Bachelor of Technology (B.Tech)**

**in**

**Computer Science & Engineering**

---

| | |
|---|---|
| **Project Title** | Prescripto — Doctor Appointment Booking System |
| **Author** | Tapas Jyoti |
| **Academic Year** | 2025–2026 |
| **Course** | B.Tech CSE |
| **Project Type** | Minor / Major Project |

---

## Certificate

This is to certify that the project report entitled **"Prescripto — Doctor Appointment Booking System"** submitted by **Tapas Jyoti** is a bonafide record of the work carried out under the guidance and supervision during the academic year 2025–2026. The contents of this project have not been submitted to any other University or Institute for the award of any degree or diploma.

| | |
|---|---|
| **Signature of Guide** | _________________________ |
| **Signature of HOD** | _________________________ |
| **Date** | _________________________ |

---

## Declaration

I hereby declare that the project work entitled **"Prescripto — Doctor Appointment Booking System"** is an authentic record of my own work carried out as the requirements of the project for the award of the degree of B.Tech in Computer Science & Engineering.

**Tapas Jyoti**

---

## Acknowledgement

I would like to express my sincere gratitude to my project guide for their invaluable guidance, constructive criticism, and constant encouragement throughout this project. I also extend my heartfelt thanks to the Head of the Department and all faculty members of the Computer Science & Engineering department for providing the resources and environment necessary for the successful completion of this project.

I would also like to thank my family and friends for their unwavering support and encouragement during the development of this system.

---

## Abstract

**Prescripto** is a comprehensive, full-stack web application designed to bridge the gap between patients and healthcare professionals. The platform provides a seamless digital interface for patients to discover specialized doctors, read reviews, and book consultation appointments with secure online payment integration.

The frontend of Prescripto is engineered using **Next.js 14** (App Router) and **React 18**, offering a blazing-fast, SEO-optimized user experience. The user interface is crafted with **Tailwind CSS v4**, ensuring complete responsiveness across all mobile and desktop devices. 

The backend relies on an **Express.js 5** RESTful API connected to a **MongoDB** database via **Mongoose**. This architecture manages a complex set of relationships between Patients, Doctors, Appointments, and Doctor Applications. Authentication is managed securely through JSON Web Tokens (JWT) and bcrypt password hashing.

A significant feature of Prescripto is its multi-role architecture, catering to three distinct user types:
1. **Patients:** Can browse doctors, manage their profiles, and book/pay for appointments using **Razorpay**.
2. **Doctors:** Can apply to join the platform, manage their availability slots, and view upcoming appointments.
3. **Administrators:** Have oversight of the entire system, including the ability to approve or reject doctor applications and monitor platform revenue.

**Keywords:** Next.js, React, Node.js, Express, MongoDB, Healthcare, Appointment Booking, Razorpay, Tailwind CSS.

---

## Table of Contents

1. [Chapter 1 — Introduction](#chapter-1--introduction)
2. [Chapter 2 — Literature Survey](#chapter-2--literature-survey)
3. [Chapter 3 — System Analysis & Feasibility Study](#chapter-3--system-analysis--feasibility-study)
4. [Chapter 4 — System Requirements Specification](#chapter-4--system-requirements-specification)
5. [Chapter 5 — System Design & Architecture](#chapter-5--system-design--architecture)
6. [Chapter 6 — Database Design](#chapter-6--database-design)
7. [Chapter 7 — Backend API & Services](#chapter-7--backend-api--services)
8. [Chapter 8 — Frontend Implementation](#chapter-8--frontend-implementation)
9. [Chapter 9 — Authentication & Security](#chapter-9--authentication--security)
10. [Chapter 10 — Payment Integration (Razorpay)](#chapter-10--payment-integration-razorpay)
11. [Chapter 11 — The Multi-Role Dashboards](#chapter-11--the-multi-role-dashboards)
12. [Chapter 12 — Testing & Validation](#chapter-12--testing--validation)
13. [Chapter 13 — Screenshots & User Interface](#chapter-13--screenshots--user-interface)
14. [Chapter 14 — Deployment & Configuration](#chapter-14--deployment--configuration)
15. [Chapter 15 — Future Enhancements](#chapter-15--future-enhancements)
16. [Chapter 16 — Conclusion](#chapter-16--conclusion)
17. [Chapter 17 — References & Bibliography](#chapter-17--references--bibliography)
18. [Appendix A — Source Code Listings](#appendix-a--source-code-listings)

---

<!-- PAGE BREAK -->

# Chapter 1 — Introduction

## 1.1 Overview

The healthcare industry has seen a massive shift towards digitalization, especially post-pandemic. However, the process of finding the right doctor, checking their availability, and booking a physical or virtual appointment remains tedious in many regions, often requiring phone calls and long waiting times at clinics.

**Prescripto** is built to solve this exact problem. It acts as a centralized marketplace for healthcare services. Patients can filter doctors by specialty (e.g., Cardiologist, Dermatologist, Neurologist), view their experience and consultation fees, and lock in a time slot dynamically.

## 1.2 Problem Statement

Current challenges in the localized healthcare booking sector include:
- **Lack of Transparency:** Patients often do not know a doctor's consultation fee or peer reviews until they visit the clinic.
- **Manual Scheduling Conflicts:** Receptionists managing ledger books often double-book slots or fail to notify patients of cancellations.
- **Payment Friction:** Cash-only or physical card swiping at clinics increases wait times.
- **Onboarding Friction:** Independent doctors struggle to gain digital visibility without joining massive, highly-commissioned corporate hospital networks.

## 1.3 Objectives

The main objectives of the Prescripto project are:
- To build a highly responsive and fast platform using Next.js.
- To create a robust backend that prevents double-booking of specific time slots.
- To implement a Doctor Application pipeline where medical professionals can submit their credentials for admin approval.
- To integrate the Razorpay payment gateway for prepaid consultations.
- To provide separate, secure dashboards for Patients, Doctors, and Admins.
- To utilize Cloudinary for managing and serving user and doctor profile images efficiently.

## 1.4 Scope of the Project

The scope of Prescripto covers:
- **Patient Module:** Registration, Profile Management, Doctor Discovery, Slot Selection, Booking, and Payment.
- **Doctor Module:** Application Submission, Profile editing (fees, bio, specialty), Schedule Management, and Appointment tracking.
- **Admin Module:** Application Approval/Rejection, Doctor Management, and System-wide Appointment oversight.

---

<!-- PAGE BREAK -->

# Chapter 2 — Literature Survey

## 2.1 Existing Systems

### 2.1.1 Practo
Practo is one of the largest platforms for doctor consultations in India. It offers a massive directory of doctors, clinics, and hospitals. While highly successful, its massive scale makes the software architecture highly complex, proprietary, and difficult for smaller clinic consortiums to replicate.

### 2.1.2 Zocdoc
Zocdoc is a dominant player in the US market, focusing heavily on insurance integration alongside appointment booking. 

### 2.1.3 Independent Clinic Websites
Most independent clinics use basic WordPress sites with simple "Contact Us" forms. They lack real-time slot booking and rely on manual follow-ups by the clinic staff.

## 2.2 Technology Survey

### 2.2.1 Next.js 14
Next.js provides Server-Side Rendering (SSR) which is critical for a platform like Prescripto. When a patient searches for a doctor, the search engine optimization (SEO) of that doctor's public profile page is vital for organic traffic. Next.js handles this out of the box better than standard React SPAs.

### 2.2.2 Razorpay
Razorpay provides a comprehensive API for accepting payments in India. Its seamless integration with Node.js and React makes it the ideal choice for handling prepaid consultation fees safely without storing credit card data on our servers.

### 2.2.3 Cloudinary
Medical profiles require clear, high-resolution images. Storing these directly in MongoDB (as Base64) would bloat the database, and storing them on the server disk makes scaling difficult. Cloudinary acts as a dedicated CDN for image hosting.

---

<!-- PAGE BREAK -->

# Chapter 3 — System Analysis & Feasibility Study

## 3.1 Feasibility Study

### 3.1.1 Technical Feasibility
- **Stack**: The MERN stack (specifically using Next.js instead of pure React) is well-suited for dynamic booking platforms.
- **Concurrency**: Preventing double-booking requires database-level checks. MongoDB's atomic operations and document locking mechanisms handle this efficiently.

**Verdict**: Technically feasible.

### 3.1.2 Economic Feasibility
- **Cloud Costs**: Can be hosted on affordable tiers (Vercel for frontend, Render for backend).
- **Payment Gateway**: Razorpay charges a standard per-transaction fee, meaning no upfront costs are required.

**Verdict**: Economically feasible.

### 3.1.3 Operational Feasibility
The platform requires an Admin to verify doctor credentials (degrees, medical council registration) before they are listed publicly. This manual step ensures the platform maintains high quality and trust.

**Verdict**: Operationally feasible with minimal admin overhead.

---

<!-- PAGE BREAK -->

# Chapter 4 — System Requirements Specification

## 4.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Users shall be able to register as Patients. | High |
| FR-02 | Unregistered doctors shall be able to submit an application to join. | High |
| FR-03 | Admins shall be able to approve or reject doctor applications. | High |
| FR-04 | Patients shall be able to filter doctors by specialty. | High |
| FR-05 | Patients shall be able to view a doctor's available time slots. | High |
| FR-06 | Patients shall be able to book an available slot and pay via Razorpay. | High |
| FR-07 | Doctors shall be able to view their upcoming appointments. | High |
| FR-08 | Patients shall be able to leave a review after a completed appointment. | Medium |
| FR-09 | Doctors shall be able to mark an appointment as 'Completed'. | High |

## 4.2 Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-01 | Sensitive data (passwords) must be encrypted using bcrypt. | Security |
| NFR-02 | Payment signatures must be cryptographically verified via HMAC-SHA256. | Security |
| NFR-03 | API endpoints must be protected by Role-Based JWT verification. | Security |
| NFR-04 | The system must prevent two users from booking the same slot simultaneously. | Reliability |

---

<!-- PAGE BREAK -->

# Chapter 5 — System Design & Architecture

## 5.1 High-Level Architecture

Prescripto uses a decoupled Client-Server architecture.

```
┌─────────────────────────────────┐
│         Next.js Frontend        │
│    (App Router, Tailwind CSS)   │
└───────────────┬─────────────────┘
                │ HTTP / REST API
                ▼
┌─────────────────────────────────┐
│        Express.js Backend       │
│  ┌─────────┐ ┌─────────┐ ┌───┐  │
│  │ Auth    │ │ Booking │ │...│  │
│  └─────────┘ └─────────┘ └───┘  │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│          MongoDB Atlas          │
└─────────────────────────────────┘
```

## 5.2 Data Flow Diagram (Booking Process)

```
[Patient] ──(Selects Date & Time Slot)──► [Frontend]
                                              │
[Frontend] ──(POST /api/appointment/book)───► [Backend]
                                              │
[Backend] ──(Check if slot is free)─────────► [MongoDB]
                                              │
[Backend] ──(Generate Razorpay Order)───────► [Razorpay API]
                                              │
[Razorpay] ──(Returns Order ID)─────────────► [Backend]
                                              │
[Backend] ──(Saves Pending Appointment)─────► [MongoDB]
                                              │
[Frontend] ──(Opens Checkout Modal)─────────► [Patient]
                                              │
[Patient] ──(Completes Payment)─────────────► [Razorpay]
                                              │
[Razorpay] ──(Payment Success Callback)─────► [Frontend]
                                              │
[Frontend] ──(POST /api/appointment/verify)─► [Backend]
                                              │
[Backend] ──(Verifies Crypto Signature)─────► [Backend]
                                              │
[Backend] ──(Updates Appt to 'Paid')────────► [MongoDB]
```

---

<!-- PAGE BREAK -->

# Chapter 6 — Database Design

The database relies on MongoDB via Mongoose ODM.

## 6.1 User Model (`userModel.js`)

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "default.png" },
  address: { type: Object, default: { line1: '', line2: '' } },
  gender: { type: String, default: 'Not Selected' },
  dob: { type: String, default: 'Not Selected' },
  phone: { type: String, default: '0000000000' }
}
```

## 6.2 Doctor Model (`doctorModel.js`)

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  fees: { type: Number, required: true },
  address: { type: Object, required: true },
  date: { type: Number, required: true },
  slots_booked: { type: Object, default: {} } // Crucial for availability logic
}
```

## 6.3 Appointment Model (`appointmentModel.js`)

```javascript
{
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true }, // Snapshot of user details
  docData: { type: Object, required: true }, // Snapshot of doctor details
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false }
}
```

## 6.4 Doctor Application Model (`doctorApplicationModel.js`)

Stores temporary applications before admin approval. Once approved, the data is migrated to the `Doctor` collection.

---

<!-- PAGE BREAK -->

# Chapter 7 — Backend API & Services

The Express application manages business logic and routes.

## 7.1 Role-Based Routing Structure

- `/api/user/*`: Routes for patients (booking, profile updates).
- `/api/doctor/*`: Routes for approved doctors (viewing their appointments, completing appointments).
- `/api/admin/*`: High-level routes for the administrator (approving applications, analytics).
- `/api/application/*`: Public routes for doctors to submit applications.

## 7.2 The Slot Booking Logic

To prevent double booking, the `Doctor` model contains a `slots_booked` object.
Structure:
```json
{
  "25_10_2026": ["10:00 AM", "10:30 AM", "11:00 AM"],
  "26_10_2026": ["09:00 AM", "09:30 AM"]
}
```

When a user tries to book, the backend checks:
```javascript
const doctorData = await doctorModel.findById(docId);
let slots_booked = doctorData.slots_booked;

if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
  return res.json({ success: false, message: "Slot not available" });
}
```
If available, the slot is pushed into the array and the document is saved.

## 7.3 Cloudinary Image Uploads

Using `multer`, images are intercepted as form-data, processed, and uploaded via the Cloudinary API.

```javascript
import { v2 as cloudinary } from 'cloudinary';

// ... inside the route ...
const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
const imageUrl = imageUpload.secure_url;
// Save imageUrl to MongoDB
```

---

<!-- PAGE BREAK -->

# Chapter 8 — Frontend Implementation

The frontend utilizes **Next.js 14** with the App Router architecture.

## 8.1 The UI with Tailwind CSS v4

The application employs a clean, clinical aesthetic primarily using white, medical blue, and soft greys. Tailwind CSS ensures utility-first rapid styling. 

```tsx
<div className="flex flex-col md:flex-row gap-5 items-start">
  <img src={doctor.image} className="w-full sm:max-w-72 rounded-lg bg-blue-50" />
  <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white">
    <h1 className="text-2xl font-medium text-gray-900">{doctor.name}</h1>
    <p className="text-gray-600 mt-1">{doctor.degree} - {doctor.speciality}</p>
  </div>
</div>
```

## 8.2 Dynamic Routing

Next.js App Router uses folder-based routing:
- `/app/doctors/page.jsx`: Lists all doctors.
- `/app/appointment/[docId]/page.jsx`: The specific booking page for a single doctor.
- `/app/admin/page.jsx`: The admin dashboard interface.

## 8.3 Context API

Instead of heavy state managers like Redux, Prescripto uses React's native Context API (`AppContext`) to distribute global state such as the authenticated user object, the JWT token, and the global list of doctors (to prevent redundant API calls).

---

<!-- PAGE BREAK -->

# Chapter 9 — Authentication & Security

## 9.1 JWT Implementation

Authentication is handled via JSON Web Tokens. Unlike standard Single Page Apps, since this involves separate dashboards (User, Doctor, Admin), the JWT payload includes role information.

```javascript
const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '7d' });
```

## 9.2 Route Protection Middleware

The Express backend utilizes specific middleware to protect routes.

```javascript
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) return res.json({ success: false, message: 'Not Authorized' });
    
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id; // Inject user ID for the controller
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
```
Similar middleware (`authDoctor`, `authAdmin`) exists for the other roles.

---

<!-- PAGE BREAK -->

# Chapter 10 — Payment Integration (Razorpay)

Prescripto uses Razorpay for processing consultation fees securely.

## 10.1 Order Creation

When a user selects "Pay Now":
1. Backend creates a Razorpay instance.
2. Generates an order with `amount = doctor.fees * 100` (converted to paise).
3. The generated `order_id` is sent to the Next.js frontend.

## 10.2 Signature Verification

Once payment completes on the client side, Razorpay sends back the `razorpay_order_id`, `razorpay_payment_id`, and a `razorpay_signature`.

```javascript
const crypto = require('crypto');

const sign = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSign = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(sign.toString())
  .digest("hex");

if (razorpay_signature === expectedSign) {
  // Payment is authentic
  await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
}
```

---

<!-- PAGE BREAK -->

# Chapter 11 — The Multi-Role Dashboards

## 11.1 Patient Dashboard (`/my-appointments`, `/my-profile`)
- **Profile Management**: Update address, phone, and upload a new profile picture.
- **My Appointments**: A chronological list of upcoming and past appointments. Includes options to "Cancel" or "Pay Online".

## 11.2 Doctor Dashboard (`/doctor/appointments`)
- Authenticated via the doctor's specific login portal.
- Displays a list of patients scheduled for the day.
- Action buttons to mark appointments as "Completed" (which removes the slot lock and flags the appointment as done) or "Cancel" (if an emergency arises).

## 11.3 Admin Dashboard (`/admin`)
- The control center for the platform.
- **Applications**: Review incoming doctor applications (verifying degrees/specialties) and click "Approve" (migrating them to the active Doctor database) or "Reject".
- **Oversight**: View all appointments system-wide and monitor total platform revenue.

---

<!-- PAGE BREAK -->

# Chapter 12 — Testing & Validation

## 12.1 Backend Script Testing
The `backend/scripts/` directory contains multiple test files to validate logic without relying on the UI:
- `test-appts.js`: Tests the booking creation logic and slot locking.
- `test-doctor-api.js`: Tests the doctor application pipeline.
- `seed-doctors.js`: A crucial script that automates populating the database with mock doctors, specialties, and dummy availability slots for UI testing.

## 12.2 Concurrency & Slot Locking
Extensive testing was done to ensure the `slots_booked` object in the Doctor model accurately updates and rejects subsequent booking attempts for the identical timeslot.

## 12.3 API Validation
Postman was used to test all protected routes, ensuring that a user possessing a "patient" JWT cannot access endpoints protected by the `authDoctor` or `authAdmin` middleware.

---

<!-- PAGE BREAK -->

# Chapter 13 — Screenshots & User Interface

*(Note: In the actual physical report, this section would contain high-resolution printed images of the interface).*

### 13.1 Landing Page
A clean, reassuring hero section with a call-to-action to "Book an Appointment". Below it, a grid of specialties (General Physician, Gynecologist, Dermatologist) allowing users to filter doctors instantly.

### 13.2 Doctor Profile & Booking Page
Displays the doctor's image, degree, experience, and fee. Below is a horizontal scrolling date selector, and clicking a date reveals available time chips (e.g., "10:00 AM", "10:30 AM"). Unavailable times are greyed out or hidden.

### 13.3 User "My Appointments" Page
A card-based list of appointments. Shows the doctor's name, the date/time of the appointment, and the payment status tag. A "Pay Here" button appears for pending payments, triggering the Razorpay overlay.

---

<!-- PAGE BREAK -->

# Chapter 14 — Deployment & Configuration

## 14.1 Environment Configuration

The application requires `.env` files for both frontend and backend.

**Backend (`.env`)**:
```env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxx
CLOUDINARY_NAME=xxxxxx
CLOUDINARY_API_KEY=xxxxxx
CLOUDINARY_SECRET_KEY=xxxxxx
```

**Frontend (`.env.local`)**:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
```

## 14.2 Deployment Strategy

- **Frontend:** Next.js applications are best deployed on **Vercel**, which automatically handles the serverless functions required for App Router SSR.
- **Backend:** The Node.js Express API can be deployed on a PaaS like **Render** or **Heroku**.
- **Database:** Hosted on **MongoDB Atlas**.

---

<!-- PAGE BREAK -->

# Chapter 15 — Future Enhancements

While Prescripto is a highly functional MVP, future iterations could include:

1. **Telemedicine (Video Consultations):** Integrating WebRTC or an API like Twilio/Zoom to allow virtual consultations directly within the app.
2. **Prescription Generation:** Allow doctors to generate and send a digital PDF prescription to the user's dashboard after an appointment is marked as "Completed".
3. **Automated Reminders:** Integrate NodeMailer and Twilio to send Email and SMS reminders 24 hours and 1 hour before the scheduled appointment.
4. **Dynamic Slot Generation:** Instead of hardcoded 30-minute intervals, allow doctors to set custom shift times and consultation durations.

---

<!-- PAGE BREAK -->

# Chapter 16 — Conclusion

**Prescripto** successfully digitalizes the doctor appointment booking process, resolving key pain points regarding transparency, manual scheduling errors, and payment friction. 

By leveraging the **MERN stack combined with Next.js**, the application provides an incredibly fast, SEO-friendly experience for patients while offering robust administrative controls. The multi-role architecture ensures that data access is securely compartmentalized between patients, doctors, and administrators using strict JWT middleware.

The integration of external services like **Razorpay** for financial transactions and **Cloudinary** for image asset management demonstrates a deep understanding of modern full-stack web architecture and scalable cloud-based application design.

---

<!-- PAGE BREAK -->

# Chapter 17 — References & Bibliography

1. Next.js App Router Documentation. https://nextjs.org/docs
2. React.js Official Documentation. https://react.dev/
3. Express.js API Reference. https://expressjs.com/
4. MongoDB & Mongoose ODM Documentation. https://mongoosejs.com/
5. Razorpay Node.js & React Integration Guide. https://razorpay.com/docs/
6. Cloudinary Node.js SDK Documentation. https://cloudinary.com/documentation
7. Tailwind CSS Documentation. https://tailwindcss.com/docs
8. JSON Web Tokens (JWT) Implementation. https://jwt.io/

---

<!-- PAGE BREAK -->

# Appendix A — Source Code Listings

## A.1 Appointment Booking Controller (`backend/controllers/userController.js`)

```javascript
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;
    
    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData.available) {
      return res.json({ success: false, message: 'Doctor not available' });
    }

    let slots_booked = docData.slots_booked;

    // Check availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: 'Slot not available' });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select('-password');
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: 'Appointment Booked' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
```

## A.2 Payment Verification Controller (`backend/controllers/userController.js`)

```javascript
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Find appointment and update
      const appointment = await appointmentModel.findOneAndUpdate(
        { "paymentDetails.receipt": razorpay_order_id },
        { payment: true }
      );
      
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
```

---
*End of Document*
