#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Servidor REST API nativo en Python 3 (Sin dependencias externas / pip)
import http.server
import socketserver
import json
import re
import os
from datetime import datetime

PORT = 5000

projects = [
    {
        "id": "PRJ-101",
        "name": "Plataforma de Pagos Microservicios",
        "leadDeveloper": "Ing. Sofia Morales",
        "methodology": "Scrum",
        "repositoryUrl": "https://github.com/nexus/payments-mesh.git",
        "status": "active",
        "priority": "Critica",
        "techStack": ["Go", "Docker", "PostgreSQL", "Kafka"],
        "budget": 54000,
        "currentSprint": 6,
        "progress": 85,
        "metrics": {"coverage": 91.4, "maintainability": "A", "openBugs": 2, "vulnerabilities": 0, "codeSmells": 5, "lastDeploy": "2026-10-15 18:30"}
    },
    {
        "id": "PRJ-102",
        "name": "Motor de Reglas de Negocio Cloud",
        "leadDeveloper": "Ing. David Rios",
        "methodology": "Kanban",
        "repositoryUrl": "https://github.com/nexus/cloud-rules.git",
        "status": "active",
        "priority": "Alta",
        "techStack": ["Java", "Spring Boot", "Redis", "AWS"],
        "budget": 42000,
        "currentSprint": 8,
        "progress": 72,
        "metrics": {"coverage": 87.2, "maintainability": "A", "openBugs": 4, "vulnerabilities": 1, "codeSmells": 12, "lastDeploy": "2026-10-14 11:20"}
    },
    {
        "id": "PRJ-103",
        "name": "Portal de Identidad Segura SSO",
        "leadDeveloper": "Ing. Elena Ramos",
        "methodology": "Scrum",
        "repositoryUrl": "https://github.com/nexus/sso-vault.git",
        "status": "completed",
        "priority": "Media",
        "techStack": ["TypeScript", "React", "OAuth2", "OpenID"],
        "budget": 29500,
        "currentSprint": 5,
        "progress": 100,
        "metrics": {"coverage": 95.8, "maintainability": "A", "openBugs": 0, "vulnerabilities": 0, "codeSmells": 1, "lastDeploy": "2026-10-12 09:45"}
    },
    {
        "id": "PRJ-104",
        "name": "Canal de Integracion de Datos ETL",
        "leadDeveloper": "Ing. Mateo Castro",
        "methodology": "Kanban",
        "repositoryUrl": "https://github.com/nexus/data-pipeline.git",
        "status": "in_review",
        "priority": "Alta",
        "techStack": ["Python", "Apache Spark", "Airflow"],
        "budget": 36000,
        "currentSprint": 3,
        "progress": 58,
        "metrics": {"coverage": 82.0, "maintainability": "B", "openBugs": 7, "vulnerabilities": 2, "codeSmells": 21, "lastDeploy": "2026-10-10 16:15"}
    }
]

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split('?')[0]
        
        # CONSULTA 1: GET /api/projects
        if path == '/api/projects' or path == '/api/projects/':
            self.send_json(200, {
                "success": True,
                "status": 200,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "total": len(projects),
                "data": projects
            })
            return

        # CONSULTA 2: GET /api/projects/:id
        m = re.match(r'^/api/projects/(PRJ-\d+)$', path)
        if m:
            pid = m.group(1)
            found = next((p for p in projects if p["id"] == pid), None)
            if found:
                self.send_json(200, {"success": True, "status": 200, "data": found})
            else:
                self.send_json(404, {"success": False, "status": 404, "error": f"Proyecto {pid} no encontrado"})
            return

        # CONSULTA 4: GET /api/reports/analytics
        if path == '/api/reports/analytics':
            avg_cov = round(sum(p["metrics"]["coverage"] for p in projects) / len(projects), 2)
            self.send_json(200, {
                "success": True,
                "status": 200,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": {
                    "totalActiveProjects": len(projects),
                    "averageCodeCoverage": avg_cov,
                    "slaComplianceRate": 98.4,
                    "openBugs": sum(p["metrics"]["openBugs"] for p in projects),
                    "securityVulnerabilities": sum(p["metrics"]["vulnerabilities"] for p in projects),
                    "distributionByStatus": {
                        "active": len([p for p in projects if p["status"] == "active"]),
                        "in_review": len([p for p in projects if p["status"] == "in_review"]),
                        "completed": len([p for p in projects if p["status"] == "completed"])
                    },
                    "methodologyDistribution": {
                        "scrum": len([p for p in projects if p["methodology"] == "Scrum"]),
                        "kanban": len([p for p in projects if p["methodology"] == "Kanban"])
                    },
                    "auditStatus": "Conforme - Estandares IEEE 829 / ISO 25010"
                }
            })
            return

        # Servir archivos estaticos
        super().do_GET()

    def do_POST(self):
        path = self.path.split('?')[0]
        # CONSULTA 3: POST /api/projects
        if path == '/api/projects' or path == '/api/projects/':
            length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(length).decode('utf-8')
            try:
                data = json.loads(raw_body)
                if not data.get("name"):
                    self.send_json(400, {"success": False, "status": 400, "error": "El campo 'name' es requerido."})
                    return
                new_p = {
                    "id": f"PRJ-{101 + len(projects)}",
                    "name": data["name"],
                    "leadDeveloper": data.get("leadDeveloper", "Ing. Asignado"),
                    "methodology": data.get("methodology", "Scrum"),
                    "repositoryUrl": data.get("repositoryUrl", "https://github.com/nexus/nuevo.git"),
                    "status": data.get("status", "active"),
                    "priority": data.get("priority", "Media"),
                    "techStack": data.get("techStack", ["Python", "Docker"]),
                    "budget": data.get("budget", 30000),
                    "currentSprint": data.get("currentSprint", 1),
                    "progress": 10,
                    "metrics": {"coverage": 85.0, "maintainability": "A", "openBugs": 0, "vulnerabilities": 0, "codeSmells": 0, "lastDeploy": "Reciente"}
                }
                projects.append(new_p)
                self.send_json(201, {"success": True, "status": 201, "data": new_p, "message": "Proyecto creado exitosamente"})
            except Exception as e:
                self.send_json(400, {"success": False, "status": 400, "error": str(e)})
            return

print(f"Nexus Core Server ejecutandose en http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
    httpd.serve_forever()
