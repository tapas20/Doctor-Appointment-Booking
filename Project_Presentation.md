---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #f8f9fa
color: #212529
---

# Prescripto
## Doctor Appointment Booking System
**B.Tech Major / Minor Project Presentation**

**Presented by:** Tapas Jyoti
**Academic Year:** 2025–2026

---

# 1. Introduction

- **The Healthcare Shift:** Digitalization is transforming how patients access healthcare services globally.
- **The Problem:** Booking appointments at local clinics often involves manual scheduling, double-booking errors, and zero transparency regarding fees or doctor credentials.
- **The Solution:** **Prescripto** is a centralized marketplace connecting patients with specialized doctors, offering real-time slot booking and digital payments.
- **Goal:** To build a robust, scalable, and secure MERN stack platform tailored for healthcare logistics.

---

# 2. Problem Statement & Motivation

### Existing Challenges:
- **Lack of Transparency:** Patients have no visibility into a doctor's fees or reviews prior to visiting.
- **Scheduling Conflicts:** Manual ledgers at reception desks result in overlap and double-booking.
- **Payment Friction:** Cash-dependent systems increase waiting room times.

### Motivation:
To leverage the **Next.js App Router** for superior SEO (crucial for doctor discovery) while demonstrating mastery over complex backend architectures involving multi-role access control and atomic database operations.

---

# 3. Objectives

- **Role-Based Architecture:** Implement secure, distinct dashboards for Patients, Doctors, and Administrators.
- **Concurrency Control:** Prevent double-booking using robust slot-locking mechanisms in MongoDB.
- **Secure Transactions:** Integrate the Razorpay payment gateway for prepaid consultations.
- **High Performance:** Utilize Next.js and Tailwind CSS for a fast, responsive user interface.
- **Cloud Assets:** Offload image hosting to Cloudinary for optimized performance.

---

# 4. Technologies Used (The Modern Stack)

- **Frontend Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS v4
- **Backend API:** Node.js & Express.js 5
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Payments:** Razorpay Integration
- **File Processing:** Multer & Cloudinary SDK

---

# 5. System Architecture

![Architecture](https://via.placeholder.com/800x400.png?text=Next.js+Frontend+|+Express+API+|+MongoDB)

1. **Presentation Layer:** Next.js handling server-side rendering and client UI.
2. **Application Layer:** Express.js processing HTTP requests and enforcing role-based middleware.
3. **Data Layer:** MongoDB managing Users, Doctors, and Appointment states.
4. **External Services:** Razorpay (Payments) and Cloudinary (Image CDN).

---

# 6. Key Features (Patient Module)

1. **Discovery:** Browse and filter doctors by specialized fields (Cardiologist, Neurologist, etc.).
2. **Profile Transparency:** View the doctor's degree, experience, bio, and exact consultation fees.
3. **Real-Time Booking:** Select a date and view only the currently available time slots.
4. **Digital Checkout:** Pay for the consultation seamlessly using the Razorpay overlay.
5. **Dashboard:** Manage personal profile details and view the status of upcoming or past appointments.

---

# 7. Key Features (Doctor & Admin Modules)

### Doctor Module:
- **Application Pipeline:** Unregistered doctors submit their credentials for review.
- **Schedule Management:** View upcoming appointments for the day.
- **Action Controls:** Mark appointments as "Completed" or "Cancel" if emergencies arise.

### Admin Module:
- **Oversight:** Full view of system-wide appointments and revenue generation.
- **Gatekeeping:** Approve or reject incoming doctor applications, ensuring platform quality and trust.

---

# 8. Database Schema (MongoDB)

**Core Collections:**
- **User:** `name`, `email`, `password`, `address`, `dob`, `phone`.
- **Doctor:** `name`, `speciality`, `experience`, `fees`, `slots_booked` (Object managing availability).
- **Appointment:** Links `userId` and `docId`. Stores the `slotDate`, `slotTime`, payment status, and a snapshot of the user/doctor data at the time of booking.
- **DoctorApplication:** Temporary storage for doctors pending admin approval.

---

# 9. Authentication & Security

- **JWT Role-Based Access:** Tokens are signed with specific roles (`patient`, `doctor`, `admin`).
- **Middleware Protection:** Express routes are guarded. For example, `authDoctor` extracts the token, verifies it, and ensures a standard user cannot access the doctor's appointment list.
- **Password Hashing:** `bcrypt` is used to encrypt passwords, ensuring they are never stored in plaintext.

---

# 10. The Double-Booking Challenge

**The Problem:** Two users clicking "Book" on the exact same 10:00 AM slot simultaneously.

**The Solution:**
- The `Doctor` model holds a `slots_booked` object mapped by date.
- During the POST request, the backend fetches the array for `slotDate`.
- `if (slots_booked[slotDate].includes(slotTime))` -> Reject booking.
- If available, it pushes the time into the array and saves the document in a single synchronous flow.

---

# 11. Payment Integration (Razorpay)

1. **Order Creation:** Backend calculates total amount (`fees * 100`) and generates a Razorpay `order_id`.
2. **Client Checkout:** Next.js frontend opens the Razorpay modal. Patient completes payment (UPI/Card).
3. **Callback & Verification:** Razorpay returns a `signature`. The backend uses `crypto.createHmac` with the Secret Key to verify the signature's authenticity.
4. **Confirmation:** If valid, the Appointment document is updated to `payment: true`.

---

# 12. Frontend Excellence (Next.js)

**Why Next.js instead of standard React?**

- **SEO:** Doctor profile pages need to be indexable by Google. Next.js Server-Side Rendering (SSR) ensures meta tags and content are visible to crawlers immediately.
- **Routing:** Folder-based App Router simplifies the creation of the distinct dashboards (`/app/admin`, `/app/doctor`, `/app/my-profile`).
- **Performance:** Optimized image loading and fast page transitions crucial for a medical application.

---

# 13. Handling Medical Imagery (Cloudinary)

- High-quality profile pictures are essential for establishing trust on a medical platform.
- **The Issue:** Saving images as Base64 bloats MongoDB. Saving to the server disk causes scaling issues.
- **The Fix:** Express uses `multer` to intercept image files, uploads them securely to Cloudinary, and saves only the highly-optimized CDN URL to the database.

---

# 14. Context API over Redux

- Given the clear separation of concerns (Patients don't see Admin data), a massive global state manager like Redux was unnecessary.
- **React Context API** (`AppContext`) is used to manage the authenticated user session, token, and the global list of approved doctors efficiently, preventing prop-drilling across the component tree.

---

# 15. Testing & Validation

- **Backend Scripts:** A suite of test scripts (`test-appts.js`, `test-doctor-api.js`) validates slot locking and application pipelines without relying on the UI.
- **API Security:** Postman was used to confirm that cross-role access is denied (e.g., a patient cannot approve a doctor application).
- **Payment Edge Cases:** Tested Razorpay signature verification failure states to ensure unpaid appointments remain marked as "Pending".

---

# 16. Future Enhancements

- **Telemedicine Integration:** Integrate WebRTC or Zoom API to allow video consultations directly within the Prescripto dashboard.
- **Digital Prescriptions:** Allow doctors to generate and send secure PDF prescriptions post-appointment.
- **Automated Reminders:** Implement NodeMailer and Twilio to send Email/SMS notifications 24 hours prior to a booked slot.
- **Dynamic Slot Generation:** Allow doctors to set custom shift durations rather than fixed intervals.

---

# 17. Conclusion

- **Prescripto** successfully digitalizes the localized healthcare booking process, solving pain points around transparency and manual scheduling.
- The project demonstrates advanced architectural planning through its distinct multi-role access control and robust slot-booking concurrency logic.
- The use of the MERN stack with Next.js provides a platform that is not only highly performant but also production-ready for deployment.

---

# 18. Thank You!

### Questions?

**Project:** Prescripto (Doctor Appointment Booking)
**Developer:** Tapas Jyoti

*Codebase available upon request.*
