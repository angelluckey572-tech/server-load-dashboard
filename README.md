# Server Load Dashboard

A lightweight, real-time web app for monitoring server traffic and performance under stress or load testing conditions.

## Features

- Total requests received
- Current requests per second (RPS)
- Average response time in milliseconds
- Success vs. error rate
- Approximate CPU and memory usage
- Dark-mode dashboard with live auto-refreshing charts
- Quick health-check and load-test endpoints

## Tech Stack

- Node.js
- Express
- HTML/CSS/JavaScript
- Chart.js

## Run locally

```bash
npm install
npm start
```

Then open:

```bash
http://localhost:3000
```

## Endpoints

- `GET /` — dashboard UI
- `GET /api/metrics` — live dashboard metrics
- `GET /health` — quick health-check target
- `GET /load-test` — simulated load-test endpoint
- `GET /simulate` — random success/error traffic generator

## Render Deployment

This project is ready to deploy on Render using the included `Procfile`.

1. Push this repository to GitHub.
2. In Render, create a new Web Service.
3. Connect the repository.
4. Use the default Node environment and keep the start command as:

```bash
npm start
```

5. Deploy the service.

The app will automatically use the port provided by Render via `PORT`.
