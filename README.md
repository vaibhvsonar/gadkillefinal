# 🚩 गडकिल्ले संवर्धन प्रतिष्ठान (Gadkille Sanvardhan Pratishthan)

<p align="center">
  <img src="https://raw.githubusercontent.com/vaibhvsonar/gadkillefinal/main/gadkille-project/gadkille-vite/public/images/logo.png" alt="Gadkille Logo" width="120" onerror="this.style.display='none'" />
</p>

<p align="center">
  <strong>गड जपूया • इतिहास जपूया • वारसा पुढील पिढीकडे नेऊया</strong><br>
  <em>Preserving, Documenting, and Celebrating the Historic Forts of Maharashtra</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.10+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Local Setup](#-installation--local-setup)
  - [1. Database Setup (Supabase / PostgreSQL)](#1-database-setup-supabase--postgresql)
  - [2. Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
- [Environment Variables](#-environment-variables)
- [REST API Reference](#-rest-api-reference)
- [Data Import & Scripts](#-data-import--scripts)
- [Production Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Gadkille Sanvardhan Pratishthan (गडकिल्ले संवर्धन प्रतिष्ठान)** is a full-featured, dynamic web platform dedicated to the documentation, conservation, and promotion of Maharashtra’s rich heritage of hill, sea, and forest forts (गडकोट).

The platform serves trekkers, historians, students, and conservation volunteers by providing comprehensive fort guides, historical calendars (*Dinvishesh*), volunteer enrollment, expedition registrations, verified e-certificates, interactive mapping, and a centralized administrative dashboard.

---

## ✨ Key Features

### 🏰 1. Comprehensive Forts Directory (गडकिल्ले सूची व तपशील)
- Detailed profiles for historic forts across Maharashtra (Raigad, Rajgad, Sinhagad, Torna, Harishchandragad, Shivneri, Sindhudurg, etc.).
- Fort classification: गिरिदुर्ग (Hill Forts), जलदुर्ग (Sea Forts), भुईकोट (Ground Forts), and वनदुर्ग (Forest Forts).
- Detailed trek information: Difficulty level, trek time, distance, best season, water availability, nearest railway stations/bus stands, routes, and dos & don’ts.
- High-resolution photo galleries and historical context.

### 🗓️ 2. Historical Dinvishesh Calendar (ऐतिहासिक दिनविशेष)
- Day-wise and month-wise historical events from the Maratha Empire and Chhatrapati Shivaji Maharaj's era.
- Searchable dates with event titles, detailed summaries, and significance.
- Automated data import utilities for historical datasets.

### 🤝 3. Volunteer Network & Conservation Campaigns (स्वयंसेवक चळवळ)
- Online volunteer registration categorized by district, skills (history, trekking, medical, photography, restoration), and availability.
- Upcoming and past conservation expeditions (स्वच्छता मोहिमा, वृक्षारोपण, तटबंदी संवर्धन).
- Event registration and RSVP workflow.

### 📜 4. E-Certificate Verification System (प्रमाणपत्र पडताळणी)
- Digital certificate generation for volunteers, students, and campaign participants.
- Instant public certificate lookup and authenticity verification by Certificate ID.

### 🎓 5. Student & Education Portal (विद्यार्थी व शैक्षणिक विभाग)
- Student registration and dedicated student dashboard.
- Educational materials, heritage quizzes, and participation history tracking.

### 🗺️ 6. Interactive Geographical Fort Map (नकाशा)
- MapLibre GL based interactive map plotting forts across various districts of Maharashtra.
- Quick preview cards with direct navigation to fort detail pages.

### 🏛️ 7. Organizations & Partner Directory (संस्था व गड संघटना)
- Profiles of affiliated fort conservation NGOs, trekking clubs, and student organizations.

### 🛡️ 8. Dynamic Admin Dashboard (प्रशासन नियंत्रण कक्ष)
- 100% dynamic administration for managing:
  - Forts catalog & trek parameters
  - Historical Dinvishesh entries
  - Events, projects, news, and announcements
  - Volunteer registrations & contacts
  - Donation tracking and transparency reports
  - Certificate issuance & template configurations
  - Team members & affiliated organizations
  - Image uploads to Supabase Object Storage / local storage

---

## 🛠 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│              Client (Browser / Mobile)                  │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON
                             ▼
┌─────────────────────────────────────────────────────────┐
│        Frontend: React 19 + Vite 6 + TypeScript         │
│     (Tailwind CSS v4 • Lucide Icons • MapLibre GL)      │
└────────────────────────────┬────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Backend: FastAPI (Python 3.10+)            │
│       (Uvicorn • Pydantic v2 • Supabase Python SDK)     │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────────┐ ┌────────────────────────┐
│  Supabase PostgreSQL (Cloud) │ │ Supabase Storage /     │
│   (Tables, Policies, UUIDs)  │ │ Local Image Uploads    │
└──────────────────────────────┘ └────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons & Maps** | [Lucide React](https://lucide.dev/), [MapLibre GL](https://maplibre.org/) |
| **SEO & Routing** | [React Router v7](https://reactrouter.com/), [React Helmet Async](https://github.com/staylor/react-helmet-async) |
| **Backend API** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| **ASGI Server** | [Uvicorn](https://www.uvicorn.org/) |
| **Validation & Settings** | [Pydantic v2](https://docs.pydantic.dev/), `pydantic-settings` |
| **Database & SDK** | [Supabase](https://supabase.com/) (PostgreSQL 15+) via `supabase-py` |
| **Storage** | Supabase Storage (`images` bucket) & Local Static Mount (`/uploads`) |

---

## 📁 Repository Structure

```
gadkille/
├── gadkille-project/
│   ├── fastapi-backend/              # FastAPI Python Backend
│   │   ├── config.py                 # Configuration & environment loader
│   │   ├── database.py               # Supabase client, schemas, table managers
│   │   ├── main.py                   # FastAPI application routes & endpoints
│   │   ├── models.py                 # Pydantic schemas (Request / Response)
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── .env.example              # Backend environment variables template
│   │   ├── import_may_dinvishesh.py  # Data import utility for Dinvishesh
│   │   ├── test_all_features.py      # Automated feature test suite
│   │   ├── test_dinvishesh.py        # Dinvishesh API tests
│   │   └── uploads/                  # Local fallback media uploads
│   │
│   ├── gadkille-vite/                # React + Vite Frontend
│   │   ├── public/                   # Static assets, logos, and default imagery
│   │   ├── src/
│   │   │   ├── components/           # Reusable UI components (Navbar, Footer, etc.)
│   │   │   ├── context/              # React Context (SiteContext, Auth)
│   │   │   ├── lib/                  # Helper utilities, API clients, Supabase config
│   │   │   ├── pages/                # Page components:
│   │   │   │   ├── HomePage.tsx      # Landing page & hero banner
│   │   │   │   ├── FortsPage.tsx     # Forts directory & search filters
│   │   │   │   ├── FortDetailPage.tsx# Comprehensive single fort view
│   │   │   │   ├── VolunteerPage.tsx # Volunteer registration form
│   │   │   │   ├── AdminPage.tsx     # Full administrative control dashboard
│   │   │   │   ├── EventsPage.tsx    # Conservation events & expeditions
│   │   │   │   ├── MapPage.tsx       # Interactive MapLibre fort visualizer
│   │   │   │   ├── CertificatePage.tsx# Certificate verification portal
│   │   │   │   ├── PublicPages.tsx   # Dinvishesh, Transparency, News, etc.
│   │   │   │   └── ...
│   │   │   ├── App.tsx               # Main routing table & layouts
│   │   │   ├── index.css             # Tailwind CSS entry & custom styling
│   │   │   └── main.tsx              # Application bootstrap
│   │   ├── package.json              # Node dependencies and scripts
│   │   ├── tsconfig.json             # TypeScript configuration
│   │   └── vite.config.ts            # Vite bundler configuration
│   │
│   ├── supabase.sql                  # Complete PostgreSQL schema (tables & seed data)
│   ├── supabase_migration.sql        # Database migration script
│   └── README.md                     # Project documentation
└── README.md                         # Root documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
- **Git**: For version control
- **Supabase Account** (or a local PostgreSQL instance): [supabase.com](https://supabase.com/)

---

## 🚀 Installation & Local Setup

### 1. Database Setup (Supabase / PostgreSQL)

1. Log in to your **[Supabase Dashboard](https://supabase.com/dashboard)** and create a new project.
2. Open the **SQL Editor** in Supabase.
3. Copy the contents of `gadkille-project/supabase.sql` and run it to create all required tables (`site_settings`, `forts`, `dinvishesh`, `events`, `projects`, `news`, `volunteers`, `certificates`, `donations`, etc.).
4. (Optional) In **Storage**, create a public bucket named `images` if you wish to use Supabase Storage for uploaded photos.

---

### 2. Backend Setup (FastAPI)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd gadkille-project/fastapi-backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-supabase-service-role-or-anon-key
   DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres?sslmode=require
   PORT=8000
   HOST=0.0.0.0
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   CORS_ALLOWED_ORIGIN=http://localhost:3000,http://localhost:5173,*
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The backend will start at `http://localhost:8000`.
   - Interactive Swagger API docs: `http://localhost:8000/docs`
   - Redoc alternative docs: `http://localhost:8000/redoc`

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd gadkille-project/gadkille-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## 🔐 Environment Variables

### Backend (`gadkille-project/fastapi-backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `SUPABASE_URL` | Supabase project API URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Supabase anon or service-role key | `eyJh...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:...@db.xyz.supabase.co:5432/postgres` |
| `PORT` | API server port | `8000` |
| `HOST` | API host interface | `0.0.0.0` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `admin123` |
| `CORS_ALLOWED_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000,*` |

---

## 📡 REST API Reference

The FastAPI backend exposes modular REST endpoints for all platform capabilities:

| Tag | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service health status and database connectivity check |
| **Admin** | `POST` | `/api/admin/login` | Authenticate administrative user session |
| **Storage** | `POST` | `/api/upload` | Upload images (Base64) to Supabase Storage / Local disk |
| **Settings** | `GET` | `/api/settings` | Get site settings, contact info, statistics, bank details |
| **Settings** | `PUT` | `/api/settings` | Update site settings (Admin) |
| **Forts** | `GET` | `/api/forts` | List all forts with optional district/type/difficulty filters |
| **Forts** | `GET` | `/api/forts/{id}` | Get complete profile of a single fort |
| **Forts** | `POST` | `/api/forts` | Add a new fort entry (Admin) |
| **Forts** | `PUT` | `/api/forts/{id}` | Update existing fort details (Admin) |
| **Forts** | `DELETE`| `/api/forts/{id}` | Delete fort entry (Admin) |
| **Dinvishesh** | `GET` | `/api/dinvishesh` | Fetch historical events by date (`month`, `day`, `date`) |
| **Dinvishesh** | `POST`| `/api/dinvishesh` | Create historical event entry |
| **Events** | `GET` | `/api/events` | List conservation campaigns & expeditions |
| **Events** | `POST`| `/api/events` | Create new campaign or trek event |
| **Events** | `POST`| `/api/events/register` | Register a participant for an event |
| **Volunteers** | `POST`| `/api/volunteers` | Submit volunteer registration application |
| **Volunteers** | `GET` | `/api/volunteers` | List registered volunteers (Admin) |
| **Certificates** | `GET` | `/api/certificates/{id}` | Verify authenticity of a digital certificate |
| **Certificates** | `POST`| `/api/certificates` | Issue a new certificate |
| **Donations** | `POST`| `/api/donations` | Submit donation transaction record |
| **Donations** | `GET` | `/api/donations/summary`| Summary of received funds and transparency details |
| **Students** | `POST`| `/api/students/register` | Register a new student |
| **Students** | `POST`| `/api/students/login` | Student portal login |
| **Organizations** | `GET`| `/api/organizations` | List partner fort conservation organizations |
| **Contacts** | `POST`| `/api/contact` | Submit contact form inquiry |

*For complete request/response schemas, explore the interactive documentation at `http://localhost:8000/docs`.*

---

## 📊 Data Import & Scripts

### 1. Import Historical Dinvishesh Data
Populate the database with curated historical calendar events for Maharashtra's forts:
```bash
cd gadkille-project/fastapi-backend
python import_may_dinvishesh.py
```

### 2. Run Feature & Endpoint Tests
Verify all API endpoints and database interactions:
```bash
cd gadkille-project/fastapi-backend
python test_all_features.py
python test_dinvishesh.py
```

---

## 🚢 Production Deployment

### 1. Build Frontend
Create an optimized production bundle:
```bash
cd gadkille-project/gadkille-vite
npm run build
```
The compiled static assets will be output to `gadkille-project/gadkille-vite/dist`.

### 2. Backend Production Runner
Run FastAPI with multiple Uvicorn workers or Gunicorn:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
```

### 3. Nginx Reverse Proxy Configuration
Example Nginx server block:
```nginx
server {
    listen 80;
    server_name gadkille.org www.gadkille.org;

    # Frontend Single Page Application (SPA)
    location / {
        root /var/www/gadkille/gadkille-vite/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded static media
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
    }
}
```

---

## 🤝 Contributing

We welcome contributions from historians, trekkers, developers, and fort lovers!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <strong>🚩 जय भवानी, जय शिवाजी! 🚩</strong><br>
  <em>Gadkille Sanvardhan Pratishthan — Dedicated to preserving the glorious legacy of Chhatrapati Shivaji Maharaj and the forts of Maharashtra.</em>
</p>
"# gadkille-26" 
