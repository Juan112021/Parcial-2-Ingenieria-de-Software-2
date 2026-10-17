/**
 * Nexus Core - Motor de Lógica e Interactividad
 * Ingeniería de Software 2 - Parcial 2
 * Cero Emojis & Animaciones Suavizadas
 */

const API_BASE_URL = 'http://localhost:5000';
let isServerOnline = false;

// Estado local de proyectos (funciona como fallback offline inmediato y sincronizado con API)
let localProjects = [
  {
    id: "PRJ-101",
    name: "Plataforma de Pagos Microservicios",
    leadDeveloper: "Ing. Sofia Morales",
    methodology: "Scrum",
    repositoryUrl: "https://github.com/nexus/payments-mesh.git",
    status: "active",
    priority: "Critica",
    techStack: ["Go", "Docker", "PostgreSQL", "Kafka"],
    budget: 54000,
    currentSprint: 6,
    progress: 85,
    metrics: { coverage: 91.4, maintainability: "A", openBugs: 2, vulnerabilities: 0, codeSmells: 5, lastDeploy: "2026-10-15 18:30" }
  },
  {
    id: "PRJ-102",
    name: "Motor de Reglas de Negocio Cloud",
    leadDeveloper: "Ing. David Rios",
    methodology: "Kanban",
    repositoryUrl: "https://github.com/nexus/cloud-rules.git",
    status: "active",
    priority: "Alta",
    techStack: ["Java", "Spring Boot", "Redis", "AWS"],
    budget: 42000,
    currentSprint: 8,
    progress: 72,
    metrics: { coverage: 87.2, maintainability: "A", openBugs: 4, vulnerabilities: 1, codeSmells: 12, lastDeploy: "2026-10-14 11:20" }
  },
  {
    id: "PRJ-103",
    name: "Portal de Identidad Segura SSO",
    leadDeveloper: "Ing. Elena Ramos",
    methodology: "Scrum",
    repositoryUrl: "https://github.com/nexus/sso-vault.git",
    status: "completed",
    priority: "Media",
    techStack: ["TypeScript", "React", "OAuth2", "OpenID"],
    budget: 29500,
    currentSprint: 5,
    progress: 100,
    metrics: { coverage: 95.8, maintainability: "A", openBugs: 0, vulnerabilities: 0, codeSmells: 1, lastDeploy: "2026-10-12 09:45" }
  },
  {
    id: "PRJ-104",
    name: "Canal de Integracion de Datos ETL",
    leadDeveloper: "Ing. Mateo Castro",
    methodology: "Kanban",
    repositoryUrl: "https://github.com/nexus/data-pipeline.git",
    status: "in_review",
    priority: "Alta",
    techStack: ["Python", "Apache Spark", "Airflow"],
    budget: 36000,
    currentSprint: 3,
    progress: 58,
    metrics: { coverage: 82.0, maintainability: "B", openBugs: 7, vulnerabilities: 2, codeSmells: 21, lastDeploy: "2026-10-10 16:15" }
  }
];

// Definición de las 4 Consultas de Postman
const queriesConfig = {
  1: {
    title: "Consulta 1: Listar Todos los Proyectos",
    method: "GET",
    endpoint: "/api/projects",
    url: `${API_BASE_URL}/api/projects`,
    header: "Accept: application/json",
    payloadDescription: "// Sin cuerpo en la peticion (Solicitud GET pura)",
    payloadData: null,
    handler: async () => {
      if (isServerOnline) {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        return { status: res.status, data: await res.json() };
      }
      return {
        status: 200,
        data: {
          success: true,
          status: 200,
          timestamp: new Date().toISOString(),
          total: localProjects.length,
          filter: "all",
          data: localProjects
        }
      };
    }
  },
  2: {
    title: "Consulta 2: Detalle y Metricas de Calidad de Proyecto",
    method: "GET",
    endpoint: "/api/projects/PRJ-101",
    url: `${API_BASE_URL}/api/projects/PRJ-101`,
    header: "Accept: application/json",
    payloadDescription: "// Parametro de ruta :id = PRJ-101",
    payloadData: null,
    handler: async () => {
      if (isServerOnline) {
        const res = await fetch(`${API_BASE_URL}/api/projects/PRJ-101`);
        return { status: res.status, data: await res.json() };
      }
      const item = localProjects.find(p => p.id === "PRJ-101");
      return {
        status: 200,
        data: {
          success: true,
          status: 200,
          timestamp: new Date().toISOString(),
          data: item
        }
      };
    }
  },
  3: {
    title: "Consulta 3: Registrar Nuevo Proyecto de Software",
    method: "POST",
    endpoint: "/api/projects",
    url: `${API_BASE_URL}/api/projects`,
    header: "Content-Type: application/json",
    payloadDescription: JSON.stringify({
      name: "Sistema de Auditoria Distribuida",
      leadDeveloper: "Ing. Carlos Mendoza",
      methodology: "Scrum",
      repositoryUrl: "https://github.com/empresa/audit-core.git",
      status: "active",
      priority: "Alta",
      techStack: ["Node.js", "PostgreSQL", "Docker", "RabbitMQ"],
      budget: 38500,
      currentSprint: 4
    }, null, 2),
    payloadData: {
      name: "Sistema de Auditoria Distribuida",
      leadDeveloper: "Ing. Carlos Mendoza",
      methodology: "Scrum",
      repositoryUrl: "https://github.com/empresa/audit-core.git",
      status: "active",
      priority: "Alta",
      techStack: ["Node.js", "PostgreSQL", "Docker", "RabbitMQ"],
      budget: 38500,
      currentSprint: 4
    },
    handler: async () => {
      const body = {
        name: "Sistema de Auditoria Distribuida",
        leadDeveloper: "Ing. Carlos Mendoza",
        methodology: "Scrum",
        repositoryUrl: "https://github.com/empresa/audit-core.git",
        status: "active",
        priority: "Alta",
        techStack: ["Node.js", "PostgreSQL", "Docker", "RabbitMQ"],
        budget: 38500,
        currentSprint: 4
      };

      if (isServerOnline) {
        const res = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const json = await res.json();
        if (json.data) {
          localProjects.push(json.data);
          renderProjects(currentFilter);
          updateKpis();
        }
        return { status: res.status, data: json };
      }

      const newProj = {
        id: `PRJ-${101 + localProjects.length}`,
        ...body,
        progress: 15,
        metrics: { coverage: 85.0, maintainability: "A", openBugs: 0, vulnerabilities: 0, codeSmells: 0, lastDeploy: "Reciente" }
      };
      localProjects.push(newProj);
      renderProjects(currentFilter);
      updateKpis();

      return {
        status: 201,
        data: {
          success: true,
          status: 201,
          message: "Proyecto de software registrado exitosamente",
          data: newProj
        }
      };
    }
  },
  4: {
    title: "Consulta 4: Reporte de Rendimiento y Calidad Global",
    method: "GET",
    endpoint: "/api/reports/analytics",
    url: `${API_BASE_URL}/api/reports/analytics`,
    header: "Accept: application/json",
    payloadDescription: "// Solicitud analitica de metricas de calidad y SLA",
    payloadData: null,
    handler: async () => {
      if (isServerOnline) {
        const res = await fetch(`${API_BASE_URL}/api/reports/analytics`);
        return { status: res.status, data: await res.json() };
      }
      const avgCov = localProjects.reduce((acc, p) => acc + p.metrics.coverage, 0) / localProjects.length;
      return {
        status: 200,
        data: {
          success: true,
          status: 200,
          timestamp: new Date().toISOString(),
          data: {
            totalActiveProjects: localProjects.length,
            averageCodeCoverage: Number(avgCov.toFixed(2)),
            slaComplianceRate: 98.4,
            openBugs: localProjects.reduce((acc, p) => acc + p.metrics.openBugs, 0),
            securityVulnerabilities: localProjects.reduce((acc, p) => acc + p.metrics.vulnerabilities, 0),
            distributionByStatus: {
              active: localProjects.filter(p => p.status === 'active').length,
              in_review: localProjects.filter(p => p.status === 'in_review').length,
              completed: localProjects.filter(p => p.status === 'completed').length
            },
            methodologyDistribution: {
              scrum: localProjects.filter(p => p.methodology === 'Scrum').length,
              kanban: localProjects.filter(p => p.methodology === 'Kanban').length
            },
            auditStatus: "Conforme - Estandares IEEE 829 / ISO 25010"
          }
        }
      };
    }
  }
};

let activeQueryIndex = 1;
let currentFilter = 'all';

// Elementos del DOM
const projectsContainer = document.getElementById('projectsContainer');
const backendStatusPill = document.getElementById('backendStatusPill');
const backendStatusText = document.getElementById('backendStatusText');
const queryTabs = document.querySelectorAll('.query-tab');
const currentTerminalMethod = document.getElementById('currentTerminalMethod');
const currentTerminalUrl = document.getElementById('currentTerminalUrl');
const currentStatusTag = document.getElementById('currentStatusTag');
const currentLatencyTag = document.getElementById('currentLatencyTag');
const currentReqHeader = document.getElementById('currentReqHeader');
const currentReqPayloadView = document.getElementById('currentReqPayloadView');
const currentResPayloadView = document.getElementById('currentResPayloadView');
const btnRunCurrentQuery = document.getElementById('btnRunCurrentQuery');

// Modales
const createModalOverlay = document.getElementById('createModalOverlay');
const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
const btnCloseCreateModal = document.getElementById('btnCloseCreateModal');
const btnCancelCreateModal = document.getElementById('btnCancelCreateModal');
const createProjectForm = document.getElementById('createProjectForm');

const postmanGuideOverlay = document.getElementById('postmanGuideOverlay');
const btnOpenPostmanGuide = document.getElementById('btnOpenPostmanGuide');
const btnClosePostmanGuide = document.getElementById('btnClosePostmanGuide');
const btnDismissGuide = document.getElementById('btnDismissGuide');

// Modal Desarrollador (Juan Esteban Ospina)
const developerModalOverlay = document.getElementById('developerModalOverlay');
const btnOpenDevModal = document.getElementById('btnOpenDevModal');
const btnCloseDevModal = document.getElementById('btnCloseDevModal');
const btnDismissDevModal = document.getElementById('btnDismissDevModal');

// KPI Elements
const kpiTotalProjects = document.getElementById('kpiTotalProjects');
const kpiAvgCoverage = document.getElementById('kpiAvgCoverage');
const kpiSlaRate = document.getElementById('kpiSlaRate');
const kpiTotalBugs = document.getElementById('kpiTotalBugs');

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  await checkBackendStatus();
  renderProjects('all');
  updateKpis();
  loadQueryTab(1);
  executeCurrentQuery();
  setupEventListeners();

  // Apertura suave del Pop-up del Desarrollador Juan Esteban Ospina al cargar
  setTimeout(() => {
    if (developerModalOverlay) {
      developerModalOverlay.classList.add('active');
    }
  }, 450);
});

// Comprobar si el backend REST está levantado
async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      isServerOnline = true;
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        localProjects = json.data;
      }
      backendStatusPill.style.background = 'rgba(16, 185, 129, 0.15)';
      backendStatusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      backendStatusText.textContent = 'API Conectada (Puerto 5000)';
      showToast('Servidor REST activo y sincronizado en puerto 5000', 'success');
      return;
    }
  } catch (e) {
    // Servidor aún no activo, funcionamiento offline fluido
    isServerOnline = false;
    backendStatusPill.style.background = 'rgba(56, 189, 248, 0.12)';
    backendStatusPill.style.borderColor = 'rgba(56, 189, 248, 0.3)';
    backendStatusText.textContent = window.location.hostname.includes('github.io') 
      ? 'API Mock Engine Activo (GitHub Pages)' 
      : 'Modo Simulación API (Standby)';
  }
}

// Renderizado de Tarjetas de Proyectos con Animaciones Suavizadas
function renderProjects(filter = 'all') {
  currentFilter = filter;
  projectsContainer.innerHTML = '';

  const filtered = filter === 'all' 
    ? localProjects 
    : localProjects.filter(p => p.status === filter);

  if (filtered.length === 0) {
    projectsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); font-size: 0.95rem;">No se encontraron proyectos en este estado.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${index * 0.08}s`;

    const priorityClass = p.priority === 'Critica' ? 'priority-critica' : (p.priority === 'Alta' ? 'priority-alta' : 'priority-media');

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="card-id-badge">${p.id}</span>
          <span class="priority-tag ${priorityClass}">${p.priority}</span>
        </div>

        <h3 class="card-title">${escapeHtml(p.name)}</h3>
        <div class="card-lead">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>${escapeHtml(p.leadDeveloper)} &bull; ${escapeHtml(p.methodology)}</span>
        </div>

        <div class="progress-container">
          <div class="progress-meta">
            <span class="progress-meta-label">Avance del Sprint (${p.currentSprint || 1})</span>
            <span class="progress-meta-value">${p.progress}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${p.progress}%;"></div>
          </div>
        </div>

        <div class="card-metrics-row">
          <div class="metric-mini-item">
            <div class="mini-label">Cobertura</div>
            <div class="mini-val ${p.metrics.coverage >= 85 ? 'good' : 'warn'}">${p.metrics.coverage}%</div>
          </div>
          <div class="metric-mini-item">
            <div class="mini-label">Mant.</div>
            <div class="mini-val good">${p.metrics.maintainability}</div>
          </div>
          <div class="metric-mini-item">
            <div class="mini-label">Bugs</div>
            <div class="mini-val ${p.metrics.openBugs === 0 ? 'good' : 'warn'}">${p.metrics.openBugs}</div>
          </div>
        </div>

        <div class="tech-tags">
          ${p.techStack.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>

      <div class="card-footer">
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">
          Deploy: ${escapeHtml(p.metrics.lastDeploy || 'Reciente')}
        </span>
        <button class="btn btn-secondary btn-inspect" data-project-id="${p.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Detalle API
        </button>
      </div>
    `;

    projectsContainer.appendChild(card);
  });

  // Listener para botón inspeccionar en API
  document.querySelectorAll('.btn-inspect').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pid = e.currentTarget.getAttribute('data-project-id');
      inspectProjectDetail(pid);
    });
  });
}

// Cargar Pestaña de Consulta
function loadQueryTab(index) {
  activeQueryIndex = Number(index);

  queryTabs.forEach(tab => {
    if (Number(tab.getAttribute('data-query-index')) === activeQueryIndex) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  const cfg = queriesConfig[activeQueryIndex];
  currentTerminalMethod.textContent = cfg.method;
  currentTerminalMethod.className = `terminal-method ${cfg.method === 'GET' ? 'badge-get' : 'badge-post'}`;
  currentTerminalUrl.textContent = cfg.url;
  currentReqHeader.textContent = cfg.header;
  currentReqPayloadView.textContent = cfg.payloadDescription;
}

// Ejecutar Consulta Seleccionada
async function executeCurrentQuery() {
  const cfg = queriesConfig[activeQueryIndex];
  const startTime = performance.now();

  currentResPayloadView.textContent = "Ejecutando peticion HTTP y validando respuesta...";
  currentStatusTag.textContent = "Procesando...";
  currentStatusTag.className = "status-tag";

  try {
    const result = await cfg.handler();
    const duration = Math.round(performance.now() - startTime);

    currentLatencyTag.textContent = `${duration} ms`;
    currentStatusTag.textContent = `Status: ${result.status} ${result.status === 201 ? 'Created' : 'OK'}`;
    currentStatusTag.className = `status-tag ${result.status === 201 ? 'status-201' : 'status-200'}`;

    currentResPayloadView.innerHTML = syntaxHighlightJson(JSON.stringify(result.data, null, 2));
  } catch (err) {
    currentStatusTag.textContent = "Status: 500 Error";
    currentStatusTag.className = "status-tag status-404";
    currentResPayloadView.textContent = `Error al ejecutar consulta: ${err.message}`;
  }
}

// Inspeccionar detalle específico (Consulta 2)
function inspectProjectDetail(projectId) {
  activeQueryIndex = 2;
  loadQueryTab(2);
  queriesConfig[2].endpoint = `/api/projects/${projectId}`;
  queriesConfig[2].url = `${API_BASE_URL}/api/projects/${projectId}`;
  queriesConfig[2].handler = async () => {
    if (isServerOnline) {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
      return { status: res.status, data: await res.json() };
    }
    const item = localProjects.find(p => p.id === projectId);
    return {
      status: item ? 200 : 404,
      data: item ? { success: true, status: 200, data: item } : { success: false, status: 404, error: "No encontrado" }
    };
  };

  document.querySelector('.queries-showcase').scrollIntoView({ behavior: 'smooth' });
  executeCurrentQuery();
  showToast(`Inspeccionando detalle de ${projectId} en Consulta 2`, 'info');
}

// Resaltado de sintaxis JSON elegante y seguro
function syntaxHighlightJson(jsonStr) {
  const escaped = escapeHtml(jsonStr);
  return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Actualizar indicadores clave
function updateKpis() {
  kpiTotalProjects.innerHTML = `${localProjects.length} <span style="font-size: 0.9rem; color: var(--text-muted);">repos</span>`;
  
  if (localProjects.length > 0) {
    const avg = localProjects.reduce((acc, p) => acc + p.metrics.coverage, 0) / localProjects.length;
    kpiAvgCoverage.textContent = `${avg.toFixed(1)}%`;

    const totalBugs = localProjects.reduce((acc, p) => acc + p.metrics.openBugs, 0);
    kpiTotalBugs.innerHTML = `${totalBugs} <span style="font-size: 0.9rem; color: var(--text-muted);">abiertos</span>`;
  }
}

// Sistema de Notificaciones Toast Suavizadas
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';

  const strokeColor = type === 'success' ? '#10b981' : (type === 'error' ? '#f43f5e' : '#38bdf8');

  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 14 14"></polyline>
      </svg>
    </div>
    <div class="toast-text">
      <h4>Notificacion del Sistema</h4>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  container.appendChild(toast);

  // Activación con transición suave
  setTimeout(() => toast.classList.add('show'), 20);

  // Remoción automática tras 4 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Event Listeners
function setupEventListeners() {
  // Tabs de Consultas
  queryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = tab.getAttribute('data-query-index');
      loadQueryTab(idx);
      executeCurrentQuery();
    });
  });

  // Botón Ejecutar Consulta
  btnRunCurrentQuery.addEventListener('click', () => {
    executeCurrentQuery();
  });

  // Filtros de proyectos
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const filter = e.currentTarget.getAttribute('data-filter');
      renderProjects(filter);
    });
  });

  // Modal Nuevo Proyecto
  btnOpenCreateModal.addEventListener('click', () => {
    createModalOverlay.classList.add('active');
  });

  const closeCreateModal = () => {
    createModalOverlay.classList.remove('active');
    createProjectForm.reset();
  };
  btnCloseCreateModal.addEventListener('click', closeCreateModal);
  btnCancelCreateModal.addEventListener('click', closeCreateModal);

  // Enviar formulario (Consulta 3: POST /api/projects)
  createProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('inpProjectName').value.trim();
    const leadDeveloper = document.getElementById('inpLeadDev').value.trim() || 'Ing. Asignado';
    const methodology = document.getElementById('inpMethodology').value;
    const repositoryUrl = document.getElementById('inpRepoUrl').value.trim() || 'https://github.com/nexus/nuevo-modulo.git';
    const priority = document.getElementById('inpPriority').value;
    const budget = Number(document.getElementById('inpBudget').value) || 30000;
    const techStack = document.getElementById('inpTechStack').value.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      leadDeveloper,
      methodology,
      repositoryUrl,
      status: "active",
      priority,
      techStack,
      budget,
      currentSprint: 1
    };

    closeCreateModal();

    // Actualizar payload en la Consulta 3
    queriesConfig[3].payloadDescription = JSON.stringify(payload, null, 2);
    queriesConfig[3].payloadData = payload;
    queriesConfig[3].handler = async () => {
      if (isServerOnline) {
        const res = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.data) {
          localProjects.push(json.data);
          renderProjects(currentFilter);
          updateKpis();
        }
        return { status: res.status, data: json };
      }

      const newProj = {
        id: `PRJ-${101 + localProjects.length}`,
        ...payload,
        progress: 10,
        metrics: { coverage: 85.0, maintainability: "A", openBugs: 0, vulnerabilities: 0, codeSmells: 0, lastDeploy: "Reciente" }
      };
      localProjects.push(newProj);
      renderProjects(currentFilter);
      updateKpis();

      return {
        status: 201,
        data: {
          success: true,
          status: 201,
          message: "Proyecto de software registrado exitosamente",
          data: newProj
        }
      };
    };

    // Cambiar vista a Consulta 3 y ejecutar
    activeQueryIndex = 3;
    loadQueryTab(3);
    document.querySelector('.queries-showcase').scrollIntoView({ behavior: 'smooth' });
    await executeCurrentQuery();

    showToast(`Proyecto "${name}" creado exitosamente (Status 201 Created)`, 'success');
  });

  // Modal Guía Postman
  btnOpenPostmanGuide.addEventListener('click', () => {
    postmanGuideOverlay.classList.add('active');
  });
  const closeGuideModal = () => postmanGuideOverlay.classList.remove('active');
  btnClosePostmanGuide.addEventListener('click', closeGuideModal);
  btnDismissGuide.addEventListener('click', closeGuideModal);

  // Modal Desarrollador (Juan Esteban Ospina)
  if (btnOpenDevModal && developerModalOverlay) {
    btnOpenDevModal.addEventListener('click', () => {
      developerModalOverlay.classList.add('active');
    });

    const closeDevModal = () => {
      developerModalOverlay.classList.remove('active');
      showToast('Nexus Core: Desarrollado por Juan Esteban Ospina', 'info');
    };

    if (btnCloseDevModal) btnCloseDevModal.addEventListener('click', closeDevModal);
    if (btnDismissDevModal) btnDismissDevModal.addEventListener('click', closeDevModal);

    developerModalOverlay.addEventListener('click', (e) => {
      if (e.target === developerModalOverlay) closeDevModal();
    });
  }

  // Cerrar modales con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCreateModal();
      closeGuideModal();
      if (developerModalOverlay) developerModalOverlay.classList.remove('active');
    }
  });

  // Cerrar al hacer click fuera del contenido del modal
  createModalOverlay.addEventListener('click', (e) => {
    if (e.target === createModalOverlay) closeCreateModal();
  });
  postmanGuideOverlay.addEventListener('click', (e) => {
    if (e.target === postmanGuideOverlay) closeGuideModal();
  });
}
