"""
Automated PyTest Test Suite — SIH 26001 Landslide Intelligence Pipeline & Endpoints
Verifies feature extraction, susceptibility ML predictions, FastAPI routes, and dynamic route optimization.
"""

import pytest
from fastapi.testclient import TestClient

from api.main import app
from data_pipeline.landslide_data_pipeline import LandslideDataPipeline
from ml_engine.models.landslide_model import LandslideSusceptibilityModel
from ml_engine.combined_disaster_engine import CombinedDisasterEngine
from optimization.route_optimizer import EvacuationRouteOptimizer

client = TestClient(app)


def test_landslide_data_pipeline():
    """1. Test feature extraction from weather, soil, slope DEM, and historical inputs."""
    pipeline = LandslideDataPipeline()
    raw_inputs = {
        "latitude": 27.33,
        "longitude": 88.61,
        "district_id": "SIKKIM_EAST",
        "rainfall_mm": 120.0,
        "rainfall_24h_mm": 120.0,
        "rainfall_48h_mm": 180.0,
        "rainfall_72h_mm": 250.0,
        "soil_moisture_pct": 82.0,
        "slope_angle_deg": 35.0,
        "elevation_m": 600.0,
        "vegetation_ndvi": 0.40,
        "historical_landslides_count": 3,
    }

    processed = pipeline.process(raw_inputs)

    assert processed["district_id"] == "SIKKIM_EAST"
    assert processed["rainfall_72h_mm"] == 250.0
    assert processed["antecedent_precipitation_index"] > 100.0
    assert processed["soil_saturation_index"] == 0.82
    assert processed["slope_angle_deg"] == 35.0
    assert processed["historical_occurrence_flag"] == 1


def test_landslide_susceptibility_model():
    """2. Test ML model output score (0.0 to 1.0), risk levels, and SHAP attributions."""
    model = LandslideSusceptibilityModel()
    features = {
        "rainfall_72h_mm": 220.0,
        "antecedent_precipitation_index": 180.0,
        "slope_angle_deg": 36.0,
        "soil_saturation_index": 0.85,
        "vegetation_ndvi": 0.35,
        "historical_occurrence_flag": 1,
    }

    output = model.predict(features)

    assert "landslide_susceptibility_score" in output
    assert 0.0 <= output["landslide_susceptibility_score"] <= 1.0
    assert output["risk_level"] in ["Low", "Moderate", "High", "Critical"]
    assert "feature_attributions_pct" in output
    assert output["feature_attributions_pct"]["rainfall_72h_contribution"] > 0
    assert output["feature_attributions_pct"]["slope_angle_contribution"] > 0


def test_combined_disaster_engine_integration():
    """3. Test CombinedDisasterEngine unified prediction pipeline."""
    engine = CombinedDisasterEngine()
    zone_inputs = {
        "latitude": 27.33,
        "longitude": 88.61,
        "district_id": "SIKKIM_EAST",
        "rainfall_mm": 150.0,
        "slope_angle_deg": 34.0,
        "soil_moisture_pct": 80.0,
    }

    res = engine.predict(zone_inputs)

    assert "sih_26001_landslide_risk" in res
    assert "landslide_susceptibility_score" in res["sih_26001_landslide_risk"]
    assert "stage_2_spatial_cascade_hazard" in res
    assert "unified_disaster_assessment" in res


def test_fastapi_predict_endpoint():
    """4. Test POST /api/landslide/predict endpoint."""
    payload = {
        "latitude": 27.33,
        "longitude": 88.61,
        "district_id": "SIKKIM_EAST",
        "rainfall_72h_mm": 200.0,
        "slope_angle_deg": 32.0,
        "soil_moisture_pct": 75.0,
    }

    response = client.post("/api/landslide/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "sih_26001_landslide_prediction" in data
    assert "disaster_cascade_assessment" in data


def test_fastapi_priority_queue_endpoint():
    """5. Test GET /api/landslide/priority-queue endpoint."""
    response = client.get("/api/landslide/priority-queue")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "priority_queue" in data
    assert len(data["priority_queue"]) > 0
    assert "priority_index" in data["priority_queue"][0]


def test_fastapi_field_reports_endpoints():
    """6. Test POST & GET /api/landslide/field-reports endpoints."""
    report_payload = {
        "reporter_id": "TEST_CIVILIAN_007",
        "reporter_role": "Civilian",
        "latitude": 27.33,
        "longitude": 88.61,
        "incident_type": "Slope Crack",
        "media_url": "https://storage.suraksha.ai/reports/test_crack.jpg",
        "description": "Visible slope crack expanding near highway.",
    }

    # Submit Report
    sub_res = client.post("/api/landslide/field-reports", json=report_payload)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["status"] == "success"
    report_id = sub_data["report_id"]

    # Retrieve Reports
    get_res = client.get("/api/landslide/field-reports")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["status"] == "success"
    assert get_data["total_count"] > 0

    # Verify Report
    ver_res = client.post(f"/api/landslide/verify-report/{report_id}?status=Verified")
    assert ver_res.status_code == 200
    assert ver_res.json()["status"] == "success"


def test_dynamic_evacuation_route_hazard_avoidance():
    """7. Test dynamic route optimization with hazard avoidance."""
    optimizer = EvacuationRouteOptimizer()
    origin_lat, origin_lng = 27.330, 88.610
    target_lat, target_lng = 27.350, 88.630

    hazard_polygon = [
        [27.335, 88.615],
        [27.335, 88.625],
        [27.345, 88.625],
        [27.345, 88.615],
    ]

    res = optimizer.calculate_evacuation_route(
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        target_lat=target_lat,
        target_lng=target_lng,
        hazard_polygons=[hazard_polygon],
    )

    assert "distance_km" in res
    assert "estimated_time_mins" in res
    assert "route_coordinates" in res
    assert len(res["route_coordinates"]) >= 2
