const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const metrics = {
  totalRequests: 0,
  totalSuccess: 0,
  totalErrors: 0,
  statusCounts: {
    "200": 0,
    "400": 0,
    "404": 0,
    "500": 0
  },
  responseTimes: [],
  lastSecondWindow: [],
  startTime: Date.now(),
  system: {
    cpu: 42,
    memory: 58
  }
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function recordRequest(statusCode, latencyMs) {
  metrics.totalRequests += 1;

  const statusKey = String(statusCode);
  metrics.statusCounts[statusKey] = (metrics.statusCounts[statusKey] || 0) + 1;

  if (statusCode >= 200 && statusCode < 400) {
    metrics.totalSuccess += 1;
  } else {
    metrics.totalErrors += 1;
  }

  metrics.responseTimes.push(latencyMs);
  if (metrics.responseTimes.length > 120) {
    metrics.responseTimes.shift();
  }

  const now = Date.now();
  metrics.lastSecondWindow.push({ ts: now, status: statusCode, latency: latencyMs });
  metrics.lastSecondWindow = metrics.lastSecondWindow.filter((entry) => now - entry.ts < 1000);
}

function getAverageLatency() {
  if (!metrics.responseTimes.length) return 0;
  const total = metrics.responseTimes.reduce((sum, value) => sum + value, 0);
  return Number((total / metrics.responseTimes.length).toFixed(2));
}

function getRps() {
  return metrics.lastSecondWindow.length;
}

function getSystemHealth() {
  const drift = Math.sin(Date.now() / 9000) * 14;
  const cpu = Math.max(18, Math.min(95, Math.round(34 + drift + Math.random() * 20)));
  const memory = Math.max(22, Math.min(92, Math.round(44 + Math.sin(Date.now() / 12000) * 12 + Math.random() * 18)));

  return {
    cpu,
    memory,
    uptime: Math.round((Date.now() - metrics.startTime) / 1000)
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/metrics", (req, res) => {
  const total = metrics.totalRequests || 1;
  const successRate = Number(((metrics.totalSuccess / total) * 100).toFixed(1));
  const errorRate = Number(((metrics.totalErrors / total) * 100).toFixed(1));
  const system = getSystemHealth();

  metrics.system = system;

  res.json({
    totalRequests: metrics.totalRequests,
    rps: getRps(),
    averageResponseTime: getAverageLatency(),
    successRate,
    errorRate,
    statusCounts: metrics.statusCounts,
    system,
    uptimeSeconds: system.uptime
  });
});

app.get("/health", (req, res) => {
  const latencyMs = randomBetween(15, 65);
  const statusCode = Math.random() < 0.95 ? 200 : 500;

  setTimeout(() => {
    recordRequest(statusCode, latencyMs);
    res.status(statusCode).json({
      ok: statusCode === 200,
      message: statusCode === 200 ? "Healthy" : "Error simulated",
      latencyMs,
      statusCode
    });
  }, 25);
});

app.get("/load-test", (req, res) => {
  const latencyMs = randomBetween(40, 180);
  const statusCode = Math.random() < 0.88 ? 200 : Math.random() < 0.5 ? 400 : 500;

  setTimeout(() => {
    recordRequest(statusCode, latencyMs);
    res.status(statusCode).json({
      message: "Load test request processed",
      latencyMs,
      statusCode
    });
  }, 35);
});

app.get("/simulate", (req, res) => {
  const latencyMs = randomBetween(30, 220);
  const statusCode = Math.random() < 0.82 ? 200 : Math.random() < 0.5 ? 400 : 500;

  setTimeout(() => {
    recordRequest(statusCode, latencyMs);
    res.status(statusCode).json({
      status: statusCode < 400 ? "success" : "error",
      latencyMs,
      statusCode
    });
  }, 40);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server load dashboard running at http://localhost:${port}`);
});
