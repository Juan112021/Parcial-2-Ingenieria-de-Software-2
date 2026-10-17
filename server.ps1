# Nexus Core REST API & Web Server (PowerShell Nativo Windows)
# No requiere Node.js ni Python. Se ejecuta de forma nativa en Windows PowerShell.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$port = 5000
$prefix = "http://localhost:$port/"
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Base de datos en memoria inicial
$global:projects = [System.Collections.ArrayList]@(
    [PSCustomObject]@{
        id = "PRJ-101"
        name = "Plataforma de Pagos Microservicios"
        leadDeveloper = "Ing. Sofia Morales"
        methodology = "Scrum"
        repositoryUrl = "https://github.com/nexus/payments-mesh.git"
        status = "active"
        priority = "Critica"
        techStack = @("Go", "Docker", "PostgreSQL", "Kafka")
        budget = 54000
        currentSprint = 6
        progress = 85
        metrics = [PSCustomObject]@{
            coverage = 91.4
            maintainability = "A"
            openBugs = 2
            vulnerabilities = 0
            codeSmells = 5
            lastDeploy = "2026-10-15 18:30"
        }
    },
    [PSCustomObject]@{
        id = "PRJ-102"
        name = "Motor de Reglas de Negocio Cloud"
        leadDeveloper = "Ing. David Rios"
        methodology = "Kanban"
        repositoryUrl = "https://github.com/nexus/cloud-rules.git"
        status = "active"
        priority = "Alta"
        techStack = @("Java", "Spring Boot", "Redis", "AWS")
        budget = 42000
        currentSprint = 8
        progress = 72
        metrics = [PSCustomObject]@{
            coverage = 87.2
            maintainability = "A"
            openBugs = 4
            vulnerabilities = 1
            codeSmells = 12
            lastDeploy = "2026-10-14 11:20"
        }
    },
    [PSCustomObject]@{
        id = "PRJ-103"
        name = "Portal de Identidad Segura SSO"
        leadDeveloper = "Ing. Elena Ramos"
        methodology = "Scrum"
        repositoryUrl = "https://github.com/nexus/sso-vault.git"
        status = "completed"
        priority = "Media"
        techStack = @("TypeScript", "React", "OAuth2", "OpenID")
        budget = 29500
        currentSprint = 5
        progress = 100
        metrics = [PSCustomObject]@{
            coverage = 95.8
            maintainability = "A"
            openBugs = 0
            vulnerabilities = 0
            codeSmells = 1
            lastDeploy = "2026-10-12 09:45"
        }
    },
    [PSCustomObject]@{
        id = "PRJ-104"
        name = "Canal de Integracion de Datos ETL"
        leadDeveloper = "Ing. Mateo Castro"
        methodology = "Kanban"
        repositoryUrl = "https://github.com/nexus/data-pipeline.git"
        status = "in_review"
        priority = "Alta"
        techStack = @("Python", "Apache Spark", "Airflow")
        budget = 36000
        currentSprint = 3
        progress = 58
        metrics = [PSCustomObject]@{
            coverage = 82.0
            maintainability = "B"
            openBugs = 7
            vulnerabilities = 2
            codeSmells = 21
            lastDeploy = "2026-10-10 16:15"
        }
    }
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " NEXUS CORE SERVER INICIADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host " URL Frontend:    http://localhost:$port/" -ForegroundColor Yellow
    Write-Host " Endpoints REST:  http://localhost:$port/api/..." -ForegroundColor Yellow
    Write-Host " Coleccion Postman disponible en el workspace" -ForegroundColor Cyan
    Write-Host " Presione Ctrl+C en esta consola para detener el servidor" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
} catch {
    Write-Host "Error al iniciar el servidor: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

function Send-JsonResponse($response, $statusCode, $data) {
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json; charset=utf-8"
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
    $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
    
    $json = $data | ConvertTo-Json -Depth 6 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.OutputStream.Close()
}

function Send-FileResponse($response, $filePath) {
    if (-not (Test-Path $filePath)) {
        $response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("Recurso no encontrado")
        $response.OutputStream.Write($msg, 0, $msg.Length)
        $response.OutputStream.Close()
        return
    }

    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $contentType = switch ($ext) {
        ".html" { "text/html; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".json" { "application/json; charset=utf-8" }
        ".png"  { "image/png" }
        ".svg"  { "image/svg+xml" }
        default { "application/octet-stream" }
    }

    $response.StatusCode = 200
    $response.ContentType = $contentType
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.OutputStream.Close()
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $method = $request.HttpMethod
        $rawUrl = $request.RawUrl
        $path = $request.Url.AbsolutePath

        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] $method $rawUrl" -ForegroundColor DarkCyan

        if ($method -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
            $response.OutputStream.Close()
            continue
        }

        # -------------------------------------------------------------
        # CONSULTA 1: Listar Todos los Proyectos (GET /api/projects)
        # -------------------------------------------------------------
        if ($method -eq "GET" -and ($path -eq "/api/projects" -or $path -eq "/api/projects/")) {
            $statusFilter = $request.QueryString["status"]
            $filtered = $global:projects
            if (-not [string]::IsNullOrEmpty($statusFilter)) {
                $filtered = $global:projects | Where-Object { $_.status -eq $statusFilter }
            }
            
            $payload = [PSCustomObject]@{
                success = $true
                status = 200
                timestamp = [DateTime]::UtcNow.ToString("o")
                total = @($filtered).Count
                filter = if ($statusFilter) { $statusFilter } else { "all" }
                data = @($filtered)
            }
            Send-JsonResponse $response 200 $payload
            continue
        }

        # -------------------------------------------------------------
        # CONSULTA 2: Detalle y Metricas de Calidad de Proyecto (GET /api/projects/:id)
        # -------------------------------------------------------------
        if ($method -eq "GET" -and $path -match "^/api/projects/(PRJ-[0-9]+)$") {
            $targetId = $matches[1]
            $item = $global:projects | Where-Object { $_.id -eq $targetId } | Select-Object -First 1

            if ($item) {
                $payload = [PSCustomObject]@{
                    success = $true
                    status = 200
                    timestamp = [DateTime]::UtcNow.ToString("o")
                    data = $item
                }
                Send-JsonResponse $response 200 $payload
            } else {
                $payload = [PSCustomObject]@{
                    success = $false
                    status = 404
                    error = "Proyecto no encontrado con identificador $targetId"
                    code = "PROJECT_NOT_FOUND"
                }
                Send-JsonResponse $response 404 $payload
            }
            continue
        }

        # -------------------------------------------------------------
        # CONSULTA 3: Registrar Nuevo Proyecto de Software (POST /api/projects)
        # -------------------------------------------------------------
        if ($method -eq "POST" -and ($path -eq "/api/projects" -or $path -eq "/api/projects/")) {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $bodyText = $reader.ReadToEnd()
            $reader.Close()

            try {
                $parsed = $bodyText | ConvertFrom-Json
                
                if ([string]::IsNullOrWhiteSpace($parsed.name)) {
                    throw "El campo 'name' es requerido."
                }

                $nextNum = 101 + $global:projects.Count
                $newId = "PRJ-$nextNum"

                $newProj = [PSCustomObject]@{
                    id = $newId
                    name = $parsed.name
                    leadDeveloper = if ($parsed.leadDeveloper) { $parsed.leadDeveloper } else { "Ing. Asignado" }
                    methodology = if ($parsed.methodology) { $parsed.methodology } else { "Scrum" }
                    repositoryUrl = if ($parsed.repositoryUrl) { $parsed.repositoryUrl } else { "https://github.com/nexus/nuevo-proyecto.git" }
                    status = if ($parsed.status) { $parsed.status } else { "active" }
                    priority = if ($parsed.priority) { $parsed.priority } else { "Media" }
                    techStack = if ($parsed.techStack) { @($parsed.techStack) } else { @("Node.js", "Docker") }
                    budget = if ($parsed.budget) { [int]$parsed.budget } else { 30000 }
                    currentSprint = if ($parsed.currentSprint) { [int]$parsed.currentSprint } else { 1 }
                    progress = 10
                    metrics = [PSCustomObject]@{
                        coverage = 85.0
                        maintainability = "A"
                        openBugs = 0
                        vulnerabilities = 0
                        codeSmells = 0
                        lastDeploy = [DateTime]::Now.ToString("yyyy-MM-dd HH:mm")
                    }
                }

                $global:projects.Add($newProj) | Out-Null

                $payload = [PSCustomObject]@{
                    success = $true
                    status = 201
                    message = "Proyecto de software registrado exitosamente"
                    data = $newProj
                }
                Send-JsonResponse $response 201 $payload
            } catch {
                $payload = [PSCustomObject]@{
                    success = $false
                    status = 400
                    error = "Cuerpo de solicitud invalido: $($_.Exception.Message)"
                    code = "VALIDATION_FAILED"
                }
                Send-JsonResponse $response 400 $payload
            }
            continue
        }

        # -------------------------------------------------------------
        # CONSULTA 4: Reporte de Rendimiento y Calidad Global (GET /api/reports/analytics)
        # -------------------------------------------------------------
        if ($method -eq "GET" -and $path -eq "/api/reports/analytics") {
            $total = $global:projects.Count
            $avgCoverage = 0
            $totalBugs = 0
            $totalVulns = 0

            foreach ($p in $global:projects) {
                $avgCoverage += [double]$p.metrics.coverage
                $totalBugs += [int]$p.metrics.openBugs
                $totalVulns += [int]$p.metrics.vulnerabilities
            }

            if ($total -gt 0) {
                $avgCoverage = [Math]::Round(($avgCoverage / $total), 2)
            }

            $activeCount = @($global:projects | Where-Object { $_.status -eq "active" }).Count
            $inReviewCount = @($global:projects | Where-Object { $_.status -eq "in_review" }).Count
            $completedCount = @($global:projects | Where-Object { $_.status -eq "completed" }).Count

            $payload = [PSCustomObject]@{
                success = $true
                status = 200
                timestamp = [DateTime]::UtcNow.ToString("o")
                data = [PSCustomObject]@{
                    totalActiveProjects = $total
                    averageCodeCoverage = $avgCoverage
                    slaComplianceRate = 98.4
                    openBugs = $totalBugs
                    securityVulnerabilities = $totalVulns
                    distributionByStatus = [PSCustomObject]@{
                        active = $activeCount
                        in_review = $inReviewCount
                        completed = $completedCount
                    }
                    methodologyDistribution = [PSCustomObject]@{
                        scrum = @($global:projects | Where-Object { $_.methodology -eq "Scrum" }).Count
                        kanban = @($global:projects | Where-Object { $_.methodology -eq "Kanban" }).Count
                    }
                    auditStatus = "Conforme - Estandares IEEE 829 / ISO 25010"
                }
            }
            Send-JsonResponse $response 200 $payload
            continue
        }

        # Servir archivos estaticos web
        $targetFile = if ($path -eq "/" -or [string]::IsNullOrEmpty($path)) {
            Join-Path $baseDir "index.html"
        } else {
            $cleanPath = $path.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
            Join-Path $baseDir $cleanPath
        }

        Send-FileResponse $response $targetFile

    } catch {
        Write-Host "Error en ejecucion: $($_.Exception.Message)" -ForegroundColor Red
    }
}
