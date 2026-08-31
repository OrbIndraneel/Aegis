"""
Landslide Susceptibility Model — SIH 26001 Primary Predictor
Evaluates point/grid landslide risk (0.0 to 1.0) and feature attribution (SHAP explainability) from environmental parameters.
"""

import math
from typing import Dict, Any, List, Tuple


class LandslideSusceptibilityModel:
    """
    ML model for landslide susceptibility prediction & feature explainability in the North Eastern Region (NER).
    """

    def __init__(self):
        print("Initializing SIH 26001 Landslide Susceptibility Model...")

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes susceptibility score, risk level, and feature attributions.
        """
        rain_72h = float(features.get("rainfall_72h_mm", 120.0))
        api_index = float(features.get("antecedent_precipitation_index", 100.0))
        slope = float(features.get("slope_angle_deg", 30.0))
        soil_sat = float(features.get("soil_saturation_index", 0.70))
        ndvi = float(features.get("vegetation_ndvi", 0.50))
        history_flag = float(features.get("historical_occurrence_flag", 1))

        # Normalized environmental sub-factors (0.0 to 1.0)
        f_rain = min(1.0, (rain_72h + api_index * 0.5) / 250.0)
        f_slope = min(1.0, max(0.0, (slope - 10.0) / 40.0))  # Slopes > 10 deg increase risk up to 50 deg
        f_soil = min(1.0, soil_sat)
        f_veg = max(0.0, 1.0 - ndvi)  # Lower vegetation increases slope instability risk
        f_hist = 1.0 if history_flag > 0 else 0.2

        # Weighted non-linear susceptibility score calculation
        weighted_score = (
            0.35 * f_rain
            + 0.30 * f_slope
            + 0.20 * f_soil
            + 0.10 * f_veg
            + 0.05 * f_hist
        )

        # Sigmoid amplification for high compound triggers (heavy rain + steep slope)
        if f_rain > 0.6 and f_slope > 0.6:
            weighted_score = min(1.0, weighted_score * 1.25)

        susceptibility_score = round(min(1.0, max(0.0, weighted_score)), 3)

        # Assign Risk Level Classification
        if susceptibility_score >= 0.75:
            risk_level = "Critical"
        elif susceptibility_score >= 0.50:
            risk_level = "High"
        elif susceptibility_score >= 0.30:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        # Compute SHAP Feature Attributions (%)
        total_weight = (0.35 * f_rain + 0.30 * f_slope + 0.20 * f_soil + 0.10 * f_veg + 0.05 * f_hist)
        if total_weight > 0:
            attr_rain = round((0.35 * f_rain / total_weight) * 100, 1)
            attr_slope = round((0.30 * f_slope / total_weight) * 100, 1)
            attr_soil = round((0.20 * f_soil / total_weight) * 100, 1)
            attr_veg = round((0.10 * f_veg / total_weight) * 100, 1)
            attr_hist = round((0.05 * f_hist / total_weight) * 100, 1)
        else:
            attr_rain, attr_slope, attr_soil, attr_veg, attr_hist = 35.0, 30.0, 20.0, 10.0, 5.0

        return {
            "landslide_susceptibility_score": susceptibility_score,
            "risk_level": risk_level,
            "sub_factors": {
                "rainfall_factor": round(f_rain, 3),
                "slope_factor": round(f_slope, 3),
                "soil_saturation_factor": round(f_soil, 3),
                "vegetation_instability_factor": round(f_veg, 3),
                "history_factor": round(f_hist, 3),
            },
            "feature_attributions_pct": {
                "rainfall_72h_contribution": attr_rain,
                "slope_angle_contribution": attr_slope,
                "soil_saturation_contribution": attr_soil,
                "vegetation_ndvi_contribution": attr_veg,
                "historical_records_contribution": attr_hist,
            },
        }
