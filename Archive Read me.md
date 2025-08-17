# Archive Read me

## Project overview
Archives Management System is a MERN stack capstone project that provides a backend API (Node/Express/MongoDB) and a React frontend (Vite). The app stores and tracks archival files and movements and includes user authentication and basic admin features.

## Tech stack
- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend: React, Vite
- Auth: bcryptjs (password hashing)
- Dev tooling: pnpm, nodemon
- Optional: Docker for containerized deployment

## Repository layout (important files)
- `src/` - backend source
  - `src/index.js` - server entrypoint
  - `src/models/` - Mongoose models (`User`, `File`, `Movement`)
  - `src/routes/` - API routes (`auth`, `files`, `movements`)
  - `seedFiles.js`, `seedUsers.js` - example seed scripts
- `frontend/` - React app (Vite)
  - `frontend/package.json` contains `build`/`dev` scripts
- `package.json` - root scripts: `start`, `dev`
- `scripts/postinstall.js` - optional helper to build the frontend during install (may not exist if modified)

## Environment variables
Set the following environment variables before running the app:
- `MONGODB_URI` - MongoDB connection string (required)
- `PORT` - (optional) port to run the Express server (defaults to 5000)

Important: Do NOT commit secrets (Mongo credentials) to source control. Use environment variables or secret managers.

## Local setup (development)
1. Install dependencies (root and frontend):

```powershell
pnpm install
pnpm --filter frontend install --frozen-lockfile
```

2. Run backend in development mode (nodemon):

```powershell
$env:MONGODB_URI="your_mongo_uri_here";
pnpm dev
```

3. Run frontend separately (if you prefer):

```powershell
cd frontend
pnpm run dev
```

4. Or build frontend and run the backend to serve static files:

```powershell
pnpm --filter frontend build
$env:MONGODB_URI="your_mongo_uri_here";
pnpm start
```

Visit `http://localhost:5000` for the served frontend (if built) and `http://localhost:5000/api/*` for APIs.

## Docker (quick local test)
If you prefer containerized runs, create a Docker image and run it mapping the port and passing the Mongo URI environment variable.

```powershell
docker build -t archives-management:latest .
docker run -e MONGODB_URI="your_mongo_uri_here" -p 5000:5000 archives-management:latest
```

Notes: The repository may or may not contain a `Dockerfile` depending on edits — if missing, see `DEPLOYMENT.md` or ask me to add one.

## Deployment options
- Render / Railway / Heroku: use Dockerfile or set build commands. Ensure `MONGODB_URI` is configured in the service's environment.
- Azure / AWS / GCP: containerize with Docker and push to the provider's container service or use platform-specific web app services.

If you'd like, I can create a GitHub Actions workflow to build and publish an image to GitHub Container Registry or add provider-specific deploy files.

## API highlights
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/profile`
- Files: routed at `/api/files` (see `src/routes/files.js` for details)
- Movements: routed at `/api/movements`

Use Postman or curl to interact with endpoints. Example login payload:

```json
{ "email": "user@example.com", "password": "secret" }
```

## Seed data
Seed scripts (`src/seedUsers.js`, `src/seedFiles.js`) exist to create sample users and data. Run them with Node after setting `MONGODB_URI`.

```powershell
$env:MONGODB_URI="your_mongo_uri_here"; node src/seedUsers.js
```

## Testing & quality
- Linting is configured in the frontend with ESLint.
- There are no automated tests included by default. I can add a minimal test suite (Jest or vitest) if you want.

## Security & maintenance notes
- Replace any hard-coded database URIs in `src/index.js` with environment variable use only.
- Add a `.env.example` to document required env vars (I can add it).
- Use HTTPS and strong MongoDB user credentials for production.

## Next recommended improvements
- Add CI workflow to build and deploy container images.
- Add E2E tests and API unit tests.
- Improve auth with JWT or session tokens and role-based access controls.

---
If you want I can: add a Dockerfile (if missing), create a GitHub Actions CI for build/deploy, or add a `.env.example`. Tell me which one to do next.
