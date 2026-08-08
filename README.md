# Jobfam Mentor Booking Platform

A full-stack web application where candidates can browse mentors, book open time slots, and mentors can approve or decline booking requests. Approved bookings generate a placeholder meeting link and send confirmation emails to both parties via Nodemailer/Ethereal.

---

## 1. Project Overview

The Jobfam Mentor Booking Platform connects candidates seeking career guidance with experienced mentors. Candidates register, browse a list of mentors (filterable by skill), and book any open availability slot. Once a candidate books, the mentor sees the request on their dashboard and can approve or decline it. On approval, both parties receive a confirmation email containing the session time and a placeholder meeting link.

---

## 2. Features

| Feature | Description |
|---------|-------------|
| **Candidate/Mentor authentication** | Register and log in as either a candidate or mentor |
| **JWT authentication** | Stateless token-based auth; token persisted to `localStorage` and sent via `Authorization` header |
| **Role-based authorization** | Backend middleware enforces access per role; frontend hides irrelevant controls |
| **Candidate profiles and skills** | Candidates can set a bio and manage a skills array (add / remove individual tags) |
| **Mentor profiles and expertise tags** | Mentors can set a bio and manage expertise tags (add / remove individual tags) |
| **Mentor availability/slots** | Mentors create future time slots; slots carry an `open / pending / booked` lifecycle |
| **Mentor browsing and skill filtering** | Public mentor list with optional `?skill=` query filter (case-insensitive, backend-side) |
| **Mentor detail page** | Public page showing mentor bio, expertise tags, and all open slots |
| **Booking workflow** | Candidate clicks Book; backend atomically locks the slot to `pending` and creates a `pending` booking |
| **Mentor approval/decline** | Mentor approves (slot → `booked`, booking → `approved`) or declines (slot → `open`, booking → `declined`) |
| **Candidate booking history** | `/my-bookings` lists all a candidate's bookings with live status badges and meeting link on approval |
| **Mentor dashboard** | `/dashboard` shows pending requests with Approve/Decline controls, approved upcoming sessions, and declined history |
| **Placeholder meeting link** | On approval the backend generates `https://meet.jobfam.example/<bookingId>` and stores it on the booking |
| **Ethereal confirmation email** | On approval, Nodemailer sends confirmation HTML emails to both candidate and mentor with the meeting time and link |
| **Redux Toolkit state management** | Auth, profile, mentors, and bookings managed via separate Redux slices with async thunks |
| **React Slick carousel** | Featured mentors section on the `/mentors` page uses a responsive Slick carousel |
| **AOS animation** | Mentor grid cards use `data-aos="fade-up"` scroll animations via the AOS library |

---

## 3. Tech Stack

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI component framework |
| Vite | 5 | Build tool and dev server |
| Redux Toolkit | 2 | Global state management + async thunks |
| React Router | 6 | Client-side routing and protected routes |
| Bootstrap 5 | 5.3 | Responsive grid and component styles |
| SCSS | — | Bootstrap variable overrides and custom styles |
| Axios | 1 | HTTP client; interceptor attaches JWT automatically |
| React Slick | 0.30 | Carousel component for featured mentors |
| AOS | 2 | Scroll-based fade-in animations |

### Backend

| Library | Version | Purpose |
|---------|---------|---------|
| Node.js | 20 | JavaScript runtime |
| Express | 4 | HTTP server and routing |
| MongoDB | Atlas | Document database (hosted) |
| Mongoose | 8 | ODM — schema definition and database access |
| jsonwebtoken | 9 | JWT sign and verify |
| bcryptjs | 2 | Password hashing |
| Nodemailer | 6 | Email sending (Ethereal test transport) |
| Morgan | 1 | HTTP request logging |
| CORS | 2 | Cross-origin request headers |
| dotenv | 16 | Environment variable loading |

---

## 4. Project Structure

```
jobfam-mentor-booking/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── db.js           # MongoDB Atlas connection
│       │   └── mailer.js       # Nodemailer / Ethereal SMTP setup
│       ├── models/
│       │   ├── User.js         # Single user model (candidate + mentor, role field)
│       │   ├── Slot.js         # Mentor availability slot
│       │   └── Booking.js      # Booking linking candidate, mentor, slot
│       ├── controllers/
│       │   ├── authController.js     # register, login
│       │   ├── userController.js     # getMe, updateMe (bio, skills, tags)
│       │   ├── mentorController.js   # getMentors, getMentorById, createSlot, deleteSlot, getSlots
│       │   └── bookingController.js  # createBooking, getMyBookings, approve, decline
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── userRoutes.js
│       │   ├── mentorRoutes.js
│       │   └── bookingRoutes.js
│       ├── middleware/
│       │   ├── auth.js         # verifyToken, requireRole(role)
│       │   └── errorHandler.js # Central Express error handler
│       └── server.js           # Express app entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js        # Axios instance; JWT Authorization interceptor
        ├── app/
        │   └── store.js        # Redux configureStore with all reducers
        ├── features/
        │   ├── auth/
        │   │   └── authSlice.js      # login/register thunks, token+user state, localStorage persistence
        │   ├── profile/
        │   │   └── profileSlice.js   # fetchProfile, updateProfile, createSlot, deleteSlot
        │   ├── mentors/
        │   │   └── mentorsSlice.js   # fetchMentors (skill filter), fetchMentorById, fetchMentorSlots
        │   └── bookings/
        │       └── bookingsSlice.js  # createBooking, fetchMyBookings, approve, decline
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Mentors.jsx         # Browse + Slick carousel + AOS grid
        │   ├── MentorDetail.jsx    # Mentor profile + slots + Book button
        │   ├── Profile.jsx         # Candidate (skills) or Mentor (tags + slot management)
        │   ├── MyBookings.jsx      # Candidate booking history
        │   └── Dashboard.jsx       # Mentor approve/decline dashboard
        ├── components/
        │   ├── Layout.jsx          # Shared page wrapper with Navbar + Footer
        │   └── ProtectedRoute.jsx  # Auth + optional role guard for private routes
        ├── routes/
        │   └── AppRoutes.jsx       # React Router route definitions
        ├── styles/
        │   └── main.scss           # Bootstrap variable overrides + custom utilities
        └── main.jsx                # React root; Redux Provider + Router
```

### Responsibility Summary

| Layer | Responsibility |
|-------|---------------|
| **models** | Mongoose schemas; data shape, validation, pre-save hooks (e.g. password hashing) |
| **controllers** | Business logic; read/write DB, return JSON responses |
| **routes** | Map HTTP methods + paths to controllers; apply auth middleware |
| **middleware** | `verifyToken` validates JWT on every protected request; `requireRole` gates mentor-only / candidate-only routes |
| **Redux features** | Async thunks call the API and update normalised slice state; components read from the store |
| **pages** | Top-level route components; dispatch thunks on mount, read Redux state, render UI |
| **components** | Shared layout (Navbar, Footer, ProtectedRoute) reused across pages |

---

## 5. Core Architecture

### Data Relationships

```
User (role: "candidate" | "mentor")
  │
  ├─ Slot  (mentorId → User._id)
  │    └── status: "open" | "pending" | "booked"
  │
  └─ Booking
       ├── slotId      → Slot._id
       ├── mentorId    → User._id  (mentor)
       ├── candidateId → User._id  (candidate)
       └── status: "pending" | "approved" | "declined"
```

### Booking State Transition

```
 Slot: OPEN
    │
    │  candidate calls POST /api/bookings
    │  (backend atomically locks the slot)
    ▼
 Slot: PENDING   ←──────┐
 Booking: PENDING        │  Mentor declines:
    │                    │  Booking → DECLINED
    │                    │  Slot    → OPEN  (re-released)
    │ Mentor approves:   │
    │ Booking → APPROVED └──────────────────────
    │ Slot    → BOOKED
    │ meetingLink generated on backend
    │ Confirmation emails sent to both parties
    ▼
 Slot: BOOKED
 Booking: APPROVED  (+ meetingLink)
```

The slot is locked to `pending` the moment a candidate submits a booking request, preventing any concurrent double-booking before the mentor decides.

---

## 6. Local Setup

### Repository Structure

```
jobfam-mentor-booking/
├── backend/
└── frontend/
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random secret string>
PORT=5000
```

Start the dev server:

```bash
npm run dev
```

The server starts on `http://localhost:5000`. You will see a MongoDB connected message and an Ethereal SMTP ready message in the console.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

> **Important:** `.env` files are listed in `.gitignore` and must never be committed. They contain secrets that would compromise the application if exposed. The repository includes `frontend/.env.example` as a safe reference template.

---

## 7. MongoDB Setup

This project uses **MongoDB Atlas** (cloud-hosted MongoDB). You will need a free Atlas account and a cluster.

1. Create a free cluster at [https://cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access.
3. Whitelist your IP address (or use `0.0.0.0/0` for development).
4. Copy the connection string from Atlas and set it as `MONGO_URI` in `backend/.env`.

MongoDB will automatically create the database and all collections (`users`, `slots`, `bookings`) the first time the application writes data — no manual schema migration is required.

Do not commit or share your connection string, database username, or password.

---

## 8. Email Setup

The project uses **Nodemailer** with an automatically generated **Ethereal** test SMTP account.

- **No production email service is configured.** This is intentional for a development assessment.
- When the backend starts, it calls `nodemailer.createTestAccount()` to generate a fresh disposable SMTP account and logs the credentials to the console.
- When a mentor approves a booking, the backend sends confirmation HTML emails to **both** the candidate and the mentor.
- Each sent email produces an **Ethereal preview URL** in the backend console (e.g. `https://ethereal.email/message/...`). Open this URL in a browser to view the email exactly as it would appear to the recipient.

Do not commit any Ethereal credentials. They are generated fresh on each backend startup and are disposable.

---

## 9. API Overview

All `/api/bookings` and `/api/users/me` endpoints require a valid JWT in the `Authorization: Bearer <token>` header. Mentor-only and candidate-only endpoints additionally enforce the appropriate role.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user; `role` must be `"candidate"` or `"mentor"` |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/users/me` | Authenticated | Return the current user's profile |
| `PUT` | `/api/users/me` | Authenticated | Update bio; add/remove individual skills (candidate) or expertise tags (mentor) |
| `GET` | `/api/mentors` | Public | List all mentors; supports `?skill=` query for case-insensitive tag filter |
| `GET` | `/api/mentors/:id` | Public | Return a single mentor's profile |
| `POST` | `/api/mentors/slots` | Mentor only | Create a new open availability slot with `startTime` and `endTime` |
| `DELETE` | `/api/mentors/slots/:id` | Mentor only | Delete an open slot (own slots only; rejected if not `open`) |
| `GET` | `/api/mentors/:id/slots` | Public | List open slots for a specific mentor |
| `POST` | `/api/bookings` | Candidate only | Book an open slot; slot immediately transitions to `pending` |
| `GET` | `/api/bookings/mine` | Authenticated | Role-aware: candidates see their own bookings; mentors see requests on their slots |
| `PATCH` | `/api/bookings/:id/approve` | Mentor only | Approve a pending booking; generates meeting link and sends emails |
| `PATCH` | `/api/bookings/:id/decline` | Mentor only | Decline a pending booking; releases the slot back to `open` |

---

## 10. Assessment Assumptions

The following deliberate design choices were made to keep the project scope appropriate for a single-developer assessment:

| Assumption | Rationale |
|------------|-----------|
| **Single `User` model with a `role` field** | Avoids duplicated auth logic across two separate collections; role-based access is enforced in middleware and controllers |
| **Placeholder meeting link** | Real video call integration (Zoom, Google Meet, etc.) is outside the scope of a booking platform MVP |
| **Ethereal test email** | No production email provider or billing account is required to run the project; Ethereal preview links in the console demonstrate the email flow |
| **No payments** | Out of scope |
| **No real-time / WebSocket updates** | Booking status is refreshed on page load; a `pending` booking notification mechanism would require WebSockets or polling |
| **Simple availability slot list** | A full calendar UI (drag-to-create, timezone handling, recurring slots) is a separate product concern |
| **Mobile responsiveness is functional** | Bootstrap 5 grid is used throughout; mobile layout is usable but has not been pixel-polished |
| **Chart.js analytics omitted** | Listed as optional in the specification and omitted to maintain deadline focus |

---

## 11. Testing

The application was manually tested end-to-end. No automated test suite is included.

### Test Scenarios Verified

| Scenario | Verified |
|----------|---------|
| Candidate registration | ✅ |
| Mentor registration | ✅ |
| Login and JWT persistence across page refresh | ✅ |
| Logout clears auth state and token | ✅ |
| Protected routes redirect unauthenticated users to `/login` | ✅ |
| Candidate cannot access `/dashboard` | ✅ |
| Mentor cannot access `/my-bookings` as a candidate booking UI | ✅ |
| Candidate profile update (bio) | ✅ |
| Candidate skill add/remove | ✅ |
| Mentor expertise tag add/remove | ✅ |
| Mentor slot creation | ✅ |
| Mentor slot deletion (own open slots only) | ✅ |
| Mentor browsing (full list) | ✅ |
| Mentor skill filter (`?skill=`) | ✅ |
| Clear filter restores full list | ✅ |
| Mentor detail page (bio, tags, open slots) | ✅ |
| Unauthenticated user sees "Login to Book" | ✅ |
| Candidate sees green "Book" button | ✅ |
| Mentor sees no booking controls | ✅ |
| Candidate books a slot; slot removed from available list | ✅ |
| Candidate's `/my-bookings` shows pending booking | ✅ |
| Mentor dashboard shows pending request | ✅ |
| Mentor approves booking; status → Approved | ✅ |
| Meeting link appears in dashboard and `/my-bookings` | ✅ |
| Ethereal preview URLs printed in backend console on approval | ✅ |
| Mentor declines booking; status → Declined | ✅ |
| Declined slot reappears as open on mentor detail page | ✅ |
| React Slick carousel renders without errors | ✅ |
| AOS fade-up animations fire on scroll | ✅ |

---

## 12. AI / Development Assistance Declaration

This project was built with the assistance of **Antigravity IDE** (powered by a large language model) for scaffolding, implementation, and phase-by-phase development, based on a detailed written specification that I reviewed before each phase. All phases were manually tested end-to-end in a real browser against a live MongoDB Atlas database and a real Node.js backend.

The code structure, data model, state transitions, and API design were reviewed throughout development. I can walk through the architecture, implementation details, and design decisions in a technical discussion.

---

## 13. Known Limitations

- **No real-time updates:** Booking status changes (e.g. mentor approves) are reflected on the candidate's `/my-bookings` page only after the page is loaded or refreshed. WebSocket/polling integration would be needed for live updates.
- **Ethereal is test-only:** Ethereal email accounts are ephemeral and not suitable for production use. A real SMTP provider (SendGrid, Resend, AWS SES) would be needed before going live.
- **Placeholder meeting link:** `https://meet.jobfam.example/<bookingId>` is not a real meeting URL. Integration with a video call API (Zoom, Google Meet) would be a separate implementation effort.
- **No deployment:** The application runs locally only. Production deployment (server hosting, environment secrets management, HTTPS, static file serving) is not included.
- **No automated test suite:** All testing is manual. A proper test suite (Jest + Supertest for the API; React Testing Library for components) would be the next quality improvement.

---

## 14. What I Would Do Next

Given more time, the following improvements would be prioritised:

1. **Automated tests** — API integration tests with Jest/Supertest; component tests with React Testing Library
2. **Real calendar and timezone handling** — Display slot times in the user's local timezone; allow recurring availability
3. **Real video meeting integration** — Generate a real Google Meet or Zoom join URL on booking approval
4. **Production email provider** — Replace Ethereal with SendGrid, Resend, or AWS SES for reliable delivery
5. **Real-time booking status updates** — WebSocket (Socket.IO) notifications so candidates see approval/decline instantly
6. **Deployment and CI/CD** — Containerise with Docker; deploy backend to Railway/Render and frontend to Vercel; add a GitHub Actions pipeline
7. **More comprehensive mobile UX** — Responsive audit and touch-interaction polish

---

## 15. Git / Development History

Development was organised into incremental, phase-by-phase commits:

| Commit | Phase | Description |
|--------|-------|-------------|
| `8ca73bf` | Phase 0 | Project scaffold — monorepo structure, tooling, placeholder pages |
| `9857122` | Phase 1 | User model, JWT auth — register and login endpoints |
| `b2d8d37` | Phase 2 | Profile APIs + mentor calendar (slot creation/deletion) |
| `e919662` | Phase 3 | Booking flow — create, approve, decline, confirmation email |
| `27fc6e6` | Phase 4 | Frontend scaffold — Redux store, Axios, routing, base theme |
| `d691313` | Phase 5 | Login/register pages wired to Redux auth slice |
| `7a85647` | Phase 6 | Candidate + mentor profile pages, mentor slot management |
| `083fb50` | Phase 7 | Browse/filter mentors page with Slick carousel + AOS animation |
| `8b382ef` | Phase 8 | Booking + mentor approve/decline dashboard — core loop complete |
| `6a5ad31` | Phase 10 | Visual polish — Slick carousel fix, input transitions, brand consistency |

Each commit represents a stable, tested state. No commits were squashed or rewritten after being pushed.

---

## 16. Running the Project (Quick Reference)

```bash
# Terminal 1 — Backend
cd jobfam-mentor-booking/backend
npm install
# Add backend/.env (see Section 6)
npm run dev
# → Server on http://localhost:5000

# Terminal 2 — Frontend
cd jobfam-mentor-booking/frontend
npm install
# Add frontend/.env (see Section 6)
npm run dev
# → App on http://localhost:5173
```

Open `http://localhost:5173` in your browser. Register a mentor, register a candidate, and walk through the full booking flow.
