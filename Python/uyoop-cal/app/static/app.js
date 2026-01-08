
// ===== CONFIGURATION & STATE =====
const API_URL = "";

// State
let currentUser = null;
let dashboardChart = null;
let calendar = null;

// ===== TOKEN MANAGEMENT =====
class TokenManager {
  constructor() {
    this.accessToken = sessionStorage.getItem('access_token');
    this.refreshToken = sessionStorage.getItem('refresh_token');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }

  getAuthHeader() {
    if (!this.accessToken) return {};
    return { 'Authorization': `Bearer ${this.accessToken}` };
  }
}

const tokenManager = new TokenManager();

// ===== FETCH WRAPPER =====
async function apiFetch(url, options = {}) {
  let headers = options.headers || {};
  // Auto-inject Token
  if (tokenManager.accessToken) {
    headers = { ...headers, ...tokenManager.getAuthHeader() };
  }

  // Default Content-Type to JSON if body exists and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 - Try Refresh
  if (response.status === 401 && tokenManager.refreshToken) {
    try {
      console.log("Token expired, trying refresh...");
      const refreshRes = await fetch('/token/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokenManager.refreshToken })
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        tokenManager.setTokens(data.access_token, data.refresh_token);
        // Retry original request
        headers['Authorization'] = `Bearer ${data.access_token}`;
        response = await fetch(url, { ...options, headers });
      } else {
        throw new Error("Refresh failed");
      }
    } catch (e) {
      console.error("Session expired:", e);
      logout();
      return response; // Return original 401
    }
  }

  return response;
}

// ===== UI LOGIC =====

function showView(viewId) {
  // Hide all tab contents
  document.querySelectorAll('main > div').forEach(el => {
    if (!el.classList.contains('hidden')) el.classList.add('hidden');
  });

  // Show target
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('h-full'); // Ensure full height
  }

  // Update Tab Active State
  document.querySelectorAll('.nav-tab').forEach(btn => {
    if (btn.dataset.target === viewId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Special handlers
  if (viewId === 'view-calendar' && calendar) {
    setTimeout(() => calendar.render(), 100); // Fix rendering glitch
  }
}

function updateProfileUI(user) {
  if (!user) return;
  document.getElementById('username-display').textContent = user.username;
  document.getElementById('role-display').textContent = user.role;
}

function logout() {
  tokenManager.clearTokens();
  currentUser = null;
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
}


// ===== DASHBOARD LOGIC =====

function initDashboardChart() {
  const ctx = document.getElementById('dashboardChart');
  if (!ctx) return;

  // Destroy previous instance
  if (dashboardChart) dashboardChart.destroy();

  dashboardChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
      datasets: [{
        label: 'Deployment Activity',
        data: [2, 5, 12, 8, 15, 10, 4],
        borderColor: '#00FF00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#00FF00'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#888' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#888' }
        }
      }
    }
  });
}

async function loadDashboardFeed() {
  const container = document.getElementById('activity-feed');
  container.innerHTML = '<div class="text-muted text-center">Loading...</div>';

  try {
    const res = await apiFetch('/events');
    if (!res.ok) throw new Error("Failed to fetch events");

    const events = await res.json();
    const recentEvents = events.slice(-5).reverse(); // Mock sorting

    container.innerHTML = '';
    recentEvents.forEach(evt => {
      const time = new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let icon = 'ph-calendar-blank';
      if (evt.type === 'git_action') icon = 'ph-git-branch';
      if (evt.type === 'deployment_window') icon = 'ph-rocket';

      const html = `
                <div class="feed-item">
                    <div class="feed-time">${time}</div>
                    <div class="feed-content">
                        <h5 class="text-neon"><i class="ph ${icon}"></i> ${evt.title}</h5>
                        <p>${evt.type} - Created by #${evt.created_by}</p>
                    </div>
                </div>
            `;
      container.insertAdjacentHTML('beforeend', html);
    });
  } catch (e) {
    container.innerHTML = '<div class="text-danger">Error loading feed</div>';
  }
}


// ===== CALENDAR LOGIC =====

async function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    themeSystem: 'standard',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    height: '100%',
    events: async function (info, successCallback, failureCallback) {
      try {
        const res = await apiFetch('/events');
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        // Map to FullCalendar format
        const events = data.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          backgroundColor: getEventColor(e.type),
          borderColor: getEventColor(e.type)
        }));
        successCallback(events);
      } catch (e) {
        failureCallback(e);
      }
    },
    eventClick: function (info) {
      // Placeholder for edit modal
      alert('Event clicked: ' + info.event.title);
    }
  });

  calendar.render();
}

function getEventColor(type) {
  if (type === 'git_action') return '#EB4D4B'; // Red
  if (type === 'deployment_window') return '#00FF00'; // Green
  return '#F0932B'; // Orange (Default)
}


// ===== INIT & EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', async () => {

  // Check if logged in
  if (tokenManager.accessToken && !tokenManager.isTokenExpired()) {
    try {
      // Mock getting profile info or fetch from /users/me if implemented (using stored username for now or generic)
      currentUser = { username: "User", role: "Viewer" }; // Would ideally fetch from an endpoint
      authSuccess();
    } catch (e) { logout(); }
  }

  // Login Form Submit
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const totp = document.getElementById('login-totp').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          totp_code: totp || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || 'Login failed');

      if (data.requires_totp) {
        document.getElementById('login-2fa-section').classList.remove('hidden');
        document.getElementById('login-error').textContent = "2FA Code Required";
        document.getElementById('login-error').classList.remove('hidden');
        return;
      }

      tokenManager.setTokens(data.access_token, data.refresh_token);
      currentUser = data.user;
      authSuccess();

    } catch (e) {
      const errEl = document.getElementById('login-error');
      errEl.textContent = e.message;
      errEl.classList.remove('hidden');
    }
  });

  // Navigation Tabs
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.target);
    });
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', logout);
});

function authSuccess() {
  updateProfileUI(currentUser);
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  // Create new Event Listener for refresh button or similar? No need, auto-load.

  // Init Components
  initDashboardChart();
  loadDashboardFeed();
  initCalendar();

  showView('view-dashboard');
}
