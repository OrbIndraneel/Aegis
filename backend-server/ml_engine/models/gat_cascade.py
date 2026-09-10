"""
[OPTIMIZED GAT MODEL] Fast-Learning Graph Attention Network (GAT) with Residual Connections & Layer Normalization.
Hits the sweet spot: Fast convergence, gradient stabilization, and robust feature representation.
"""
import math
from typing import Dict, Any, Tuple

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch_geometric.nn import GATConv, LayerNorm
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    nn = None
    F = None
    GATConv = None
    LayerNorm = None


if TORCH_AVAILABLE:
    class GATCascadeNet(nn.Module):
        def __init__(self, in_channels: int = 6, hidden_channels: int = 16, heads: int = 4):
            super(GATCascadeNet, self).__init__()
            
            # Layer 1: Multi-Head Graph Attention Convolution with LayerNorm
            self.gat1 = GATConv(in_channels, hidden_channels, heads=heads, dropout=0.1)
            self.norm1 = LayerNorm(hidden_channels * heads)
            
            # Residual Projection for Skip Connection
            self.res_proj = nn.Linear(in_channels, hidden_channels * heads)
            
            # Layer 2: Aggregating Multi-Head Attention Convolution
            self.gat2 = GATConv(hidden_channels * heads, 32, heads=2, concat=True, dropout=0.1)
            self.norm2 = LayerNorm(64)
            
            # FC Prediction Heads with LeakyReLU activations
            self.fc1 = nn.Linear(64, 32)
            self.fc_prob = nn.Linear(32, 1)
            self.fc_lead_time = nn.Linear(32, 1)
            self.fc_risk = nn.Linear(32, 3)  # [Low, Medium, High]

        def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
            # Layer 1 + Residual Skip Connection + LayerNorm
            res = self.res_proj(x)
            h = self.gat1(x, edge_index)
            h = F.elu(self.norm1(h + res))
            h = F.dropout(h, p=0.1, training=self.training)
            
            # Layer 2 + LayerNorm
            h = F.elu(self.norm2(self.gat2(h, edge_index)))
            
            # Feature Projection
            feat = F.leaky_relu(self.fc1(h), negative_slope=0.1)
            
            # Prediction Outputs
            cascade_prob = torch.sigmoid(self.fc_prob(feat))
            lead_time_mins = F.relu(self.fc_lead_time(feat)) * 60.0 + 15.0  # Scale between 15 and 90 mins
            risk_logits = self.fc_risk(feat)
            
            return cascade_prob, lead_time_mins, risk_logits

        def predict_heuristic(self, rainfall_mm: float, river_level_m: float, slope_deg: float = 35.0) -> Dict[str, Any]:
            # Fast sweet-spot logistic calculation
            z = (rainfall_mm - 75.0) / 25.0 + (river_level_m - 4.0) / 1.5 + (slope_deg - 30.0) / 10.0
            prob = 1.0 / (1.0 + math.exp(-z))
            prob = round(min(0.98, max(0.02, prob)), 2)
            
            if prob >= 0.70:
                risk = "High"
                lead_time = 35
            elif prob >= 0.35:
                risk = "Medium"
                lead_time = 65
            else:
                risk = "Low"
                lead_time = 180
            return {
                "cascade_probability": prob,
                "estimated_lead_time_mins": lead_time,
                "risk_level": risk
            }
else:
    class GATCascadeNet:
        """Fallback Fast-Heuristic Predictor when PyTorch is loading."""
        def __init__(self, in_channels: int = 6):
            self.in_channels = in_channels

        def predict_heuristic(self, rainfall_mm: float, river_level_m: float, slope_deg: float = 35.0) -> Dict[str, Any]:
            # Fast sweet-spot logistic calculation
            z = (rainfall_mm - 75.0) / 25.0 + (river_level_m - 4.0) / 1.5 + (slope_deg - 30.0) / 10.0
            prob = 1.0 / (1.0 + math.exp(-z))
            prob = round(min(0.98, max(0.02, prob)), 2)
            
            if prob >= 0.70:
                risk = "High"
                lead_time = 35
            elif prob >= 0.35:
                risk = "Medium"
                lead_time = 65
            else:
                risk = "Low"
                lead_time = 180
            return {
                "cascade_probability": prob,
                "estimated_lead_time_mins": lead_time,
                "risk_level": risk
            }
