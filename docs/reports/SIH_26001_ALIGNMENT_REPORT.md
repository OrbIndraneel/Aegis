# 📊 CHAM_CHAM — SIH 2026 Problem Statement 26001 Alignment Report & Technical Roadmap

---

## 📌 Executive Summary

This document establishes the technical strategy and phased implementation roadmap for aligning **CHAM_CHAM** with **Smart India Hackathon (SIH) 2026 Problem Statement 26001** (*AI-Based Early Warning and Landslide Risk Monitoring System in NER* by MDoNER).

The core operational thesis of CHAM_CHAM remains unchanged: **Predictive intelligence must drive actionable emergency response.** By specializing our multi-hazard prediction pipeline around landslide susceptibility in the North Eastern Region (NER) while preserving our downstream spatial analysis, GAT cascade reasoning, dynamic route optimization, and dual-role mobile app, CHAM_CHAM delivers a complete chain from hazard prediction to evacuation routing.

---

## 🎯 1. Context & Strategic Selection Rationale

### Selected Problem Statement: SIH26001
* **Title:** AI-Based early warning and landslide Risk Monitoring System in NER (North Eastern Region)
* **Organization:** Ministry of Development of North Eastern Region (MDoNER)
* **Category:** Software | **Theme:** Disaster Management

### Strategic Comparison: Why 26001 Over 26071?

| Criteria | SIH 26001 (Selected) | SIH 26071 (Alternative) | Strategic Advantage of 26001 |
| :--- | :--- | :--- | :--- |
| **Core Operational Target** | Landslide susceptibility, early warning, road disruption, emergency priority | Meteorological/hydrological heavy rainfall & inundation forecasting | Aligns directly with CHAM_CHAM's disaster response architecture |
| **New ML Stack Needed** | Landslide susceptibility feature pipeline (Slope, Rainfall, Soil Moisture) | Dedicated NWP weather model & radar/satellite inundation modeling | Low–Medium ML expansion risk vs High structural shift |
| **Routing & GIS Relevance** | Explicit (road connectivity loss & isolation of remote villages) | Downstream / Indirect | Direct fit for NetworkX / OR-Tools evacuation engine |
| **Project Identity Risk** | Low (Specializes existing decision-support engine) | High (Dilutes CHAM_CHAM into a weather platform) | Preserves core value: *turning risk into action* |

---

## 🧱 2. Core Architectural Pillars Preserved

The following 5 existing architectural pillars **will remain 100% preserved and active**:

1. **PyTorch Geometric (PyG) GAT Engine:** Graph Attention Networks trained on multi-hazard spatial graphs to model secondary disaster chain-reactions (e.g., *Heavy Rainfall → Landslide → Road Blockade → Flood*).
2. **PostgreSQL + PostGIS Spatial Layer:** Spatial indexing, geofencing (`ST_Contains`, `ST_Intersects`), shelter capacity tracking, and OpenStreetMap road network graph management.
3. **NetworkX / OR-Tools Route Solver:** Pathfinding with hazard-aware road edge penalties to output turn-by-turn safe evacuation routes.
4. **FastAPI Backend Server & APIs:** REST endpoints, real-time alert triggers, live data ingestion routines, and background worker tasks.
5. **React Native (Expo) Mobile App:** Dual-role app featuring Civilian evacuee navigation/SOS/offline mode and Authority control room dashboard/simulator.

---

## 🔍 3. Gap Analysis & Technical Solutions

| Identified Gap | Current Problem Context | Proposed Solution (Without Removing Features) |
| :--- | :--- | :--- |
| **Primary Output Alignment** | Current ML outputs general cascade risks rather than explicit landslide risk. | Add dedicated `predict_landslide_risk()` module outputting 0-100% susceptibility grids while passing risk scores to downstream PyG GAT nodes. |
| **Data Feature Ingestion** | Rainfall, slope, soil moisture, and historical data are unformalized. | Build modular `data_pipeline/` adapters for IMD rainfall (24h/72h), DEM slope, and soil moisture sensor metrics. |
| **Field Incident Reporting** | Citizens and rescuers cannot submit ground photos of mudslides or cracks. | Add `field_report.tsx` screen in mobile app with geotagging, photo capture, and offline SQLite queueing. |
| **Emergency Prioritization** | Isolation of villages and road blockages lacks a prioritized queue. | Compute Emergency Priority Index (EPI) in PostGIS based on hazard risk, population exposure, and connectivity loss. |
| **Early Warning Logic** | Raw model probabilities can trigger excessive false alarms. | Implement confidence- and freshness-aware Warning Engine with multi-level alerts (Notice, Watch, Warning). |

---

## 🔄 4. Proposed End-to-End Operational Pipeline

```text
Rainfall / Weather (IMD) ─┐
Soil Moisture Sensors ────┼─> Multi-Source Data Pipeline ─> Feature Store / Spatial Graph
Satellite DEM / Slope ────┤
Historical Landslide Log ─┘
                                        │
                                        ▼
                         Landslide Risk Prediction (ML)
                                        │
                                        ▼
                            PostGIS GIS Risk Map
                                        │
                                        ▼
                         PyTorch Geometric GAT Engine
                                        │
                                        ▼
                     Road & Village Impact Assessment (PostGIS)
                                        │
                                        ▼
                         Emergency Response Prioritization
                                        │
                                        ▼
                  Dynamic Hazard Edge Penalties (NetworkX/OR-Tools)
                                        │
                                        ▼
                     Safest Turn-by-Turn Evacuation Route
                                        │
                                        ▼
                  FastAPI ──> React Native Mobile & Control Room
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
       Civilian App (Alerts, SOS,                    Authority App (Heatmap,
         Safe Routes, Reports)                          Queue, Simulator)
```

---

## 🗓️ 5. Phased Implementation Roadmap

### Phase 0: Formalization & Data Pipeline (Days 1–3)
* **Task 0.1:** Create `landslide_data_pipeline.py` with adapters for IMD rainfall, soil moisture, slope DEM, and historical landslides.
* **Task 0.2:** Build synthetic NER dataset generator for offline testing and verification.

### Phase 1: ML Engine & PostGIS Integration (Days 4–7)
* **Task 1.1:** Implement `landslide_model.py` in `ml_engine/models/` trained on fused environmental features.
* **Task 1.2:** Update `combined_disaster_engine.py` to fuse landslide risk predictions into PyG GAT graph nodes.
* **Task 1.3:** Create PostGIS spatial index tables for landslide risk heatmaps.

### Phase 2: Priority Engine & Dynamic Routing (Days 8–10)
* **Task 2.1:** Create `landslide_routes.py` API with predict, priority-queue, and field-reports endpoints.
* **Task 2.2:** Update `evacuation_routes.py` to run spatial intersections between landslide polygons and OSM road segments in PostGIS.

### Phase 3: Mobile App & Authority Workflows (Days 11–14)
* **Task 3.1:** Build `field_report.tsx` UI in React Native with camera photo capture, geotagging, and offline SQLite sync.
* **Task 3.2:** Update authority `incidents.tsx` and `simulator.tsx` with rainfall threshold simulation sliders.

---

## 📁 6. Codebase File Modification Map

```text
d:\College\Github\cham_cham/
├── backend-server/
│   ├── data_pipeline/
│   │   └── [NEW] landslide_data_pipeline.py      # IMD, Soil, Slope & Historical Adapters
│   ├── ml_engine/
│   │   ├── models/
│   │   │   └── [NEW] landslide_model.py          # Landslide Susceptibility ML Model
│   │   └── [MODIFY] combined_disaster_engine.py  # Fuses Landslide Risk into PyG GAT Nodes
│   ├── api/
│   │   ├── routes/
│   │   │   ├── [NEW] landslide_routes.py         # Priority Queue, Field Reports & Predict APIs
│   │   │   └── [MODIFY] evacuation_routes.py    # Intersects Landslide Polygons with OSM Roads
│   │   └── [MODIFY] main.py                      # Registers new landslide router
├── Suraksha_AI_App/
│   └── app/
│       ├── civilian/
│       │   └── [NEW] field_report.tsx            # Camera, Geotagging & Offline SQLite Queue
│       └── authority/
│           ├── [MODIFY] incidents.tsx            # Report Verification & Priority Dispatch Queue
│           └── [MODIFY] simulator.tsx            # Rainfall Threshold Simulation Slider
```
