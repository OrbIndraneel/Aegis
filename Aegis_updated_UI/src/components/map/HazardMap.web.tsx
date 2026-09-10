import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Polyline, Circle, Rect, Text as SvgText, G, Path, Line } from 'react-native-svg';
import { Hazard, Shelter, EvacuationRoute, Coordinate } from '../../types';

interface Props {
  hazards?: Hazard[];
  shelters?: Shelter[];
  evacuationRoute?: EvacuationRoute | null;
  userLocation?: Coordinate | null;
  onSelectHazard?: (h: Hazard) => void;
  onSelectShelter?: (s: Shelter) => void;
  layers?: any;
}

export const HazardMap: React.FC<Props> = ({
  hazards = [],
  shelters = [],
  evacuationRoute,
  userLocation,
  onSelectHazard,
  onSelectShelter,
}) => {

  // User coordinate relative to East Sikkim SVG frame (near Ranipool)
  const userX = 145;
  const userY = 195;

  return (
    <View style={styles.webMapContainer}>
      <Svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {/* Dark Mountain Geological Base */}
        <Rect width="400" height="500" fill="#0A0F1A" />

        {/* Mountain Contour & Slope Isohyets */}
        <Path
          d="M 0 60 Q 120 30, 250 80 T 400 50"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M 0 140 Q 160 110, 280 160 T 400 130"
          stroke="rgba(148, 163, 184, 0.14)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M 0 230 Q 140 210, 260 260 T 400 220"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M 0 320 Q 180 290, 300 350 T 400 310"
          stroke="rgba(148, 163, 184, 0.14)"
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M 0 410 Q 150 380, 270 440 T 400 400"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Teesta River Valley Water Body */}
        <Path
          d="M 40 500 C 90 420, 160 340, 190 270 C 220 200, 270 120, 310 0 L 330 0 C 290 120, 240 200, 210 270 C 180 340, 110 420, 60 500 Z"
          fill="#06253A"
          stroke="#0284C7"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <SvgText x="135" y="370" fill="#38BDF8" fontSize="10" fontWeight="bold" letterSpacing="1.2" opacity="0.8">
          TEESTA RIVER BASIN
        </SvgText>

        {/* Blocked NH-10 Highway Line (Buried by 20th Mile Debris) */}
        <Polyline
          points="290,40 210,130 180,240 185,275"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="3.5"
          strokeDasharray="6 3"
        />
        <Polyline
          points="185,275 220,330 300,410 320,490"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
        />

        {/* Secondary Mountain Arteries */}
        <Polyline
          points="50,110 145,195 240,240 370,210"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1.8"
        />
        <Polyline
          points="90,440 220,330"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1.5"
        />

        {/* ACTIVE RED CRITICAL HAZARD POLYGON: NH-10 20TH MILE SLOPE COLLAPSE */}
        <Polygon
          points="155,235 235,215 255,295 165,305"
          fill="rgba(239, 68, 68, 0.42)"
          stroke="#EF4444"
          strokeWidth="2.5"
          onPress={() => onSelectHazard?.(hazards[0])}
        />
        <SvgText x="175" y="270" fill="#FECACA" fontSize="11" fontWeight="bold" textAnchor="middle">
          NH-10 MILE 20
        </SvgText>
        <SvgText x="175" y="284" fill="#F87171" fontSize="9" fontWeight="700" textAnchor="middle">
          DEBRIS FAILURE (CRITICAL)
        </SvgText>

        {/* SECONDARY HAZARD: RANIPOOL-SINGTAM ROCKFALL CHUTE */}
        <Polygon
          points="120,130 185,115 195,160 135,170"
          fill="rgba(245, 158, 11, 0.35)"
          stroke="#F59E0B"
          strokeWidth="1.8"
          onPress={() => onSelectHazard?.(hazards[1])}
        />
        <SvgText x="160" y="148" fill="#FDE68A" fontSize="9" fontWeight="bold" textAnchor="middle">
          ROCKFALL CONE
        </SvgText>

        {/* BRO ROAD CLOSURE MARKER AT 20TH MILE CUT */}
        <G transform="translate(185, 255)">
          <Circle cx="0" cy="0" r="10" fill="#991B1B" stroke="#FCA5A5" strokeWidth="2" />
          <Line x1="-5" y1="-5" x2="5" y2="5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="5" y1="-5" x2="-5" y2="5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </G>
        <SvgText x="202" y="259" fill="#FCA5A5" fontSize="9" fontWeight="800">
          BRO CUT [SEALED]
        </SvgText>

        {/* GEOGRAPHIC LABELS: EAST SIKKIM SECTOR */}
        {/* Gangtok Ridge */}
        <SvgText x="285" y="32" fill="#E2E8F0" fontSize="13" fontWeight="bold">
          Gangtok Ridge
        </SvgText>
        <SvgText x="285" y="44" fill="#94A3B8" fontSize="9">
          1,650m • Capital Sector
        </SvgText>

        {/* Ranipool Junction */}
        <SvgText x="145" y="180" fill="#E2E8F0" fontSize="11" fontWeight="bold">
          Ranipool
        </SvgText>
        <SvgText x="145" y="191" fill="#64748B" fontSize="8.5">
          910m Junction
        </SvgText>

        {/* Singtam Staging Valley */}
        <SvgText x="250" y="385" fill="#E2E8F0" fontSize="13" fontWeight="bold">
          Singtam
        </SvgText>
        <SvgText x="250" y="398" fill="#94A3B8" fontSize="9">
          Valley Staging Center
        </SvgText>

        {/* Rangpo Border Entry */}
        <SvgText x="280" y="475" fill="#CBD5E1" fontSize="11" fontWeight="bold">
          Rangpo Transit Hub
        </SvgText>
        <SvgText x="280" y="487" fill="#64748B" fontSize="8.5">
          Sikkim-Bengal Border
        </SvgText>

        {/* Dikchu Confluence */}
        <SvgText x="40" y="130" fill="#94A3B8" fontSize="10" fontWeight="bold">
          Dikchu Basin
        </SvgText>

        {/* DYNAMIC SAFE EVACUATION DETOUR (UPPER RIDGE BYPASS) */}
        {/* Bypasses the blocked 20th Mile pass by routing through the upper mountain ridge */}
        <Polyline
          points="145,195 105,230 115,310 215,360 295,405"
          fill="none"
          stroke="#10B981"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated Directional Dash Overlay */}
        <Polyline
          points="145,195 105,230 115,310 215,360 295,405"
          fill="none"
          stroke="#6EE7B7"
          strokeWidth="2.5"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />

        {/* UPPER RIDGE BYPASS LABEL */}
        <SvgText x="92" y="275" fill="#6EE7B7" fontSize="9" fontWeight="800">
          UPPER RIDGE BYPASS
        </SvgText>

        {/* SAFE STAGING SHELTER (SINGTAM COMPLEX - 295, 405) */}
        <G
          transform="translate(295, 405)"
          onPress={() => onSelectShelter?.(shelters[0])}
        >
          <Circle cx="0" cy="0" r="14" fill="#065F46" stroke="#34D399" strokeWidth="2.5" />
          <SvgText x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            S
          </SvgText>
        </G>
        <SvgText x="315" y="408" fill="#34D399" fontSize="10" fontWeight="bold">
          Singtam Relief Camp
        </SvgText>

        {/* LIVE CIVILIAN USER GPS MARKER WITH PULSE AURA */}
        <G transform={`translate(${userX}, ${userY})`}>
          <Circle cx="0" cy="0" r="18" fill="rgba(59, 130, 246, 0.28)" />
          <Circle cx="0" cy="0" r="7" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2.5" />
        </G>
        <SvgText x={userX + 12} y={userY + 4} fill="#60A5FA" fontSize="9" fontWeight="800">
          YOU (RANIPOOL)
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    backgroundColor: '#0A0F1A',
    position: 'relative',
    overflow: 'hidden',
  },
});
