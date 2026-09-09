from fastapi import APIRouter, Depends
from api.schemas.disaster import HazardPredictionRequest, HazardPredictionResponse
from database.connection import get_db
from database.repositories import SpatialHazardRepository
from ml_engine.combined_disaster_engine import CombinedDisasterEngine
from security.rate_limiter import rate_limit, RateLimitTier

router = APIRouter()
engine = CombinedDisasterEngine()

@router.post(
    "/predict-cascade",
    response_model=HazardPredictionResponse,
    dependencies=[Depends(rate_limit(max_requests=RateLimitTier.CONTROLLED[0], window_seconds=RateLimitTier.CONTROLLED[1]))]
)
def predict_cascade(request: HazardPredictionRequest, db=Depends(get_db)):
    # Run Combined Multi-Stage Disaster Engine (Approach A: XGBoost + PyTorch GAT)
    zone_inputs = {
        "latitude": request.latitude,
        "longitude": request.longitude,
        "district_id": request.district_id,
        "Rainfall_mm": request.rainfall_mm,
        "Water_Level_m": request.river_level_m if request.river_level_m is not None else 2.0,
        "Elevation_m": request.elevation_m if request.elevation_m is not None else 100.0,
        "slope_angle_deg": request.slope_angle_deg if request.slope_angle_deg is not None else 25.0,
        "Temperature_C": request.temperature_c if request.temperature_c is not None else 28.0,
        "Humidity_pct": request.humidity_pct if request.humidity_pct is not None else 75.0,
        "River_Discharge_m3s": request.river_discharge_m3s if request.river_discharge_m3s is not None else 300.0,
        "Land_Cover": request.land_cover if request.land_cover is not None else "Urban",
        "Soil_Type": request.soil_type if request.soil_type is not None else "Clay",
        "Population_Density": request.population_density if request.population_density is not None else 1000,
        "Infrastructure": request.infrastructure if request.infrastructure is not None else 1,
        "Historical_Floods": request.historical_floods if request.historical_floods is not None else 1,
    }

    full_res = engine.predict(zone_inputs)
    s2_res = full_res["stage_2_spatial_cascade_hazard"]
    
    # Store hazard polygon in spatial DB if PostGIS connected
    repo = SpatialHazardRepository(db_session=db)
    repo.check_user_in_hazard_zone(request.latitude, request.longitude, [s2_res["polygon_coordinates"]])
    
    return HazardPredictionResponse(
        district_id=s2_res["district_id"],
        primary_hazard=s2_res["primary_hazard"],
        secondary_cascade_hazard=s2_res["secondary_cascade_hazard"],
        cascade_probability=s2_res["cascade_probability"],
        estimated_lead_time_mins=s2_res["estimated_lead_time_mins"],
        risk_level=full_res["unified_disaster_assessment"]["unified_risk_level"],
        affected_population_estimate=s2_res["affected_population_estimate"],
        severity_score=s2_res["severity_score"],
        soil_saturation_index=s2_res["soil_saturation_index"],
        polygon_coordinates=s2_res["polygon_coordinates"],
        stage_1_local_flood_risk=full_res["stage_1_local_flood_risk"],
        unified_disaster_assessment=full_res["unified_disaster_assessment"]
    )
