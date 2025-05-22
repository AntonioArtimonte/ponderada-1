import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Circle, Rect, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function BackgroundShapes() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A3D9FF" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#FFD3E2" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Soft circles */}
        <Circle cx={width * 0.2} cy={height * 0.3} r={100} fill="url(#grad1)" />
        <Circle cx={width * 0.8} cy={height * 0.7} r={120} fill="#FFF5BA" fillOpacity={0.15} />

        {/* Angular polygon */}
        <Polygon
          points={`${width * 0.5},${height * 0.1} ${width * 0.7},${height * 0.4} ${width * 0.4},${height * 0.5}`}
          fill="#FFD3E2"
          fillOpacity={0.1}
        />
      </Svg>
    </View>
  );
}