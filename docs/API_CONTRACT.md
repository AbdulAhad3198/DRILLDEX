# eRTMAC-NWIS Backend API Contract Specification

**Nearby Wells Intelligence System (eRTMAC-NWIS)**  
**Problem Statement ID:** 26121 | **Organization:** Oil India Limited (OIL)

This document specifies the REST API contracts, request/response formats, and WebSocket message schemas for connecting the Next.js eRTMAC-NWIS frontend with a production backend (FastAPI / Python, PostgreSQL / PostGIS, and AI/ML RAG pipeline).

---

## 1. Environment & Architecture Overview

- **Default Protocol:** HTTPS REST API & WSS WebSockets
- **Standard Base Path:** `/api/v1`
- **Response Format:** JSON (`application/json`)
- **Geospatial Engine:** PostGIS (EPSG:4326 / WGS84)

### Standard Response Envelope

All API endpoints return JSON conforming to the following structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional operational summary message",
  "error": null,
  "timestamp": "2026-09-29T10:00:00.000Z"
}
```

### Standard Error Format

```json
{
  "success": false,
  "data": null,
  "error": "Detailed error description",
  "statusCode": 400,
  "timestamp": "2026-09-29T10:00:00.000Z"
}
```

---

## 2. REST Endpoints

### 2.1 Active Well Telemetry

#### `GET /api/v1/wells/active`
Returns current active drilling state, telemetry parameters, and location.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "WELL-NWIS-01",
    "name": "WELL-NWIS-01",
    "code": "WELL-NWIS-01",
    "field": "Prototype Field Alpha",
    "block": "Block-AA-ONHP-2026/1",
    "basin": "Upper Assam Shelf Basin",
    "location": "Assam, India",
    "lat": 27.4912,
    "lng": 95.3421,
    "spudDate": "12 Apr 2026",
    "status": "DRILLING",
    "connection": "LIVE",
    "dataSource": "eRTMAC Stream",
    "operator": "Oil India Limited (OIL)",
    "currentFormation": "Formation X",
    "lithology": "Interbedded Sandstone / Fractured Carbonaceous Shale",
    "parameters": {
      "depth": 4980,
      "targetDepth": 5500,
      "rop": 18.4,
      "ropDeltaPct": 12,
      "wob": 24,
      "torque": 31.8,
      "torqueDeltaPct": 8,
      "rpm": 118,
      "spp": 3240,
      "flowRate": 620,
      "mudWeight": 1.18,
      "ecd": 1.24,
      "gasUnits": 42,
      "pitVolume": 480,
      "tripMargin": 240
    }
  }
}
```

---

### 2.2 Offset / Nearby Wells GIS API

#### `GET /api/v1/wells/nearby`
Queries nearby historical offset wells sorted by distance and similarity score.

**Query Parameters:**
- `lat` *(float, optional)*: Current latitude (e.g. 27.4912)
- `lng` *(float, optional)*: Current longitude (e.g. 95.3421)
- `radiusKm` *(float, optional)*: Radius filter in kilometers (default: 10.0)
- `formation` *(string, optional)*: Geological formation filter (e.g. "Formation X")
- `riskLevel` *(string, optional)*: "Significant" | "Moderate" | "Low"
- `search` *(string, optional)*: Search keyword for well code or name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "WELL-A",
      "name": "Well A",
      "code": "OFFSET-A-042",
      "distanceKm": 3.0,
      "bearing": "NW (315°)",
      "lat": 27.5115,
      "lng": 95.3218,
      "formation": "Formation X",
      "lithology": "Micro-fractured Sandstone / Shale",
      "wellType": "Development",
      "spudDate": "15 Jan 2021",
      "completedDate": "28 Apr 2021",
      "drillingDuration": "103 days",
      "totalDepth": 5320,
      "criticalDepth": 5040,
      "status": "Producing",
      "riskCategory": "Significant",
      "similarityScore": 91,
      "similarityBreakdown": {
        "geographic": 92,
        "formation": 96,
        "depth": 87,
        "parameter": 89
      },
      "historicalEventsList": ["Mud Loss", "Lost Circulation", "Torque Spike"],
      "relevantDocuments": [
        { "id": "DOC-DDR-WELL-A-042", "name": "DDR-2021-WELL-A-042", "type": "DDR" }
      ],
      "summaryNote": "Experienced severe mud loss (78 bbl/hr) at 5,040 m upon entering depleted sandstone member.",
      "riskHistory": "High mud loss zone at 5,040 m; required coarse LCM pill and 4.5h hesitation squeeze."
    }
  ]
}
```

---

### 2.3 Drilling Parameters & Depth Series

#### `GET /api/v1/wells/{wellId}/depth-series`
Returns depth vs. parameter log series for charts (ROP, WOB, Torque, SPP, Flow Rate, Mud Weight).

**Response:**
```json
{
  "success": true,
  "data": [
    { "depth": 4800, "rop": 14.2, "wob": 22.0, "torque": 26.5, "spp": 2980, "flowRate": 580, "mudWeight": 1.15 },
    { "depth": 4980, "rop": 18.4, "wob": 24.0, "torque": 31.8, "spp": 3240, "flowRate": 620, "mudWeight": 1.18 }
  ]
}
```

---

### 2.4 AI Risk Engine & Evidence API

#### `GET /api/v1/wells/{wellId}/risk`
Returns AI risk scoring breakdown across operational categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "wellId": "WELL-NWIS-01",
    "currentDepth": 4980,
    "overallScore": 68,
    "overallLevel": "MEDIUM",
    "categories": [
      { "category": "Mud Loss", "scorePct": 78, "level": "High", "contributingWellsCount": 3 },
      { "category": "Stuck Pipe", "scorePct": 61, "level": "Moderate", "contributingWellsCount": 2 },
      { "category": "High Torque", "scorePct": 82, "level": "High", "contributingWellsCount": 3 }
    ]
  }
}
```

---

### 2.5 AI Knowledge Base & RAG Query

#### `POST /api/v1/knowledge/query`
Executes semantic RAG query over historical offset WCRs, DDRs, and Mud Logs.

**Request Body:**
```json
{
  "query": "Show mud loss incidents near 5,040 m in Formation X",
  "wellId": "WELL-NWIS-01",
  "depth": 4980,
  "formation": "Formation X"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Show mud loss incidents near 5,040 m in Formation X",
    "summary": "3 nearby offset wells experienced mud loss between 5,020 m and 5,070 m in Formation X.",
    "keyInsights": [
      "Well A experienced 78 bbl/hr mud loss at 5,040 m."
    ],
    "citations": [
      {
        "documentId": "DOC-DDR-WELL-A-042",
        "documentTitle": "Daily Drilling Report - Well A",
        "wellName": "Well A",
        "pageNumber": 4,
        "snippet": "Lost 78 bbl mud upon penetrating micro-fractured carbonaceous shale at 5,040 m."
      }
    ],
    "confidenceScore": 0.89
  }
}
```

---

### 2.6 System Status API

#### `GET /api/v1/system/status`
Returns live connectivity health across system integrations.

**Response:**
```json
{
  "success": true,
  "data": {
    "ertmacStream": { "name": "eRTMAC Data Stream", "status": "CONNECTED", "latencyMs": 18 },
    "nwisEngine": { "name": "NWIS Knowledge Base & Risk Engine", "status": "OPERATIONAL", "latencyMs": 34 },
    "gisService": { "name": "GIS Mapping Service", "status": "CONNECTED", "latencyMs": 22 },
    "historicalDatabase": { "name": "Historical Well Index", "status": "SYNCED", "latencyMs": 15 },
    "lastSyncedTimestamp": "2026-09-29T10:00:00.000Z",
    "isBackendConnected": true
  }
}
```

---

## 3. WebSocket Real-Time Specification

- **Connection URL:** `wss://<backend-domain>/ws/drilling`

### Event: `drilling:update`
Pushed by server every 1–3 seconds with updated telemetry.

```json
{
  "event": "drilling:update",
  "wellId": "WELL-NWIS-01",
  "timestamp": "2026-09-29T10:00:02.000Z",
  "parameters": {
    "depth": 4981.2,
    "rop": 18.6,
    "wob": 24.2,
    "torque": 32.1,
    "spp": 3255
  }
}
```

---

## 4. Operational Notes
1. **Decision Support Only:** The frontend displays evidence and recommendations to drilling engineers without taking autonomous control.
2. **Mock Mode Fallback:** When `NEXT_PUBLIC_USE_MOCK_DATA=true` or when no API base URL is configured, all services fall back to local structured mock datasets without throwing errors or breaking the interface.
