# Docker server setup

This compose setup runs the server side only:

- NestJS backend on `http://localhost:3000`
- FastAPI AI server on `http://localhost:8000`

Expected local folder layout:

```text
graduation-project/
  ai-life-legacy-backend-nestjs/
  ai-life-legacy-ai-fastapi/
  ai-life-legacy-front/
```

Run commands from `ai-life-legacy-backend-nestjs`.

## Start

```powershell
docker compose up --build
```

## Stop

```powershell
docker compose down
```

## Notes

- The backend reads `ai-life-legacy-backend-nestjs/.env`.
- The AI server reads `ai-life-legacy-ai-fastapi/.env`.
- Inside Docker, the backend calls the AI server through `AI_SERVER_URL=http://ai:8000`.
- The Flutter app still runs locally and calls the backend at `localhost:3000`.
