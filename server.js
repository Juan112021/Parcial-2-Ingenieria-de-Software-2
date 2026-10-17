// Servidor HTTP REST API nativo en Node.js (Sin dependencias externas)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

let projects = [
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

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization'
    });
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // CONSULTA 1: GET /api/projects
  if (req.method === 'GET' && pathname === '/api/projects') {
    const status = urlObj.searchParams.get('status');
    const result = status ? projects.filter(p => p.status === status) : projects;
    return sendJson(res, 200, {
      success: true,
      status: 200,
      timestamp: new Date().toISOString(),
      total: result.length,
      filter: status || 'all',
      data: result
    });
  }

  // CONSULTA 2: GET /api/projects/:id
  const matchSingle = pathname.match(/^\/api\/projects\/(PRJ-\d+)$/);
  if (req.method === 'GET' && matchSingle) {
    const proj = projects.find(p => p.id === matchSingle[1]);
    if (proj) {
      return sendJson(res, 200, {
        success: true,
        status: 200,
        timestamp: new Date().toISOString(),
        data: proj
      });
    }
    return sendJson(res, 404, {
      success: false,
      status: 404,
      error: `Proyecto no encontrado con identificador ${matchSingle[1]}`,
      code: 'PROJECT_NOT_FOUND'
    });
  }

  // CONSULTA 3: POST /api/projects
  if (req.method === 'POST' && pathname === '/api/projects') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (!payload.name) {
          return sendJson(res, 400, { success: false, status: 400, error: "El campo 'name' es requerido." });
        }
        const newProj = {
          id: `PRJ-${101 + projects.length}`,
          name: payload.name,
          leadDeveloper: payload.leadDeveloper || "Ing. Desarrollador",
          methodology: payload.methodology || "Scrum",
          repositoryUrl: payload.repositoryUrl || "https://github.com/nexus/nuevo-proyecto.git",
          status: payload.status || "active",
          priority: payload.priority || "Media",
          techStack: Array.isArray(payload.techStack) ? payload.techStack : ["Node.js", "Docker"],
          budget: Number(payload.budget) || 30000,
          currentSprint: Number(payload.currentSprint) || 1,
          progress: 10,
          metrics: { coverage: 85.0, maintainability: "A", openBugs: 0, vulnerabilities: 0, codeSmells: 0, lastDeploy: "Reciente" }
        };
        projects.push(newProj);
        return sendJson(res, 201, {
          success: true,
          status: 201,
          message: "Proyecto de software registrado exitosamente",
          data: newProj
        });
      } catch (e) {
        return sendJson(res, 400, { success: false, status: 400, error: "Cuerpo JSON invalido" });
      }
    });
    return;
  }

  // CONSULTA 4: GET /api/reports/analytics
  if (req.method === 'GET' && pathname === '/api/reports/analytics') {
    const avgCoverage = projects.reduce((acc, p) => acc + (p.metrics ? p.metrics.coverage : 0), 0) / (projects.length || 1);
    const totalBugs = projects.reduce((acc, p) => acc + (p.metrics ? p.metrics.openBugs : 0), 0);
    const totalVulns = projects.reduce((acc, p) => acc + (p.metrics ? p.metrics.vulnerabilities : 0), 0);

    return sendJson(res, 200, {
      success: true,
      status: 200,
      timestamp: new Date().toISOString(),
      data: {
        totalActiveProjects: projects.length,
        averageCodeCoverage: Number(avgCoverage.toFixed(2)),
        slaComplianceRate: 98.4,
        openBugs: totalBugs,
        securityVulnerabilities: totalVulns,
        distributionByStatus: {
          active: projects.filter(p => p.status === 'active').length,
          in_review: projects.filter(p => p.status === 'in_review').length,
          completed: projects.filter(p => p.status === 'completed').length
        },
        methodologyDistribution: {
          scrum: projects.filter(p => p.methodology === 'Scrum').length,
          kanban: projects.filter(p => p.methodology === 'Kanban').length
        },
        auditStatus: "Conforme - Estandares IEEE 829 / ISO 25010"
      }
    });
  }

  // Servir frontend estático
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Recurso no encontrado');
    } else {
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Nexus Core Server ejecutandose en http://localhost:${PORT}`);
});
