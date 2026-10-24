const trafficChart = new Chart(document.getElementById('trafficChart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'RPS',
        data: [],
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.18)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: true
      },
      {
        label: 'Success',
        data: [],
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.10)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: false
      },
      {
        label: 'Errors',
        data: [],
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.10)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#8ea8c6'
        },
        grid: {
          color: 'rgba(255,255,255,0.04)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#8ea8c6'
        },
        grid: {
          color: 'rgba(255,255,255,0.04)'
        }
      }
    }
  }
});

const elements = {
  totalRequests: document.getElementById('totalRequests'),
  rps: document.getElementById('rps'),
  avgLatency: document.getElementById('avgLatency'),
  successRate: document.getElementById('successRate'),
  errorRate: document.getElementById('errorRate'),
  cpuUsage: document.getElementById('cpuUsage'),
  memoryUsage: document.getElementById('memoryUsage'),
  uptime: document.getElementById('uptime'),
  status200: document.getElementById('status200'),
  status400: document.getElementById('status400'),
  status500: document.getElementById('status500')
};

function updateChart(payload) {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  trafficChart.data.labels.push(now);
  trafficChart.data.datasets[0].data.push(payload.rps || 0);
  trafficChart.data.datasets[1].data.push(payload.successRate || 0);
  trafficChart.data.datasets[2].data.push(payload.errorRate || 0);

  const maxPoints = 20;
  if (trafficChart.data.labels.length > maxPoints) {
    trafficChart.data.labels.shift();
    trafficChart.data.datasets[0].data.shift();
    trafficChart.data.datasets[1].data.shift();
    trafficChart.data.datasets[2].data.shift();
  }

  trafficChart.update();
}

async function fetchMetrics() {
  try {
    const response = await fetch('/api/metrics');
    const payload = await response.json();

    elements.totalRequests.textContent = Number(payload.totalRequests).toLocaleString();
    elements.rps.textContent = String(payload.rps);
    elements.avgLatency.textContent = `${payload.averageResponseTime} ms`;
    elements.successRate.textContent = `${payload.successRate}%`;
    elements.errorRate.textContent = `${payload.errorRate}%`;
    elements.cpuUsage.textContent = `${payload.system.cpu}%`;
    elements.memoryUsage.textContent = `${payload.system.memory}%`;
    elements.uptime.textContent = `${payload.uptimeSeconds}s`;
    elements.status200.textContent = payload.statusCounts['200'] || 0;
    elements.status400.textContent = payload.statusCounts['400'] || 0;
    elements.status500.textContent = payload.statusCounts['500'] || 0;

    updateChart(payload);
  } catch (error) {
    console.error('Unable to fetch metrics:', error);
  }
}

fetchMetrics();
setInterval(fetchMetrics, 2000);
