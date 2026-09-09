import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Polyline, Circle, Rect, Text as SvgText, G, Path } from 'react-native-svg';

interface Props {
  hazards?: any[];
  shelters?: any[];
  evacuationRoute?: any;
  userLocation?: any;
  onSelectHazard?: (h: any) => void;
  onSelectShelter?: (s: any) => void;
  layers?: any;
}

export const HazardMap: React.FC<Props> = () => {
  return (
    <View style={styles.webMapContainer}>
      <Svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {/* Dark Tactical Map Base */}
        <Rect width="400" height="500" fill="#0A0F1A" />

        {/* Korangi Creek Water Body (Bottom Right) */}
        <Path
          d="M 240 500 C 260 440, 280 410, 400 370 L 400 500 Z"
          fill="#06222E"
        />

        {/* Road & Grid Network Lines */}
        <G stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1.5">
          {/* Main Highway / Primary Artery */}
          <Polyline points="20,420 120,380 200,280 260,180 340,70" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" />
          <Polyline points="50,110 380,240" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />
          <Polyline points="120,50 280,480" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />

          {/* Grid Street Network */}
          <Polyline points="0,80 400,80" />
          <Polyline points="0,170 400,170" />
          <Polyline points="0,260 400,260" />
          <Polyline points="0,350 400,350" />
          <Polyline points="0,440 400,440" />

          <Polyline points="80,0 80,500" />
          <Polyline points="160,0 160,500" />
          <Polyline points="240,0 240,500" />
          <Polyline points="320,0 320,500" />
        </G>

        {/* RED CRITICAL HAZARD POLYGON (Sector F Zone) */}
        <Polygon
          points="50,115 250,85 290,200 160,200"
          fill="rgba(239, 68, 68, 0.38)"
          stroke="#FF3B30"
          strokeWidth="2.5"
        />

        {/* Sector F Label inside Hazard Polygon */}
        <SvgText
          x="180"
          y="118"
          fill="#F87171"
          fontSize="15"
          fontWeight="bold"
          letterSpacing="1"
        >
          Sector F
        </SvgText>

        {/* MAP LABELS */}
        {/* Frere Hall (Top Left) */}
        <SvgText x="15" y="100" fill="#E2E8F0" fontSize="13" fontWeight="bold">
          Frere Hall
        </SvgText>
        <SvgText x="15" y="112" fill="#94A3B8" fontSize="10">
          فریئر ہال
        </SvgText>

        {/* Sohail Trust Hospital + Hospital Icon (Top Right) */}
        <SvgText x="150" y="80" fill="#E2E8F0" fontSize="11" fontWeight="bold">
          Sohail Trust Hospital
        </SvgText>
        <Circle cx="340" cy="80" r="11" fill="#DC2626" opacity="0.8" />
        <SvgText x="340" y="84" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
          H
        </SvgText>

        {/* Korangi */}
        <SvgText x="310" y="132" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="1">
          KORANGI
        </SvgText>
        <SvgText x="310" y="144" fill="#64748B" fontSize="9">
          کورنگی
        </SvgText>

        {/* Nasir Colony */}
        <SvgText x="315" y="185" fill="#E2E8F0" fontSize="13" fontWeight="bold">
          Nasir Colony
        </SvgText>

        {/* Korangi Creek Water Label */}
        <SvgText x="280" y="215" fill="#38BDF8" fontSize="11" fontWeight="bold" letterSpacing="1.5">
          KORANGI CREEK
        </SvgText>
        <SvgText x="330" y="235" fill="#0EA5E9" fontSize="9">
          کورنگی کریک
        </SvgText>
        <SvgText x="330" y="247" fill="#0EA5E9" fontSize="9">
          جھاؤں
        </SvgText>

        {/* DEFENCE HOUSING AUTHORITY / PHASE 6 */}
        <SvgText x="70" y="192" fill="#64748B" fontSize="9" fontWeight="bold" letterSpacing="0.5">
          DEFENCE
        </SvgText>
        <SvgText x="70" y="202" fill="#64748B" fontSize="9" fontWeight="bold" letterSpacing="0.5">
          HOUSING
        </SvgText>
        <SvgText x="70" y="212" fill="#64748B" fontSize="9" fontWeight="bold" letterSpacing="0.5">
          AUTHORITY
        </SvgText>
        <SvgText x="70" y="242" fill="#E2E8F0" fontSize="11" fontWeight="bold" letterSpacing="1">
          PHASE 6
        </SvgText>

        {/* Camera Icon Marker (Near Phase 6) */}
        <G transform="translate(45, 235)">
          <Circle cx="10" cy="10" r="12" fill="#8B5CF6" opacity="0.9" />
          <Rect x="5" y="6" width="10" height="8" rx="2" fill="#FFFFFF" />
          <Circle cx="10" cy="10" r="2" fill="#8B5CF6" />
        </G>

        {/* Yousuf Shah Shrine */}
        <SvgText x="270" y="450" fill="#64748B" fontSize="10">
          Yousuf Shah Shrine
        </SvgText>

        {/* BRIGHT GREEN EVACUATION ROUTE POLYLINE */}
        <Polyline
          points="22,258 135,232 170,165 300,60"
          fill="none"
          stroke="#22C55E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* USER LOCATION BLUE DOT */}
        <G transform="translate(22, 258)">
          <Circle cx="0" cy="0" r="14" fill="rgba(59, 130, 246, 0.3)" />
          <Circle cx="0" cy="0" r="7" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2.5" />
        </G>
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

