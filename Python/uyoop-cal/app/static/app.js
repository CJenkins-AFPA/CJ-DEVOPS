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

      async refreshAccessToken() {
        if (!this.refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const res = await fetch('/token/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: this.refreshToken })
          });

          if (!res.ok) {
            this.clearTokens();
            throw new Error('Token refresh failed');
          }

          const data = await res.json();
          this.setTokens(data.access_token, this.refreshToken);
          return this.accessToken;
        } catch (err) {
          this.clearTokens();
          throw err;
        }
      }

      isTokenExpired() {
        if (!this.accessToken) return true;
        try {
          // Décoder JWT (sans vérifier la signature, juste la structure)
          const parts = this.accessToken.split('.');
          const payload = JSON.parse(atob(parts[1]));
          const exp = payload.exp * 1000; // convertir en millisecondes
          return Date.now() >= exp;
        } catch {
          return true;
        }
      }
    }

    const tokenManager = new TokenManager();

    // ===== FETCH WRAPPER WITH AUTO-REFRESH =====
    async function apiFetch(url, options = {}) {
      let headers = options.headers || {};

      // Ajouter Authorization header
      if (tokenManager.accessToken) {
        headers = { ...headers, ...tokenManager.getAuthHeader() };
      }

      // Vérifier si token est expiré et le refresher si nécessaire
      if (tokenManager.isTokenExpired() && tokenManager.refreshToken) {
        try {
          await tokenManager.refreshAccessToken();
          headers = { ...headers, ...tokenManager.getAuthHeader() };
        } catch (err) {
          console.warn('Token refresh failed:', err);
          // Continuer sans token
        }
      }

      let res = await fetch(url, { ...options, headers });

      // Si 401, essayer de refresh et réessayer
      if (res.status === 401 && tokenManager.refreshToken) {
        try {
          await tokenManager.refreshAccessToken();
          headers = { ...headers, ...tokenManager.getAuthHeader() };
          res = await fetch(url, { ...options, headers });
        } catch (err) {
          console.error('Failed to refresh token on 401:', err);
        }
      }

      return res;
    }

    document.addEventListener('DOMContentLoaded', function () {
      const calendarEl = document.getElementById('calendar');

      const modal = document.getElementById('event-modal');
      const titleInput = document.getElementById('event-title');
      const dateInput = document.getElementById('event-date');
      const startTimeInput = document.getElementById('event-start-time');
      const endTimeInput = document.getElementById('event-end-time');
      const typeSelect = document.getElementById('event-type');
      const cancelBtn = document.getElementById('modal-cancel');
      const saveBtn = document.getElementById('modal-save');
      const tabBoard = document.getElementById('tab-board');
      const tabCalendar = document.getElementById('tab-calendar');
      const tabDashboard = document.getElementById('tab-dashboard');
      const tabMembers = document.getElementById('tab-members');
      const newEventBtn = document.getElementById('btn-new-event');
      const logoutBtn = document.getElementById('btn-logout');
      const loginBtn = document.getElementById('btn-login');
      const btn2FASetup = document.getElementById('btn-2fa-setup');

      const viewCalendar = document.querySelector('div#calendar-wrapper');
      const viewTableau = document.getElementById('view-tableau');
      const viewDashboard = document.getElementById('view-dashboard');
      const viewMembers = document.getElementById('view-members');

      const loginModal = document.getElementById('login-modal');
      const loginUsername = document.getElementById('login-username');
      
      const loginCancel = document.getElementById('login-cancel');
      const loginSubmit = document.getElementById('login-submit');

      const addMemberModal = document.getElementById('add-member-modal');
      const addMemberBtn = document.getElementById('btn-add-member');
      const newMemberUsername = document.getElementById('new-member-username');
      const newMemberRole = document.getElementById('new-member-role');
      const addMemberCancel = document.getElementById('add-member-cancel');
      const addMemberSubmit = document.getElementById('add-member-submit');

      let pendingDate = null;
      let currentUser = null;

      function getUserId() {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return null;
        try {
          const u = JSON.parse(raw);
          return u.id;
        } catch (_) {
          return null;
        }
      }

      function ensureLoggedIn() {
        const uid = getUserId();
        if (!uid) {
          loginModal.classList.remove('hidden');
          return false;
        }
        return true;
      }

      cancelBtn.addEventListener('click', () => {
        resetEventModal();
      });

      // Multi-step event modal logic
      let currentStep = 1;
      const totalSteps = 3;
      const nextBtn = document.getElementById('modal-next');
      const prevBtn = document.getElementById('modal-prev');

      function resetEventModal() {
        modal.classList.add('hidden');
        currentStep = 1;
        updateStepDisplay();
        titleInput.value = '';
        dateInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
        typeSelect.value = 'meeting';
        // Reset all type-specific fields
        document.getElementById('meeting-subtype').value = 'daily';
        document.getElementById('meeting-link').value = '';
        document.getElementById('meeting-notes').value = '';
        document.getElementById('deployment-env').value = 'dev';
        document.getElementById('deployment-services').value = '';
        document.getElementById('deployment-description').value = '';
        document.getElementById('deployment-needs-approval').checked = false;
        document.getElementById('git-repo-url').value = '';
        document.getElementById('git-branch').value = 'main';
        document.getElementById('git-action-type').value = 'clone_or_pull';
        document.getElementById('git-auto-trigger').checked = false;
      }

      function updateStepDisplay() {
        // Update step indicator dots
        document.querySelectorAll('.step-dot').forEach((dot, idx) => {
          const stepNum = idx + 1;
          dot.classList.remove('active', 'completed');
          if (stepNum === currentStep) {
            dot.classList.add('active');
          } else if (stepNum < currentStep) {
            dot.classList.add('completed');
          }
        });

        // Show/hide step content
        for (let i = 1; i <= totalSteps; i++) {
          const stepEl = document.getElementById(`event-step-${i}`);
          if (i === currentStep) {
            stepEl.classList.remove('hidden');
          } else {
            stepEl.classList.add('hidden');
          }
        }

        // Update buttons
        prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
        saveBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';

        // Update type-specific fields visibility on step 2
        if (currentStep === 2) {
          const eventType = typeSelect.value;
          document.querySelectorAll('.type-fields').forEach(el => el.classList.add('hidden'));
          if (eventType === 'meeting') {
            document.getElementById('meeting-fields').classList.remove('hidden');
          } else if (eventType === 'deployment_window') {
            document.getElementById('deployment-fields').classList.remove('hidden');
          } else if (eventType === 'git_action') {
            document.getElementById('git-fields').classList.remove('hidden');
          }
        }

        // Update summary on step 3
        if (currentStep === 3) {
          updateEventSummary();
        }
      }

      function updateEventSummary() {
        const type = typeSelect.value;
        const typeLabels = {
          meeting: 'Réunion',
          deployment_window: 'Fenêtre de déploiement',
          git_action: 'Action Git'
        };

        let summary = `
          <p><strong>Type:</strong> ${typeLabels[type] || type}</p>
          <p><strong>Titre:</strong> ${titleInput.value || '(vide)'}</p>
          <p><strong>Date:</strong> ${dateInput.value || '(vide)'}</p>
          <p><strong>Horaire:</strong> ${startTimeInput.value} - ${endTimeInput.value}</p>
        `;

        if (type === 'meeting') {
          const subtype = document.getElementById('meeting-subtype').value;
          const link = document.getElementById('meeting-link').value;
          summary += `<p><strong>Type de réunion:</strong> ${subtype}</p>`;
          if (link) summary += `<p><strong>Lien visio:</strong> ${link}</p>`;
        } else if (type === 'deployment_window') {
          const env = document.getElementById('deployment-env').value;
          const services = document.getElementById('deployment-services').value;
          summary += `<p><strong>Environnement:</strong> ${env}</p>`;
          if (services) summary += `<p><strong>Services:</strong> ${services}</p>`;
        } else if (type === 'git_action') {
          const repo = document.getElementById('git-repo-url').value;
          const branch = document.getElementById('git-branch').value;
          const action = document.getElementById('git-action-type').value;
          summary += `<p><strong>Dépôt:</strong> ${repo || '(vide)'}</p>`;
          summary += `<p><strong>Branche:</strong> ${branch}</p>`;
          summary += `<p><strong>Action:</strong> ${action}</p>`;
        }

        document.getElementById('event-summary').innerHTML = summary;
      }

      nextBtn.addEventListener('click', () => {
        // Validation before moving to next step
        if (currentStep === 1) {
          if (!titleInput.value.trim()) {
            alert('Le titre est obligatoire');
            return;
          }
          if (!dateInput.value || !startTimeInput.value || !endTimeInput.value) {
            alert('Date et horaires sont obligatoires');
            return;
          }
          if (startTimeInput.value >= endTimeInput.value) {
            alert('L\'heure de fin doit être après l\'heure de début');
            return;
          }
        }

        if (currentStep === 2) {
          const type = typeSelect.value;
          if (type === 'git_action') {
            const repo = document.getElementById('git-repo-url').value;
            if (!repo) {
              alert('L\'URL du dépôt est obligatoire pour les actions Git');
              return;
            }
          }
        }

        currentStep++;
        updateStepDisplay();
      });

      prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          updateStepDisplay();
        }
      });

      // Update type fields when type changes
      typeSelect.addEventListener('change', () => {
        if (currentStep === 2) {
          updateStepDisplay();
        }
      });

      newEventBtn.addEventListener('click', () => {
        if (!ensureLoggedIn()) return;
        
        // Get current user role and configure modal accordingly
        const raw = localStorage.getItem('currentUser');
        const user = raw ? JSON.parse(raw) : null;
        
        if (user) {
          const typeContainer = document.getElementById('event-type-container');
          const role = user.role;
          
          // Configure available event types based on role
          typeSelect.innerHTML = '';
          
          if (role === 'ADMIN' || role === 'PROJET') {
            // Can create all types
            typeSelect.innerHTML = `
              <option value="meeting">Réunion</option>
              <option value="deployment_window">Fenêtre de déploiement</option>
              <option value="git_action">Action Git</option>
            `;
          } else if (role === 'DEV') {
            // Only git_action
            typeSelect.innerHTML = `<option value="git_action">Action Git</option>`;
            typeContainer.style.display = 'none'; // Hide selector since only one option
          } else if (role === 'OPS') {
            // Only deployment_window
            typeSelect.innerHTML = `<option value="deployment_window">Fenêtre de déploiement</option>`;
            typeContainer.style.display = 'none';
          }
        }
        
        const today = new Date().toISOString().slice(0, 10);
        dateInput.value = today;
        startTimeInput.value = '09:00';
        endTimeInput.value = '10:00';
        currentStep = 1;
        updateStepDisplay();
        modal.classList.remove('hidden');
      });

      logoutBtn.addEventListener('click', () => {
        tokenManager.clearTokens();
        localStorage.removeItem('currentUser');
        currentUser = null;
        // Show login button, hide logout & 2FA until logged in
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.getElementById('btn-2fa-setup').style.display = 'none';
        // Prompt login again
        loginModal.classList.remove('hidden');
      });

      // Open login modal on button click
      loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
      });

      btn2FASetup.addEventListener('click', async () => {
        if (!currentUser || !currentUser.id) {
          alert('Veuillez vous connecter d\'abord');
          return;
        }
        
        // Vérifier si 2FA déjà activé
        try {
          const res = await apiFetch(`/2fa/status/${currentUser.id}`);
          if (res.ok) {
            const status = await res.json();
            if (status.enabled) {
              const disable = confirm(`2FA déjà activé.\nCodes de secours restants: ${status.backup_codes_remaining}\n\nVoulez-vous désactiver le 2FA?`);
              if (disable) {
                const code = prompt('Entrez un code 2FA valide pour désactiver:');
                if (code) {
                  const delRes = await apiFetch(`/2fa/disable?user_id=${currentUser.id}&code=${code}`, { method: 'DELETE' });
                  if (delRes.ok) {
                    alert('2FA désactivé ✅');
                    currentUser.totp_enabled = false;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                  } else {
                    const errData = await delRes.json();
                    alert('Erreur: ' + (errData.detail || 'Échec désactivation'));
                  }
                }
              }
              return;
            }
          }
        } catch (err) {
          console.error('2FA status check error', err);
        }
        
        // Ouvrir setup 2FA
        window.open2FASetup(currentUser.id);
      });

      // Tab click handlers avec changement de vue
      function showView(activeView) {
        viewCalendar.classList.remove('active');
        viewTableau.classList.remove('active');
        viewDashboard.classList.remove('active');
        viewMembers.classList.remove('active');

        tabBoard.classList.remove('active');
        tabCalendar.classList.remove('active');
        tabDashboard.classList.remove('active');
        tabMembers.classList.remove('active');

        activeView.classList.add('active');
      }

      tabCalendar.addEventListener('click', () => {
        showView(viewCalendar);
        tabCalendar.classList.add('active');
      });

      tabBoard.addEventListener('click', () => {
        showView(viewTableau);
        tabBoard.classList.add('active');
        loadTableauView();
      });

      tabDashboard.addEventListener('click', () => {
        showView(viewDashboard);
        tabDashboard.classList.add('active');
        loadDashboardView();
      });

      tabMembers.addEventListener('click', () => {
        const uid = getUserId();
        const raw = localStorage.getItem('currentUser');
        const user = raw ? JSON.parse(raw) : null;
        if (!user || user.role !== 'ADMIN') {
          alert('Accès réservé aux administrateurs');
          return;
        }
        showView(viewMembers);
        tabMembers.classList.add('active');
        loadMembersView();
      });

      // Fonctions pour charger les vues
      async function loadTableauView() {
        console.log('loadTableauView called');
        try {
          const res = await apiFetch('/events');
          const events = await res.json();
          console.log('Events loaded:', events);
          const tbody = document.querySelector('#events-table tbody');
          tbody.innerHTML = '';

          const filterType = document.getElementById('filter-type').value;
          const filtered = filterType ? events.filter(e => e.type === filterType) : events;

          for (const ev of filtered) {
            const row = document.createElement('tr');
            const creatorName = ev.created_by ? `User ${ev.creatwed_by}` : 'N/A';
            const dateStr = new Date(ev.start).toLocaleDateString('fr-FR');
            row.innerHTML = `
              <td>${ev.title}</td>
              <td>${ev.type}</td>
              <td>${dateStr}</td>
              <td>${creatorName}</td>
              <td>
                <button class="table-action-btn btn-edit" data-event-id="${ev.id}" title="Modifier (ID: ${ev.id})">Modifier</button>
                <button class="table-action-btn btn-delete" data-event-id="${ev.id}" title="Supprimer (ID: ${ev.id})">Supprimer</button>
              </td>
            `;
            tbody.appendChild(row);
          }
          // Attacher les event listeners
          document.querySelectorAll('#events-table .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editEvent(btn.dataset.eventId));
          });
          document.querySelectorAll('#events-table .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteEventFromView(btn.dataset.eventId));
          });
        } catch (err) {
          console.error('Error loading tableau view', err);
        }
      }

      let dashboardCharts = [];

      async function loadDashboardView() {
        const raw = localStorage.getItem('currentUser');
        const user = raw ? JSON.parse(raw) : null;
        if (!user) return;

        // Détruire les anciens graphiques
        dashboardCharts.forEach(chart => chart.destroy());
        dashboardCharts = [];

        // Afficher infos utilisateur
        const infoPanel = document.getElementById('user-info-panel');
        const roleLabel = { ADMIN: 'Administrateur', PROJET: 'Chef de projet', DEV: 'Développeur', OPS: 'Ops/SysAdmin' }[user.role] || user.role;
        infoPanel.innerHTML = `
          <div class="user-info-row">
            <span class="user-info-label">Nom d'utilisateur:</span>
            <span class="user-info-value">${user.username}</span>
          </div>
          <div class="user-info-row">
            <span class="user-info-label">Rôle:</span>
            <span class="user-info-value">${roleLabel}</span>
          </div>
        `;

        // Stats
        try {
          const res = await apiFetch('/events');
          const events = await res.json();
          const myEvents = events.filter(e => e.created_by === user.id);
          const stats = {
            'Réunion': myEvents.filter(e => e.type === 'meeting').length,
            'Fenêtre de déploiement': myEvents.filter(e => e.type === 'deployment_window').length,
            'Action Git': myEvents.filter(e => e.type === 'git_action').length,
          };

          const statsPanel = document.getElementById('stats-panel');
          statsPanel.innerHTML = `
            <div class="stat-card">
              <div class="stat-label">Total événements</div>
              <div class="stat-value">${myEvents.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Réunions</div>
              <div class="stat-value">${stats['Réunion']}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Déploiements</div>
              <div class="stat-value">${stats['Fenêtre de déploiement']}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Actions Git</div>
              <div class="stat-value">${stats['Action Git']}</div>
            </div>
          `;

          // Créer les graphiques
          createDashboardCharts(myEvents);
        } catch (err) {
          console.error('Error loading dashboard', err);
        }
      }

      function createDashboardCharts(events) {
        const chartDefaults = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#d1d5db',
                font: { size: 12 }
              }
            }
          }
        };

        // 1. Distribution par type (Donut)
        const typeStats = {
          'Réunion': events.filter(e => e.type === 'meeting').length,
          'Déploiement': events.filter(e => e.type === 'deployment_window').length,
          'Git Action': events.filter(e => e.type === 'git_action').length,
        };

        const ctx1 = document.getElementById('chart-type-distribution');
        dashboardCharts.push(new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: Object.keys(typeStats),
            datasets: [{
              data: Object.values(typeStats),
              backgroundColor: [
                'rgba(0, 255, 0, 0.7)',
                'rgba(250, 204, 21, 0.7)',
                'rgba(59, 130, 246, 0.7)'
              ],
              borderColor: [
                '#00ff00',
                '#facc15',
                '#3b82f6'
              ],
              borderWidth: 2
            }]
          },
          options: {
            ...chartDefaults,
            plugins: {
              ...chartDefaults.plugins,
              legend: {
                position: 'bottom',
                labels: { color: '#d1d5db', padding: 15, font: { size: 13 } }
              }
            }
          }
        }));

        // 2. Événements par mois (Bar)
        const monthlyData = {};
        events.forEach(e => {
          const month = new Date(e.start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
          return new Date(a) - new Date(b);
        }).slice(-6); // 6 derniers mois

        const ctx2 = document.getElementById('chart-events-timeline');
        dashboardCharts.push(new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: sortedMonths,
            datasets: [{
              label: 'Événements',
              data: sortedMonths.map(m => monthlyData[m]),
              backgroundColor: 'rgba(0, 255, 0, 0.6)',
              borderColor: '#00ff00',
              borderWidth: 2,
              borderRadius: 6
            }]
          },
          options: {
            ...chartDefaults,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#9ca3af', stepSize: 1 },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
              },
              x: {
                ticks: { color: '#9ca3af' },
                grid: { display: false }
              }
            }
          }
        }));

        // 3. Tendance hebdomadaire (Line)
        const weeklyData = {};
        events.forEach(e => {
          const date = new Date(e.start);
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          const weekKey = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
        });
        const sortedWeeks = Object.keys(weeklyData).slice(-8); // 8 dernières semaines

        const ctx3 = document.getElementById('chart-weekly-trend');
        dashboardCharts.push(new Chart(ctx3, {
          type: 'line',
          data: {
            labels: sortedWeeks,
            datasets: [{
              label: 'Événements par semaine',
              data: sortedWeeks.map(w => weeklyData[w]),
              borderColor: '#00ff00',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#00ff00',
              pointBorderColor: '#000',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            }]
          },
          options: {
            ...chartDefaults,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#9ca3af', stepSize: 1 },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
              },
              x: {
                ticks: { color: '#9ca3af' },
                grid: { display: false }
              }
            }
          }
        }));

        // 4. Activité par jour de semaine (Radar)
        const weekdayData = { Lun: 0, Mar: 0, Mer: 0, Jeu: 0, Ven: 0, Sam: 0, Dim: 0 };
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        events.forEach(e => {
          const day = new Date(e.start).getDay();
          weekdayData[dayNames[day]]++;
        });

        const ctx4 = document.getElementById('chart-weekday-activity');
        dashboardCharts.push(new Chart(ctx4, {
          type: 'polarArea',
          data: {
            labels: Object.keys(weekdayData),
            datasets: [{
              label: 'Événements',
              data: Object.values(weekdayData),
              backgroundColor: [
                'rgba(0, 255, 0, 0.5)',
                'rgba(0, 255, 0, 0.6)',
                'rgba(0, 255, 0, 0.7)',
                'rgba(0, 255, 0, 0.8)',
                'rgba(0, 255, 0, 0.6)',
                'rgba(0, 255, 0, 0.4)',
                'rgba(0, 255, 0, 0.3)'
              ],
              borderColor: '#00ff00',
              borderWidth: 2
            }]
          },
          options: {
            ...chartDefaults,
            scales: {
              r: {
                ticks: { color: '#9ca3af', backdropColor: 'transparent', stepSize: 1 },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                pointLabels: { color: '#d1d5db', font: { size: 12 } }
              }
            }
          }
        }));
      }

      async function loadMembersView() {
        console.log('loadMembersView called');
        try {
          const res = await apiFetch('/users');
          const users = await res.json();
          console.log('Users loaded:', users);
          const tbody = document.querySelector('#members-table tbody');
          tbody.innerHTML = '';

          for (const u of users) {
            const roleLabel = { ADMIN: 'Administrateur', PROJET: 'Chef de projet', DEV: 'Développeur', OPS: 'Ops/SysAdmin' }[u.role] || u.role;
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${u.username}</td>
              <td>${roleLabel}</td>
              <td>
                <button class="table-action-btn btn-edit" data-user-id="${u.id}" data-user-role="${u.role}">Changer rôle</button>
                <button class="table-action-btn btn-delete" data-user-id="${u.id}">Supprimer</button>
              </td>
            `;
            tbody.appendChild(row);
          }
          // Attacher les event listeners
          document.querySelectorAll('#members-table .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editUserRole(btn.dataset.userId, btn.dataset.userRole));
          });
          document.querySelectorAll('#members-table .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteUserFromView(btn.dataset.userId));
          });
        } catch (err) {
          console.error('Error loading members view', err);
        }
      }

      window.editEvent = function(eventId) {
        alert('Édition d\'événement #' + eventId + ' - à implémenter');
      };

      window.deleteEventFromView = async function(eventId) {
        // Garde-fous + logs pour diagnostiquer les 404
        const id = parseInt(eventId, 10);
        if (!Number.isFinite(id)) {
          alert("Erreur: ID d'évènement invalide");
          console.error('Invalid eventId for deletion:', eventId);
          return;
        }

        if (!confirm('Supprimer cet événement?')) return;
        try {
          const url = `/events/${id}`;
          const res = await apiFetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (!res.ok) {
            const text = await res.text();
            const msg = `Échec suppression (URL: ${url}, statut: ${res.status})\n${text}`;
            console.error('DELETE', url, 'status=', res.status, 'body=', text);
            throw new Error(msg);
          }
          await loadTableauView();
          if (typeof calendar?.refetchEvents === 'function') {
            calendar.refetchEvents();
          }
        } catch (err) {
          alert('Erreur: ' + err.message);
        }
      };

      window.editUserRole = async function(userId, currentRole) {
        const roles = ['PROJET', 'DEV', 'OPS', 'ADMIN'];
        const roleLabels = { ADMIN: 'Administrateur', PROJET: 'Chef de projet', DEV: 'Développeur', OPS: 'Ops/SysAdmin' };
        const newRole = prompt(`Nouveau rôle (${roles.map(r => roleLabels[r]).join(', ')}):`, roleLabels[currentRole]);
        if (!newRole) return;

        const roleKey = Object.keys(roleLabels).find(k => roleLabels[k] === newRole) || currentRole;
        try {
          const res = await apiFetch(`/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: roleKey })
          });
          if (!res.ok) throw new Error(await res.text());
          loadMembersView();
        } catch (err) {
          alert('Erreur: ' + err.message);
        }
      };

      window.deleteUserFromView = async function(userId) {
        if (!confirm('Supprimer cet utilisateur?')) return;
        try {
          const res = await apiFetch(`/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (!res.ok) throw new Error(await res.text());
          loadMembersView();
        } catch (err) {
          alert('Erreur: ' + err.message);
        }
      };

      // Filtre tableau
      document.getElementById('filter-type').addEventListener('change', loadTableauView);

      loginCancel.addEventListener('click', () => {
        loginModal.classList.add('hidden');
      });

      loginSubmit.addEventListener('click', async () => {
        const username = loginUsername.value.trim();
        const password = document.getElementById('login-password').value;
        const totpCode = document.getElementById('login-totp-code').value.trim();
        
        if (!username) {
          alert('Nom d\'utilisateur requis');
          return;
        }
        if (!password) {
          alert('Mot de passe requis');
          return;
        }
        
        try {
          const body = { username, password };
          if (totpCode) {
            body.totp_code = totpCode;
          }
          
          const res = await apiFetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          
          if (!res.ok) {
            const errData = await res.json();
            alert('Erreur: ' + (errData.detail || 'Connexion échouée'));
            return;
          }
          
          const data = await res.json();
          
          // Si 2FA requis, afficher le champ code
          if (data.requires_totp) {
            document.getElementById('login-totp-field').classList.remove('hidden');
            document.getElementById('login-totp-code').focus();
            alert('Veuillez entrer votre code 2FA');
            return;
          }
          
          // Connexion réussie - stocker les tokens JWT
          tokenManager.setTokens(data.access_token, data.refresh_token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          currentUser = data.user;
          // Update nav buttons
          loginBtn.style.display = 'none';
          document.getElementById('btn-2fa-setup').style.display = 'inline-block';
          logoutBtn.style.display = 'inline-block';
          loginModal.classList.add('hidden');
          document.getElementById('login-password').value = '';
          document.getElementById('login-totp-code').value = '';
          document.getElementById('login-totp-field').classList.add('hidden');
          // Ouvrir automatiquement le setup 2FA si non activé
          if (!currentUser.totp_enabled) {
            window.open2FASetup(currentUser.id);
          }
          calendar.refetchEvents();
        } catch (err) {
          console.error('Login error', err);
          alert('Erreur de connexion');
        }
      });

      addMemberBtn.addEventListener('click', () => {
        addMemberModal.classList.remove('hidden');
      });

      addMemberCancel.addEventListener('click', () => {
        addMemberModal.classList.add('hidden');
        newMemberUsername.value = '';
        newMemberRole.value = 'PROJET';
      });

      addMemberSubmit.addEventListener('click', async () => {
        const username = newMemberUsername.value.trim();
        const role = newMemberRole.value;
        if (!username) {
          alert('Nom d\'utilisateur requis');
          return;
        }
        try {
          const res = await apiFetch('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, role })
          });
          if (!res.ok) {
            const errText = await res.text();
            alert('Erreur: ' + errText);
            return;
          }
          addMemberModal.classList.add('hidden');
          newMemberUsername.value = '';
          newMemberRole.value = 'editor';
          loadMembersView();
        } catch (err) {
          alert('Erreur: ' + err.message);
          console.error('Error adding member', err);
        }
      });

      // ===== 2FA Setup Modal =====
      const twoFAModal = document.getElementById('2fa-setup-modal');
      const twoFAStep1 = document.getElementById('2fa-step-1');
      const twoFAStep2 = document.getElementById('2fa-step-2');
      const twoFAQRCode = document.getElementById('2fa-qr-code');
      const twoFAVerifyCode = document.getElementById('2fa-verify-code');
      const twoFABackupCodes = document.getElementById('2fa-backup-codes');
      const twoFASetupCancel = document.getElementById('2fa-setup-cancel');
      const twoFAVerifySubmit = document.getElementById('2fa-verify-submit');
      const twoFADownloadCodes = document.getElementById('2fa-download-codes');
      const twoFAComplete = document.getElementById('2fa-complete');
      
      let current2FASetupData = null;

      // Fonction pour ouvrir le modal 2FA setup
      window.open2FASetup = async function(userId) {
        try {
          const res = await apiFetch(`/2fa/setup?user_id=${userId}`, { method: 'POST' });
          if (!res.ok) {
            const errData = await res.json();
            alert('Erreur: ' + (errData.detail || 'Échec configuration 2FA'));
            return;
          }
          
          const data = await res.json();
          current2FASetupData = data;
          
          // Afficher QR code
          twoFAQRCode.src = data.qr_code_url;
          
          // Réinitialiser et afficher étape 1
          twoFAStep1.classList.remove('hidden');
          twoFAStep2.classList.add('hidden');
          twoFAVerifyCode.value = '';
          twoFAModal.classList.remove('hidden');
        } catch (err) {
          console.error('2FA setup error', err);
          alert('Erreur lors de la configuration 2FA');
        }
      };

      twoFASetupCancel.addEventListener('click', () => {
        twoFAModal.classList.add('hidden');
        current2FASetupData = null;
      });

      twoFAVerifySubmit.addEventListener('click', async () => {
        const code = twoFAVerifyCode.value.trim();
        if (!code || code.length !== 6) {
          alert('Code à 6 chiffres requis');
          return;
        }
        
        try {
          const res = await apiFetch('/2fa/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              user_id: currentUser.id, 
              code: code 
            })
          });
          
          if (!res.ok) {
            const errData = await res.json();
            alert('Erreur: ' + (errData.detail || 'Code invalide'));
            return;
          }
          
          // Passer à l'étape 2 (backup codes)
          twoFAStep1.classList.add('hidden');
          twoFAStep2.classList.remove('hidden');
          
          // Afficher backup codes
          const codesHTML = current2FASetupData.backup_codes
            .map(code => `<div style="padding: 5px;">${code}</div>`)
            .join('');
          twoFABackupCodes.innerHTML = codesHTML;
          
          // Mettre à jour currentUser
          currentUser.totp_enabled = true;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
        } catch (err) {
          console.error('2FA enable error', err);
          alert('Erreur lors de l\'activation 2FA');
        }
      });

      twoFADownloadCodes.addEventListener('click', () => {
        const codes = current2FASetupData.backup_codes.join('\n');
        const blob = new Blob([`UYOOP-CAL - Codes de secours 2FA\nUtilisateur: ${currentUser.username}\n\n${codes}\n\nConservez ces codes en lieu sûr!`], 
                               { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uyoop-cal-backup-codes-${currentUser.username}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });

      twoFAComplete.addEventListener('click', () => {
        twoFAModal.classList.add('hidden');
        current2FASetupData = null;
        alert('2FA activé avec succès! ✅');
      });

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'fr',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          multiMonthYear: 'Année'
        },
        events: async function (info, successCallback, failureCallback) {
          try {
            const res = await apiFetch('/events');
            const data = await res.json();
            const events = data.map(ev => ({
              id: ev.id,
              title: ev.title,
              start: ev.start,
              end: ev.end,
              classNames: [ev.type], // pour la couleur
              extendedProps: {
                type: ev.type,
                extra: ev.extra
              }
            }));
            successCallback(events);
          } catch (err) {
            console.error('Error loading events', err);
            failureCallback(err);
          }
        },
        dateClick: function (info) {
          if (!ensureLoggedIn()) return;
          pendingDate = info.dateStr;
          titleInput.value = '';
          typeSelect.value = 'meeting';
          modal.classList.remove('hidden');
        }
      });

      saveBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const date = dateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        const type = typeSelect.value;

        if (!title || !date) {
          alert('Titre et date obligatoires');
          return;
        }

        if (!startTime || !endTime) {
          alert('Heure de début et fin obligatoires');
          return;
        }

        if (startTime >= endTime) {
          alert('L\'heure de fin doit être après l\'heure de début');
          return;
        }

        const start = `${date}T${startTime}:00`;
        const end = `${date}T${endTime}:00`;

        // Build extra data based on event type
        let extra = {};

        if (type === 'meeting') {
          extra = {
            subtype: document.getElementById('meeting-subtype').value,
            link: document.getElementById('meeting-link').value,
            notes: document.getElementById('meeting-notes').value
          };
        } else if (type === 'deployment_window') {
          extra = {
            environment: document.getElementById('deployment-env').value,
            services: document.getElementById('deployment-services').value,
            description: document.getElementById('deployment-description').value,
            needs_approval: document.getElementById('deployment-needs-approval').checked
          };
        } else if (type === 'git_action') {
          extra = {
            repo_url: document.getElementById('git-repo-url').value,
            branch: document.getElementById('git-branch').value,
            action: document.getElementById('git-action-type').value,
            auto_trigger: document.getElementById('git-auto-trigger').checked
          };
        }

        const body = {
          title: title,
          start: start,
          end: end,
          type: type,
          extra: extra
        };

        try {
          const res = await apiFetch('/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) {
            const errText = await res.text();
            alert('Erreur lors de la création: ' + errText);
            console.error('Erreur POST /events', errText);
            return;
          }
          const created = await res.json();
          calendar.addEvent({
            id: created.id,
            title: created.title,
            start: created.start,
            end: created.end,
            classNames: [created.type]
          });
          resetEventModal();
        } catch (err) {
          alert('Erreur: ' + err.message);
          console.error('Error creating event', err);
        }
      });

      calendar.render();

      // Initialize currentUser from localStorage and toggle nav buttons
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (err) {
          console.error('Failed to parse currentUser', err);
          localStorage.removeItem('currentUser');
        }
      }

      // Toggle login/logout/2FA buttons based on session
      if (currentUser && currentUser.id) {
        document.getElementById('btn-login').style.display = 'none';
        document.getElementById('btn-2fa-setup').style.display = 'inline-block';
        document.getElementById('btn-logout').style.display = 'inline-block';
      } else {
        document.getElementById('btn-login').style.display = 'inline-block';
        document.getElementById('btn-2fa-setup').style.display = 'none';
        document.getElementById('btn-logout').style.display = 'none';
      }

      // Force login prompt at first visit
      ensureLoggedIn();

      // Initialize calendar with active view
      tabCalendar.classList.add('active');
    });
