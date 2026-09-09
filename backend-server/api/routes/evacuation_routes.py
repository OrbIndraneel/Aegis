from fastapi import APIRouter, Depends
from api.schemas.disaster import EvacuationRouteRequest, EvacuationRouteResponse
from database.connection import get_db
from database.repositories import SpatialShelterRepository, haversine_distance
from optimization.route_optimizer import EvacuationRouteOptimizer
from security.rate_limiter import rate_limit, RateLimitTier

router = APIRouter()

@router.post(
    "/evacuation-route",
    response_model=EvacuationRouteResponse,
    dependencies=[Depends(rate_limit(max_requests=RateLimitTier.CONTROLLED[0], window_seconds=RateLimitTier.CONTROLLED[1]))]
)
def calculate_evacuation_route(request: EvacuationRouteRequest, db=Depends(get_db)):
    shelter_repo = SpatialShelterRepository(db_session=db)
    nearby_shelters = shelter_repo.get_nearby_shelters(request.user_lat, request.user_lng)
    
    target_lat = request.user_lat + 0.020
    target_lng = request.user_lng + 0.025
    dest_id = request.destination_shelter_id or "sh_01"

    if nearby_shelters:
        target = nearby_shelters[0]
        target_lat = target["latitude"]
        target_lng = target["longitude"]
        dest_id = target["shelter_id"]

    optimizer = EvacuationRouteOptimizer()
    hazard_polygons = getattr(request, "avoid_hazard_polygons", None)
    
    route_result = optimizer.calculate_evacuation_route(
        origin_lat=request.user_lat,
        origin_lng=request.user_lng,
        target_lat=target_lat,
        target_lng=target_lng,
        hazard_polygons=hazard_polygons
    )

    return EvacuationRouteResponse(
        route_id=f"route_{dest_id}",
        distance_km=route_result["distance_km"],
        estimated_time_mins=route_result["estimated_time_mins"],
        hazard_avoided=route_result["hazard_avoided"],
        route_coordinates=route_result["route_coordinates"]
    )

