"""
Combined Disaster Engine — Multi-Stage Early Warning Pipeline (Approach A)
Combines:
  - Stage 1: XGBoost Point Flood Vulnerability Assessment (SIH Model)
  - Stage 2: Graph Attention Network (GAT) Spatial Cascade & Hazard Predictor (ml_engine)

Note: Stage 3 (Emergency Asset & Resource Dispatch) has been intentionally excluded.
"""

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from xgboost import XGBClassifier

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from ml_engine.inference import CascadePredictor
from data_pipeline.landslide_data_pipeline import LandslideDataPipeline
from ml_engine.models.landslide_model import LandslideSusceptibilityModel

# Stage 1 (XGBoost) Asset Paths (Checked both relative to backend-server root and current file)
SIH_DIR_PRIMARY = os.path.join(BACKEND_DIR, "SIH")
SIH_DIR_NESTED = os.path.join(BACKEND_DIR, "SIH", "SIH")
SIH_DIR_PACKAGE = os.path.join(os.path.dirname(BACKEND_DIR), "Combined_Disaster_Model_Package", "SIH", "SIH")

if os.path.exists(os.path.join(SIH_DIR_PRIMARY, "flood_model.json")):
    SIH_DIR = SIH_DIR_PRIMARY
elif os.path.exists(os.path.join(SIH_DIR_NESTED, "flood_model.json")):
    SIH_DIR = SIH_DIR_NESTED
else:
    SIH_DIR = SIH_DIR_PACKAGE

XGB_MODEL_PATH = os.path.join(SIH_DIR, "flood_model.json")
ENCODERS_PATH = os.path.join(SIH_DIR, "encoders.pkl")

STAGE1_FEATURE_COLS = [
    "Rainfall_mm", "Temperature_C", "Humidity_pct", "River_Discharge_m3s",
    "Water_Level_m", "Elevation_m", "Land_Cover", "Soil_Type",
    "Population_Density", "Infrastructure", "Historical_Floods",
]


class CombinedDisasterEngine:
    """
    Unified Multi-Stage Disaster Early Warning Engine.
    Executes Stage 1 (XGBoost Local Risk & Landslide Susceptibility) + Stage 2 (GAT Spatial Cascade Hazard).
    """

    def __init__(self):
        print("Initializing Combined Disaster Engine...")
        self._load_stage1_model()
        self.gat_predictor = CascadePredictor()
        self.landslide_pipeline = LandslideDataPipeline()
        self.landslide_model = LandslideSusceptibilityModel()
        print("[OK] Combined Disaster Engine (SIH 26001 Landslide & Cascade) ready.")

    def predict_landslide_risk(self, zone_inputs: dict) -> dict:
        """
        SIH 26001 Primary Predictor: Ingests weather, soil moisture, DEM slope, and historical data,
        returning landslide susceptibility score, risk level, and SHAP feature attributions.
        """
        processed_features = self.landslide_pipeline.process(zone_inputs)
        model_output = self.landslide_model.predict(processed_features)

        return {
            "processed_features": processed_features,
            "landslide_assessment": model_output,
        }


    def _load_stage1_model(self):
        """Loads trained XGBoost model and categorical encoders."""
        if not os.path.exists(XGB_MODEL_PATH) or not os.path.exists(ENCODERS_PATH):
            raise FileNotFoundError(
                f"Missing Stage 1 assets. Checked:\n  - Model: {XGB_MODEL_PATH}\n  - Encoders: {ENCODERS_PATH}"
            )

        self.xgb_model = XGBClassifier()
        self.xgb_model.load_model(XGB_MODEL_PATH)

        with open(ENCODERS_PATH, "rb") as f:
            self.encoders = pickle.load(f)

    def run_stage1_local_flood_risk(self, zone_data: dict) -> dict:
        """
        Stage 1: Evaluates point-level flood probability and local vulnerability factors
        using the trained XGBoost model.
        """
        row = zone_data.copy()

        # Provide sensible defaults for any missing features
        defaults = {
            "Rainfall_mm": 100.0,
            "Temperature_C": 28.0,
            "Humidity_pct": 75.0,
            "River_Discharge_m3s": 300.0,
            "Water_Level_m": 2.0,
            "Elevation_m": 100.0,
            "Land_Cover": "Urban",
            "Soil_Type": "Clay",
            "Population_Density": 1000,
            "Infrastructure": 1,
            "Historical_Floods": 1,
        }
        for k, v in defaults.items():
            if k not in row or row[k] is None:
                row[k] = v

        # Handle categorical encoding for Land_Cover & Soil_Type
        for col, encoder in self.encoders.items():
            val = row.get(col, "Urban" if col == "Land_Cover" else "Clay")
            if val not in encoder.classes_:
                row[col] = encoder.transform([encoder.classes_[0]])[0]
            else:
                row[col] = encoder.transform([val])[0]

        # Extract features for XGBoost
        X = pd.DataFrame([row])[STAGE1_FEATURE_COLS]
        flood_prob = float(self.xgb_model.predict_proba(X)[0][1])

        population_density = zone_data.get("Population_Density", 1000)
        elevation = zone_data.get("Elevation_m", 50.0)
        historical_floods = zone_data.get("Historical_Floods", 1)
        infrastructure = zone_data.get("Infrastructure", 1)

        # Normalize secondary vulnerability factors
        pop_factor = min(population_density / 2000.0, 1.0)
        elevation_factor = 1.0 - min(elevation / 500.0, 1.0)
        history_factor = 1.0 if historical_floods else 0.0
        infra_factor = 0.0 if infrastructure else 1.0

        # Compute weighted local risk score
        risk_score = round(
            min(
                0.55 * flood_prob
                + 0.15 * pop_factor
                + 0.15 * elevation_factor
                + 0.10 * history_factor
                + 0.05 * infra_factor,
                1.0,
            ),
            3,
        )

        if risk_score >= 0.75:
            level = "Critical"
        elif risk_score >= 0.55:
            level = "High"
        elif risk_score >= 0.30:
            level = "Moderate"
        else:
            level = "Low"

        return {
            "flood_probability": round(flood_prob, 3),
            "risk_score": risk_score,
            "risk_level": level,
            "vulnerability_factors": {
                "population_density_factor": round(pop_factor, 3),
                "elevation_factor": round(elevation_factor, 3),
                "historical_floods_factor": history_factor,
                "infrastructure_factor": infra_factor,
            },
        }

    def run_stage2_spatial_cascade_hazard(
        self,
        latitude: float,
        longitude: float,
        rainfall_mm: float,
        river_level_m: float = 0.0,
        district_id: str = "DIST_01",
        slope_angle_deg: float = 25.0,
        soil_moisture_pct: float = None,
        elevation_m: float = 500.0,
        vegetation_ndvi: float = 0.50,
    ) -> dict:
        """
        Stage 2: Evaluates spatial graph cascade hazards (Landslide / Flash Flood),
        lead time (mins), affected population, and risk polygon using the GAT model.
        """
        gat_res = self.gat_predictor.predict_cascade_hazard(
            latitude=latitude,
            longitude=longitude,
            rainfall_mm=rainfall_mm,
            river_level_m=river_level_m,
            district_id=district_id,
        )

        return {
            "district_id": gat_res["district_id"],
            "primary_hazard": gat_res["primary_hazard"],
            "secondary_cascade_hazard": gat_res["secondary_cascade_hazard"],
            "cascade_probability": gat_res["cascade_probability"],
            "estimated_lead_time_mins": gat_res["estimated_lead_time_mins"],
            "cascade_risk_level": gat_res["risk_level"],
            "affected_population_estimate": gat_res["affected_population_estimate"],
            "severity_score": gat_res["severity_score"],
            "soil_saturation_index": gat_res["soil_saturation_index"],
            "polygon_coordinates": gat_res["polygon_coordinates"],
        }

    def predict(self, zone_inputs: dict) -> dict:
        """
        Main execution pipeline for Approach A (Stage 1 + Stage 2).
        """
        lat = zone_inputs.get("latitude", 22.310)
        lon = zone_inputs.get("longitude", 73.180)
        district_id = zone_inputs.get("district_id", "ZONE_01")

        rainfall_mm = zone_inputs.get("Rainfall_mm", zone_inputs.get("rainfall_mm", 100.0))
        river_level_m = zone_inputs.get("Water_Level_m", zone_inputs.get("river_level_m", 2.0))
        elevation_m = zone_inputs.get("Elevation_m", zone_inputs.get("elevation_m", 200.0))

        # 1. Execute SIH 26001 Primary Landslide Susceptibility Predictor
        landslide_output = self.predict_landslide_risk(zone_inputs)

        # 2. Execute Stage 1 (XGBoost Local Flood Risk)
        stage1_output = self.run_stage1_local_flood_risk(zone_inputs)

        # 3. Execute Stage 2 (GAT Spatial Cascade Hazard Prediction)
        stage2_output = self.run_stage2_spatial_cascade_hazard(
            latitude=lat,
            longitude=lon,
            rainfall_mm=rainfall_mm,
            river_level_m=river_level_m,
            district_id=district_id,
            slope_angle_deg=zone_inputs.get("slope_angle_deg", 25.0),
            soil_moisture_pct=zone_inputs.get("soil_moisture_pct", None),
            elevation_m=elevation_m,
            vegetation_ndvi=zone_inputs.get("vegetation_ndvi", 0.50),
        )

        # 4. Unified Synthesis (Combining Landslide Risk, Local Risk & Stage 2 Cascade Probability)
        s1_risk = stage1_output["risk_score"]
        s2_prob = stage2_output["cascade_probability"]
        ls_score = landslide_output["landslide_assessment"]["landslide_susceptibility_score"]

        unified_risk_score = round(0.40 * ls_score + 0.30 * s1_risk + 0.30 * s2_prob, 3)

        if unified_risk_score >= 0.75:
            unified_level = "Critical"
            action = (
                f"CRITICAL WARNING: High probability of {stage2_output['secondary_cascade_hazard']} "
                f"within {stage2_output['estimated_lead_time_mins']} minutes! Immediate evacuation recommended."
            )
        elif unified_risk_score >= 0.50:
            unified_level = "High"
            action = (
                f"HIGH ALERT: Monitor slope movement and river stage. Secondary hazard "
                f"'{stage2_output['secondary_cascade_hazard']}' probable within {stage2_output['estimated_lead_time_mins']} mins."
            )
        elif unified_risk_score >= 0.30:
            unified_level = "Moderate"
            action = "MODERATE RISK: Landslide advisory active. Alert local emergency management teams."
        else:
            unified_level = "Low"
            action = "LOW RISK: Conditions normal. No immediate action required."

        return {
            "target_location": {
                "latitude": lat,
                "longitude": lon,
                "district_id": district_id,
            },
            "sih_26001_landslide_risk": landslide_output["landslide_assessment"],
            "stage_1_local_flood_risk": stage1_output,
            "stage_2_spatial_cascade_hazard": stage2_output,
            "unified_disaster_assessment": {
                "unified_risk_score": unified_risk_score,
                "unified_risk_level": unified_level,
                "action_recommendation": action,
            },
        }

