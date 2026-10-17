# PARCIAL 2 - INGENIERÍA DE SOFTWARE 2

## Sistema Nexus Core: Plataforma de Auditoría y Gestión de Proyectos de Software

**Desarrollador:** Juan Esteban Ospina Zapata  
**Asignatura:** Ingeniería de Software 2  
**Nivel Académico:** Sexto Semestre  
**Repositorio Oficial en GitHub:** [https://github.com/Juan112021/Parcial-2-Ingenieria-de-Software-2](https://github.com/Juan112021/Parcial-2-Ingenieria-de-Software-2)  
**Sitio Web en Vivo (GitHub Pages):** [https://juan112021.github.io/Parcial-2-Ingenieria-de-Software-2/](https://juan112021.github.io/Parcial-2-Ingenieria-de-Software-2/)  

### Requisitos Académicos Cumplidos:
1. Interfaz web moderna de alto impacto visual con diseño Dark Glassmorphism y **múltiples animaciones suavizadas**.
2. **Restricción estricta respetada:** Cero (0) emojis en la interfaz, código, respuestas JSON o documentación; uso de iconografía vectorial SVG profesional.
3. **4 Consultas REST estructuradas** y probadas para Postman con colecciones v2.1.0 listas para importar con un clic y pruebas automáticas integradas (`pm.test`).
4. Servidor backend nativo multi-entorno sin dependencias complejas (ejecutable de inmediato en Windows PowerShell, Node.js o Python 3).

---

## Estructura del Proyecto

```text
├── index.html                             # Interfaz web principal con dashboard y consola interactiva
├── styles.css                             # Sistema de diseño con transiciones cubic-bezier y estética glassmorphic
├── app.js                                 # Motor reactivo, simulador de peticiones y gestor de estado
├── Parcial2_Nexus_API.postman_collection.json # Colección de Postman con las 4 consultas y tests
├── server.ps1                             # Servidor REST API nativo Windows PowerShell (puerto 5000)
├── server.js                              # Servidor alternativo en Node.js (cero dependencias npm)
├── server.py                              # Servidor alternativo en Python 3 (cero dependencias pip)
├── run.bat                                # Lanzador directo de 1 solo clic para Windows
└── INSTRUCCIONES_ENTREGA.md               # Resumen ejecutivo para el profesor
```

---

## Las 4 Consultas REST para Postman

### Consulta 1: Listar Todos los Proyectos de Software
- **Método HTTP:** `GET`
- **Endpoint:** `http://localhost:5000/api/projects`
- **Descripción:** Obtiene la relación consolidada de los proyectos en desarrollo con sus métricas de cobertura, metodología, deuda técnica y porcentaje de avance del sprint.
- **Pruebas automáticas en Postman:** Valida status `200 OK`, respuesta JSON e integridad del array de datos.

### Consulta 2: Ficha Técnica y Métricas de Calidad de un Proyecto
- **Método HTTP:** `GET`
- **Endpoint:** `http://localhost:5000/api/projects/PRJ-101`
- **Descripción:** Telemetría profunda de un proyecto específico mediante parámetro de ruta (`:id`), retornando índice de mantenibilidad (ISO/IEC 25010), cobertura de pruebas unitarias y conteo de vulnerabilidades.
- **Pruebas automáticas en Postman:** Valida status `200 OK` y presencia de campos de telemetría de software.

### Consulta 3: Registro de un Nuevo Proyecto de Software
- **Método HTTP:** `POST`
- **Endpoint:** `http://localhost:5000/api/projects`
- **Headers:** `Content-Type: application/json`
- **Cuerpo (Payload JSON):**
```json
{
  "name": "Sistema de Auditoria Distribuida",
  "leadDeveloper": "Ing. Carlos Mendoza",
  "methodology": "Scrum",
  "repositoryUrl": "https://github.com/empresa/audit-core.git",
  "status": "active",
  "priority": "Alta",
  "techStack": ["Node.js", "PostgreSQL", "Docker", "RabbitMQ"],
  "budget": 38500,
  "currentSprint": 4
}
```
- **Descripción:** Alta de un nuevo proyecto en el repositorio central asignando identificador correlativo, inicializando métricas de calidad y retornando código HTTP `201 Created`.
- **Pruebas automáticas en Postman:** Valida status `201 Created` y generación de ID único.

### Consulta 4: Reporte de Auditoría y Rendimiento Global
- **Método HTTP:** `GET`
- **Endpoint:** `http://localhost:5000/api/reports/analytics`
- **Descripción:** Generación de métricas de calidad de software a nivel de dirección técnica (cobertura global ponderada, cumplimiento de SLA de entrega en 98.4%, distribución Scrum vs Kanban y estatus de auditoría IEEE 829).
- **Pruebas automáticas en Postman:** Valida status `200 OK` y estructura de indicadores agregados.

---

## Instrucciones para Ejecutar y Probar

### Opción A (La más rápida en Windows):
1. Hacer doble clic sobre el archivo **`run.bat`**.
2. Se iniciará el servidor en `http://localhost:5000` y el navegador se abrirá automáticamente.

### Opción B (Desde PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

### Opción C (Uso con Postman):
1. Abrir Postman.
2. Hacer clic en **Import** (arriba a la izquierda).
3. Seleccionar el archivo `Parcial2_Nexus_API.postman_collection.json`.
4. Ejecutar cualquiera de las 4 consultas haciendo clic en **Send**. En la pestaña **Tests** se verán todos los checks verdes aprobados.
