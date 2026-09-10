import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export const RescueIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 290,
  height = 205,
}) => {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 300 220" fill="none">
        <Defs>
          {/* Ambient Glow Behind Illustration */}
          <RadialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F5B800" stopOpacity="0.18" />
            <Stop offset="60%" stopColor="#D97706" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#0D0D0E" stopOpacity="0" />
          </RadialGradient>

          {/* Gold Accent Gradient */}
          <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FCD34D" />
            <Stop offset="50%" stopColor="#F5B800" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>
        </Defs>

        {/* Outer Soft Ambient Glow */}
        <Circle cx="150" cy="110" r="95" fill="url(#bgGlow)" />

        {/* Inner Soft Cream/White Background Circle */}
        <Circle cx="150" cy="110" r="76" fill="#F8F7F2" />

        {/* Subtle GIS Radar Rings on Background */}
        <Circle cx="150" cy="110" r="76" stroke="rgba(245, 184, 0, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
        <Circle cx="150" cy="110" r="54" stroke="rgba(245, 184, 0, 0.15)" strokeWidth="1" strokeDasharray="2 4" />

        {/* --- DRONE OVERHEAD --- */}
        <G transform="translate(152, 10)">
          {/* Propeller Blades */}
          <Path d="M -24 8 L 2 8" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M 12 8 L 38 8" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Rotor Glow Arcs */}
          <Path d="M -18 5 C -22 2, -10 2, -10 5" stroke="#F5B800" strokeWidth="2" fill="none" />
          <Path d="M 22 5 C 18 2, 30 2, 30 5" stroke="#F5B800" strokeWidth="2" fill="none" />

          {/* Drone Frame Arms & Body */}
          <Path d="M -12 8 L -4 18 L 20 18 L 28 8" stroke="#18181B" strokeWidth="2" fill="none" />
          <Rect x="2" y="13" width="12" height="9" rx="2" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
          
          {/* Parcel Suspension Tether */}
          <Path d="M 8 22 L 8 35" stroke="#18181B" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Emergency Payload Container */}
          <Rect x="2" y="35" width="12" height="13" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
          {/* Medical / Relief Cross Badge */}
          <Path d="M 4 41.5 H 12 M 8 37.5 V 45.5" stroke="#F5B800" strokeWidth="2" strokeLinecap="round" />
        </G>

        {/* --- LOCATION PIN BADGE ABOVE RESCUE WORKER --- */}
        <G transform="translate(108, 42)">
          <Circle cx="0" cy="0" r="11" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
          <Path d="M 0 -6 C -3 -6 -5 -4 -5 -1 C -5 3 0 7 0 7 C 0 7 5 3 5 -1 C 5 -4 3 -6 0 -6 Z" fill="#18181B" />
          <Circle cx="0" cy="-2" r="1.5" fill="#F5B800" />
        </G>

        {/* Signal Ripple Waves */}
        <Path d="M 132 48 Q 136 44 140 48" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <Path d="M 130 52 Q 138 46 144 52" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* --- PERSON 1 (LEFT - RESCUE WORKER WITH HOOD & BACKPACK) --- */}
        <G>
          {/* Hooded Head */}
          <Path d="M 104 70 C 98 70, 94 76, 94 82 C 94 88, 100 92, 106 92 Z" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
          <Circle cx="106" cy="80" r="4" fill="#18181B" />
          <Path d="M 102 82 C 104 84, 108 84, 110 82" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Yellow Tech Jacket & Straps */}
          <Path d="M 94 92 L 86 100 L 82 120 L 92 124 L 98 108 L 114 108 L 118 92 Z" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
          {/* White Rescue Pack */}
          <Rect x="76" y="98" width="14" height="20" rx="3" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
          <Path d="M 80 106 H 86" stroke="#18181B" strokeWidth="2" />

          {/* Arm holding device */}
          <Path d="M 112 96 L 126 90 L 132 94" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <Rect x="130" y="86" width="6" height="10" rx="1.5" fill="#18181B" />

          {/* Dark Pants & Yellow Boots */}
          <Path d="M 92 124 L 88 144 L 96 150 L 102 124 Z" fill="#18181B" stroke="#18181B" strokeWidth="1" />
          <Path d="M 102 124 L 110 142 L 120 144 L 112 122 Z" fill="#18181B" stroke="#18181B" strokeWidth="1" />
          {/* Boots */}
          <Path d="M 84 144 Q 92 144 98 152" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
          <Path d="M 108 142 Q 116 140 124 146" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
        </G>

        {/* --- PERSON 2 (RIGHT - EVACUEE IN POLKA DOTS REACHING UP) --- */}
        <G>
          {/* Head & Hair */}
          <Path d="M 174 65 C 168 65 162 70 162 78 C 162 84 168 90 176 90 C 182 90 186 84 186 78 Z" fill="#18181B" />
          <Circle cx="178" cy="74" r="3" fill="#FFFFFF" />

          {/* Torso / White Top */}
          <Path d="M 166 90 L 158 114 L 180 114 L 184 90 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
          <Path d="M 158 114 H 182" stroke="#F5B800" strokeWidth="4" />

          {/* Raised Arm Reaching to Drone */}
          <Path d="M 178 92 L 170 60 L 164 48" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Yellow Polka-Dot Trousers */}
          <Path d="M 158 118 L 154 150 L 166 150 L 170 128 L 176 150 L 186 150 L 182 118 Z" fill="#F5B800" stroke="#18181B" strokeWidth="2" />
          {/* Crisp White Dots */}
          <Circle cx="162" cy="126" r="2.5" fill="#FFFFFF" />
          <Circle cx="176" cy="124" r="2.5" fill="#FFFFFF" />
          <Circle cx="160" cy="140" r="2.5" fill="#FFFFFF" />
          <Circle cx="180" cy="140" r="2.5" fill="#18181B" />

          {/* Shoes */}
          <Path d="M 150 150 H 166 V 154 H 150 Z" fill="#18181B" />
          <Path d="M 176 150 H 190 V 154 H 176 Z" fill="#18181B" />
        </G>

        {/* Luggage Suitcase Next to Evacuee */}
        <G transform="translate(142, 130)">
          <Rect x="0" y="0" width="18" height="24" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
          <Path d="M 6 -4 H 12 V 0 H 6 Z" stroke="#18181B" strokeWidth="2" fill="none" />
          <Path d="M 9 0 V 24" stroke="#18181B" strokeWidth="1.5" />
        </G>

        {/* Ground Baseline & Yellow Wheels Accent */}
        <Path d="M 130 158 H 195" stroke="#18181B" strokeWidth="2" />
        <Circle cx="144" cy="161" r="3.5" fill="#F5B800" stroke="#18181B" strokeWidth="1.5" />
        <Circle cx="160" cy="161" r="3.5" fill="#F5B800" stroke="#18181B" strokeWidth="1.5" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
});
