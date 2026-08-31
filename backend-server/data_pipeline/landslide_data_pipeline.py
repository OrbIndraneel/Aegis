"""
Landslide Data Pipeline — SIH 26001 Multi-Source Feature Extractor
Ingests weather, soil moisture, satellite terrain DEM, and historical landslide data for the North Eastern Region (NER).
"""

import math
from typing import Dict, Any, List, Optional


class RainfallAdapter:
    """Ingests live / station weather feeds and derives cumulative & antecedent rainfall metrics."""

    @staticmethod
    def extract_rainfall_features(raw_weather: Dict[str, Any]) -> Dict[str, float]:
        current_rain = float(raw_weather.get("rainfall_mm", raw_weather.get("Rainfall_mm", 0.0)))
        rain_24h = float(raw_weather.get("rainfall_24h_mm", current_rain))
        rain_48h = float(raw_weather.get("rainfall_48h_mm", rain_24h * 1.6))
        rain_72h = float(raw_weather.get("rainfall_72h_mm", rain_48h * 1.4))

        # Antecedent Precipitation Index (API) = Sum(k^i * P_i) where k ~ 0.85
        api_index = round(rain_24h + 0.85 * (rain_48h - rain_24h) + (0.85 ** 2) * (rain_72h - rain_48h), 2)

        return {
            "rainfall_current_mm": current_rain,
            "rainfall_24h_mm": round(rain_24h, 2),
            "rainfall_48h_mm": round(rain_48h, 2),
            "rainfall_72h_mm": round(rain_72h, 2),
            "antecedent_precipitation_index": api_index,
        }


class SoilMoistureAdapter:
    """Ingests soil sensor telemetry & satellite soil moisture saturation indices."""

    @staticmethod
    def extract_soil_features(raw_soil: Dict[str, Any]) -> Dict[str, float]:
        soil_pct = float(raw_soil.get("soil_moisture_pct", 55.0))
        # Compute soil saturation index (0.0 to 1.0)
        saturation_index = min(1.0, max(0.0, soil_pct / 100.0))

        return {
            "soil_moisture_pct": round(soil_pct, 2),
            "soil_saturation_index": round(saturation_index, 3),
        }


class TerrainAdapter:
    """Extracts terrain & elevation DEM parameters (slope, aspect, elevation, TRI)."""

    @staticmethod
    def extract_terrain_features(raw_terrain: Dict[str, Any]) -> Dict[str, float]:
        elevation = float(raw_terrain.get("elevation_m", raw_terrain.get("Elevation_m", 450.0)))
        slope = float(raw_terrain.get("slope_angle_deg", 28.0))
        aspect = float(raw_terrain.get("aspect_deg", 180.0))  # South-facing default
        ndvi = float(raw_terrain.get("vegetation_ndvi", 0.55))

        # Terrain Roughness Index (TRI) approximation from slope & elevation
        tri = round(math.sin(math.radians(slope)) * (elevation / 100.0), 2)

        return {
            "elevation_m": round(elevation, 1),
            "slope_angle_deg": round(slope, 1),
            "aspect_deg": round(aspect, 1),
            "vegetation_ndvi": round(ndvi, 2),
            "terrain_roughness_index": tri,
        }


class HistoricalLandslideAdapter:
    """Ingests NER historical landslide occurrence frequency and spatial density."""

    @staticmethod
    def extract_historical_features(district_id: str, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        history_count = int(raw_inputs.get("historical_landslides_count", raw_inputs.get("Historical_Floods", 1)))
        has_history = history_count > 0

        return {
            "historical_landslides_count": history_count,
            "historical_occurrence_flag": 1 if has_history else 0,
        }


class LandslideDataPipeline:
    """Unified pipeline converting multi-source NER environmental feeds into an ML-ready feature dictionary."""

    def __init__(self):
        self.rainfall_adapter = RainfallAdapter()
        self.soil_adapter = SoilMoistureAdapter()
        self.terrain_adapter = TerrainAdapter()
        self.history_adapter = HistoricalLandslideAdapter()

    def process(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        district_id = raw_inputs.get("district_id", "NER_ZONE_01")
        lat = float(raw_inputs.get("latitude", 27.33))  # Example NER default (Sikkim/Assam region)
        lon = float(raw_inputs.get("longitude", 88.61))

        rf_feats = self.rainfall_adapter.extract_rainfall_features(raw_inputs)
        soil_feats = self.soil_adapter.extract_soil_features(raw_inputs)
        terrain_feats = self.terrain_adapter.extract_terrain_features(raw_inputs)
        hist_feats = self.history_adapter.extract_historical_features(district_id, raw_inputs)

        combined = {
            "district_id": district_id,
            "latitude": lat,
            "longitude": lon,
            **rf_feats,
            **soil_feats,
            **terrain_feats,
            **hist_feats,
        }

        return combined
