# 🧠 CHAM_CHAM — Machine Learning Architecture & Model Delta Report

---

## 📌 Executive Summary

This report provides a comprehensive technical breakdown of the machine learning (ML) architecture designed for **CHAM_CHAM** to fulfill **Smart India Hackathon (SIH) 2026 Problem Statement 26001** (*AI-Based Early Warning and Landslide Risk Monitoring System in NER* by MDoNER).

Specifically, this document outlines **what is ALREADY implemented** in the codebase and **what NEW components/features must be added** to satisfy the SIH 26001 requirements while preserving downstream spatial routing and GIS capabilities.

---

## ⚖️ 1. Direct Comparison: Current ML Model vs. New SIH 26001 Additions

| ML Dimension | What is ALREADY in the Model | What NEW Must Be Added (SIH 26001) |
| :--- | :--- | :--- |
| **Primary Stage 1 Model** | XGBoost classifier trained on generic point flood risk (`flood_model.json`). | **NEW** dedicated Landslide Susceptibility Model (`landslide_model.py`) trained on NER terrain & rainfall. |
| **Rainfall Input Features** | Single static rainfall value (`Rainfall_mm`). | **NEW** 24h, 48h, 72h cumulative rainfall + Antecedent Precipitation Index (API). |
| **Terrain & Soil Features** | Basic `Elevation_m`, `Land_Cover`, `Soil_Type` strings. | **NEW** DEM Slope Angle (degrees), Aspect, Terrain Roughness Index (TRI), and Soil Saturation %. |
| **Satellite Vegetation Input** | Fixed fallback `vegetation_ndvi = 0.50`. | **NEW** Satellite-derived NDVI stream for landcover stability. |
| **PyG GAT Node Features** | 6 feature channels: `[lat, lon, rain, river_lvl, elev, soil_sat]`. | **NEW** 8 feature channels: Injected `[landslide_susceptibility_score, slope_angle]`. |
| **Explainability & Attribution** | Basic vulnerability factors (population, elevation factor). | **NEW** SHAP feature attribution (*e.g., "70% risk from 72h rain + 35° slope"*). |
| **Model Output Schema** | `cascade_probability`, `lead_time_mins`, `risk_level`, `polygon_coords`. | **NEW** Adds `landslide_susceptibility_score`, `feature_attributions`, and `Emergency Priority Index (EPI)`. |

---

## 🛠️ 2. Detailed Breakdown of Existing ML Implementation

The current CHAM_CHAM codebase in `backend-server/ml_engine/` contains:
* **`combined_disaster_engine.py`:** Unified multi-stage disaster pipeline executing Stage 1 (Local Risk) and Stage 2 (Spatial Cascade).
* **`inference.py`:** High-speed PyTorch GAT inference loader (`CascadePredictor`) reading `gat_cascade_v1.pt` weights with a fallback heuristic prediction mode.
* **`models/gat_cascade.py`:** PyTorch Geometric Graph Attention Network (`GATCascadeNet`) model definition with 6-channel node feature inputs (`in_channels=6`).
* **`feature_engineering/graph_builder.py`:** `SpatialGraphBuilder` constructing spatial grid nodes and contiguity edges.

---

## 🚀 3. Detailed Breakdown of New ML Additions

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      STAGE 1: LANDSLIDE SUSCEPTIBILITY MODEL                      │
│   Ingests tabular environmental features: Cumulative Rainfall, Soil Saturation,   │
│   DEM Slope/Aspect, Vegetation NDVI, and Historical Landslide Records.           │
│   Output: Landslide Susceptibility Risk Score R_landslide in [0.0, 1.0]           │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
                                         ▼ (Injected into Graph Node Vectors)
┌───────────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 2: PyTORCH GEOMETRIC (PyG) GAT ENGINE                     │
│   Nodes = Regions/Road Junctions, Edges = Physical Contiguity / Road Edges.       │
│   Calculates spatial attention weights α_ij to model secondary cascade propagation│
│   (Landslide → Road Blockade → Village Cut-off).                                  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

1. **New Landslide Feature Pipeline (`backend-server/data_pipeline/`):**
   Construct `landslide_data_pipeline.py` with adapters for IMD cumulative rainfall, soil moisture, DEM slope, and historical NER landslides.
2. **New Landslide Model Module (`backend-server/ml_engine/models/`):**
   Create `landslide_model.py` trained specifically on NER landslide occurrence features.
3. **GAT Node Vector Expansion (`ml_engine/feature_engineering/`):**
   Expand `GATCascadeNet` `in_channels` from 6 to 8 and inject `landslide_susceptibility_score` into node feature matrices in `graph_builder.py`.
4. **API Output Synthesis (`combined_disaster_engine.py`):**
   Update `predict()` to return explicit landslide susceptibility scores alongside GAT cascade outputs.

---

## 🎯 4. Strategic Selection Rationale

* **Hybrid Architecture Synergy:** XGBoost processes multi-source tabular features (rainfall, slope, soil) with superior precision, while PyG GAT models spatial road/village cascade propagation.
* **Zero Code Base Regression:** Adding a dedicated landslide model as Stage 1 and feeding its outputs into Stage 2 GAT avoids breaking any existing routing, API, or GIS features.
* **Actionable Operational Trust:** Gives authorities clear feature attributions (SHAP) so they understand the exact environmental drivers behind a landslide alert.
