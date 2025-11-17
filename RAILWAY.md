# Deploying to Railway (Docker)

This repository includes a multi-stage `Dockerfile` at the project root that:

- Builds the Frontend (`Frontend/`) using Node
- Builds the Spring Boot backend with Maven and injects the frontend `dist` into `src/main/resources/static`
- Produces a runnable jar and starts it; the server port follows the `PORT` environment variable (Railway)

Files added

- `Dockerfile` — root multi-stage image (frontend build -> maven build -> runtime)
- `Frontend/Dockerfile` — optional standalone frontend image (build + serve)

Local Docker build & run (root combined image)
Powershell example:
`powershell
docker build -t expense-tracker .
docker run -p 8080:8080 -e PORT=8080 expense-tracker
`

Local Docker build & run (frontend-only)
`powershell
docker build -t expense-frontend -f Frontend/Dockerfile Frontend
docker run -p 3000:3000 -e PORT=3000 expense-frontend
`

Railway notes

- Railway provides a `PORT` environment variable; the root `Dockerfile` starts the JVM with `-Dserver.port=${PORT:-8080}` so the app will bind to Railway's port.
- To deploy on Railway using the root `Dockerfile`:
  1. Push this repo to GitHub (or link your repository in Railway).
  2. Create a new Railway project and choose GitHub deployment.
  3. Railway will detect the `Dockerfile` at the repo root and build the Docker image. Set any environment variables (DB credentials, etc.) in the Railway project settings.

If you prefer to deploy frontend and backend as separate services, use `Frontend/Dockerfile` for the UI and the root `Dockerfile` (or a variant) for the backend.

Troubleshooting

- If your backend build requires additional files (custom Maven profiles, parent modules), adjust the Dockerfile `COPY` steps to include them.
- If the frontend `build` output directory is not `dist`, update the Dockerfile copy paths accordingly.
