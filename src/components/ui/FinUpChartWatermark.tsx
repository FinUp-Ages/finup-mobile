import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';

interface FinUpChartWatermarkProps {
  width?: number | string;
  height?: number | string;
}

export function FinUpChartWatermark({ width = '100%', height = '100%' }: FinUpChartWatermarkProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height={height} viewBox="0 0 390 600" width={width}>
        <Defs>
          <SvgGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.10" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
          </SvgGradient>
          <SvgGradient id="curveGrad" x1="0" x2="1" y1="1" y2="0">
            <Stop offset="0" stopColor="#60A5FA" stopOpacity="0.08" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.18" />
          </SvgGradient>
        </Defs>

        {/* Bar 1 */}
        <Rect
          fill="url(#barGrad)"
          height="140"
          rx="12"
          width="48"
          x="30"
          y="360"
        />

        {/* Bar 2 */}
        <Rect
          fill="url(#barGrad)"
          height="220"
          rx="12"
          width="48"
          x="95"
          y="280"
        />

        {/* Bar 3 */}
        <Rect
          fill="url(#barGrad)"
          height="310"
          rx="12"
          width="48"
          x="160"
          y="190"
        />

        {/* Bar 4 */}
        <Rect
          fill="url(#barGrad)"
          height="390"
          rx="12"
          width="48"
          x="225"
          y="110"
        />

        {/* Bar 5 */}
        <Rect
          fill="url(#barGrad)"
          height="460"
          rx="12"
          width="48"
          x="290"
          y="40"
        />

        {/* Ascending Trend Dynamic Curve */}
        <Path
          d="M 10 490 C 80 470, 140 400, 190 280 C 240 160, 310 90, 380 40 L 380 75 C 310 120, 240 195, 190 310 C 140 425, 80 495, 10 520 Z"
          fill="url(#curveGrad)"
        />
      </Svg>
    </View>
  );
}
