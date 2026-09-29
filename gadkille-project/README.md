# Gadkille — Phase 1

Coming-soon frontend + working volunteer registration using Spring Boot and Supabase PostgreSQL.

## Project structure

- `frontend/index.html` — coming-soon homepage
- `frontend/volunteer.html` — working volunteer registration form
- `backend/` — Spring Boot REST API
- `supabase.sql` — database schema
- `originals/` — uploaded source HTML files kept for reference

## Backend environment variables

Set these on the VPS:

```bash
export SUPABASE_JDBC_URL='jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require'
export SUPABASE_DB_USER='postgres'
export SUPABASE_DB_PASSWORD='YOUR_SUPABASE_DATABASE_PASSWORD'
export CORS_ALLOWED_ORIGIN='https://YOUR_DOMAIN'
```

Do not put the database password in frontend code or commit it to Git.

## Run locally

Requires Java 21 and Maven.

```bash
cd backend
mvn spring-boot:run
```

The API will listen on `http://localhost:8080`.

## API

`POST /api/volunteers`

Example JSON:

```json
{
  "fullName": "Test Volunteer",
  "age": 25,
  "phone": "+91 9876543210",
  "email": "test@example.com",
  "district": "Pune",
  "occupation": "Student",
  "interests": ["trek", "history"],
  "availability": "शनिवार-रविवार",
  "trekkingExperience": "नवशिके (पहिल्यांदाच)",
  "about": "मला गडकिल्ल्यांच्या संवर्धनात सहभागी व्हायचे आहे."
}
```

## VPS deployment

Recommended routing:

- `/` → static `frontend/index.html`
- `/volunteer.html` → static volunteer page
- `/api/` → Spring Boot on `127.0.0.1:8080`

Use Nginx for HTTPS and reverse proxying. Keep port 8080 closed to the public.

## Important

The original uploaded volunteer page had a `localhost:8080/api/users` call and a dummy shared password. This package replaces that with a dedicated `POST /api/volunteers` endpoint and does not use the dummy password.
