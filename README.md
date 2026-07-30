# ResolveHub — Smart Client Support & Ticket Management Platform

ResolveHub is a full-stack support and ticketing platform that connects **clients**, **support agents**, and **admins** around one shared, transparent pipeline — from the moment an issue is reported to the moment it's resolved.

Built with the **MERN stack** (MongoDB, Express, React, Node.js) with a distinct, professional UI.

---

## ✨ Highlights

- **Marketing landing page** with an animated live ticket-pipeline visualization
- **Role-based dashboards** for Admin, Agent, and Client — each with tailored analytics (Recharts)
- **Dynamic ticket forms** — categories define their own custom fields, so a "Bug Report" form looks different from a "Billing" form
- **Threaded ticket conversations** with agent/admin-only internal notes
- **Full notification history page** plus a live dropdown, for every role
- **Direct messaging** — admins can message any agent or client outside of tickets; agents/clients have a dedicated inbox to reach the admin team
- **Ticket reassignment** — admins can reassign a ticket to a different agent at any time, from the ticket list or the ticket detail page, with both agents notified
- **Admin↔Agent ticket communication** — internal notes on a ticket now notify the other staff side, so admins and agents can coordinate directly on a case
- **Editable user profiles (admin)** — admins can view and edit an agent/client's name, phone, company, and plan; passwords remain owner-only
- **Role-aware chatbot** — behaves differently per role: clients get ticket/warranty/resource help, agents get live workload stats, admins get live org-wide stats (unassigned tickets, critical tickets, team size), all on top of an expanded FAQ set
- **Resource detail view** — click any resource to see its type, assigned client, serial number, subscription ID, and warranty status
- **Resource editing & filtering** — admins can edit any resource's details (name, description, status, serial number, subscription ID, warranty) and filter/search the resource list by type, status, or client
- **WhatsApp-style message receipts** — sent messages show a delivered (grey) double-check that turns blue once the other person reads it; messages can also be edited or deleted after sending
- **Dashboard drill-down** — click any stat card (Total Tickets, Open, Resolved, Critical, Unassigned, Total Clients/Agents...) to jump straight to the matching filtered list
- **Ticket timeline** — every status change, assignment, reply, and reopen is logged and shown as a visual activity feed on each ticket
- **Ticket reopening** — clients can reopen a resolved/closed ticket within 7 days if the issue resurfaces
- **Customer satisfaction (CSAT) ratings** — clients rate resolved tickets 1–5 stars with optional feedback; admins see an org-wide CSAT score and an agent leaderboard, agents see their own average rating
- **SLA escalation** — a background sweep flags tickets that have sat unattended past their priority's SLA window and alerts admins automatically
- **Saved responses** — agents and admins can save reusable reply templates and insert them into ticket replies with one click
- **Announcement system** — admins can broadcast dismissible banners to clients, agents, admins, or everyone, with scheduling and pinning
- **Audit log** — a searchable trail of key admin actions (user management, ticket reassignment, announcements)
- **Global search** — admins get a universal search bar across tickets, users, and resources
- **CSV export** — admins can export the current ticket list (with filters applied) as a CSV report
- **Warranty enforcement** — tickets can't be raised against a resource once its warranty has expired (enforced both in the UI and on the server)
- **Built-in support chatbot** with FAQ matching and live ticket-number tracking
- **Full CRUD admin tools**: agent/client user management, resources, categories, and ticket assignment/triage — admin accounts themselves are managed outside this panel and can't be created, demoted, or deleted from it
- **JWT authentication** with bcrypt password hashing and strict role-based route protection
- **Seed script** with realistic demo data so you can explore immediately

---

## 🗂 Project Structure

```
resolvehub/
├── backend/                 # Node.js + Express + MongoDB API
│   ├── config/               # DB connection
│   ├── controllers/           # Route handler logic
│   ├── middleware/             # Auth guard + error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── seed/                   # Demo data + seed script
│   ├── utils/                  # Helpers (JWT, ticket numbers, notifications)
│   └── server.js               # App entry point
│
└── frontend/                # React (Vite) + Tailwind CSS SPA
    └── src/
        ├── api/                 # Axios instance
        ├── components/          # Landing sections, common UI, chatbot, notifications
        ├── context/             # Auth & notification context providers
        ├── layouts/             # Dashboard & auth shell layouts
        ├── pages/               # Route-level pages (admin/agent/client/shared)
        └── utils/               # Role-based nav config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Backend setup

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed               # populates demo users, resources, categories & tickets
npm run dev                 # starts the API on http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
cp .env.example .env       # defaults to http://localhost:5000/api, adjust if needed
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open **http://localhost:5173** — you'll land on the marketing page. Click **Sign in** to log in.

---

## 🔑 Demo Credentials (after running `npm run seed`)

| Role   | Email                     | Password    |
|--------|---------------------------|-------------|
| Admin  | admin@resolvehub.com      | Admin@123   |
| Agent  | agent1@resolvehub.com     | Agent@123   |
| Client | client1@resolvehub.com    | Client@123  |

The login page also has one-click buttons to autofill these for you.

---

## 🧭 Core Workflows

1. **Client** signs up (or logs in), sees resources assigned to them, and raises a ticket through a guided 4-step wizard: pick a resource → pick a category & subcategory → fill dynamic details → review & submit.
2. **Admin** sees every incoming ticket, assigns it to an agent, and can adjust priority/status at any time. Admins also manage users, resources, and category/field definitions.
3. **Agent** works their assigned queue, replies to clients, leaves internal notes, and updates ticket status as they progress.
4. Everyone gets notified the moment something relevant happens to their tickets.
5. The chatbot in the corner can answer FAQs or look up a ticket's live status by its ticket number (e.g. `TKT-2026-0001`).

---

## 🛠 Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer
**Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, Axios, React Hot Toast, React Icons

---

## 📄 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Client self-registration |
| POST | `/api/auth/login` | Login for any role |
| GET | `/api/tickets` | List tickets (role-scoped, filterable, paginated) |
| POST | `/api/tickets` | Create a ticket (client) |
| PUT | `/api/tickets/:id/assign` | Assign ticket to an agent (admin) |
| PUT | `/api/tickets/:id/status` | Update status/priority (admin/agent) |
| POST | `/api/tickets/:id/messages` | Reply / internal note |
| GET | `/api/tickets/track/:ticketNumber` | Look up ticket by number |
| GET | `/api/analytics/dashboard` | Role-scoped dashboard stats |
| GET/POST | `/api/categories` | Manage ticket categories & dynamic fields |
| GET/POST | `/api/resources` | Manage client resources |
| GET/POST | `/api/users` | Manage agent & client accounts (admin) |
| GET | `/api/notifications` | Full notification history for the logged-in user |
| GET | `/api/messages/conversations` | Admin: list all agent/client conversations |
| GET/POST | `/api/messages/user/:userId` | Admin: read/send messages with a specific user |
| GET/POST | `/api/messages/me` | Agent/Client: read/send messages with the admin team |
| POST | `/api/chatbot/ask` | Chatbot Q&A + ticket tracking |

Full route definitions live under `backend/routes/`.

---

## 📌 Notes

- File attachments upload to `backend/uploads/tickets` and are served statically at `/uploads`.
- All monetary/plan logic (`basic` / `premium`) is a simplified placeholder — extend `User.plan` for real billing logic.
- SLA escalation runs as an in-process timer (every 5 minutes) inside `server.js` — fine for a single server instance; move it to a dedicated worker/cron job if you scale to multiple instances.
- If you had an existing database from before these features were added, re-run `npm run seed` (or manually add sample data) to see saved responses and announcements populated.

## 🗺 Roadmap — not yet implemented

The following were requested as part of a larger enterprise feature set but are deferred to keep this delivery focused and fully working. Roughly ordered by effort:

**Smaller lifts**
- Knowledge Base (self-service FAQ/article portal, separate from the chatbot)
- Printable/PDF ticket view
- Attachment preview inline (images/PDF) instead of download-only links
- Dark mode (would need a theme toggle + `dark:` variants across components)

**Medium lifts**
- Ticket templates (pre-filled category/priority/description for common issues)
- Ticket merge (combine duplicate tickets into one)
- Similar/duplicate ticket detection when creating a new ticket
- Live agent status (online/busy/offline) + workload-based auto-assignment
- Scheduled email reports (would need an email provider integration)
- PDF/Excel export (CSV export is already included)

**Larger lifts**
- Real-time updates via WebSockets/Socket.IO (replacing the current polling model)
- AI-generated reply suggestions and AI priority prediction (needs an LLM API integration, e.g. the Anthropic API)
- Multi-organization support, department management, and custom role/permission management
- Agent leaderboard gamification badges (the underlying leaderboard data already exists on the admin dashboard — badges/rankings UI would build on top of it)
- A full system settings module (configurable SLA rules, email templates, branding)

Happy to build out any of these next — just let me know which matter most for your use case.
