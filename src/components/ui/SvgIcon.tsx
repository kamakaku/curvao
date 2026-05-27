import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { SvgXml } from 'react-native-svg';

type SvgIconProps = {
  xml: string;
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function SvgIcon({ xml, width = 24, height = 24, color, style }: SvgIconProps) {
  // Simple replacement to apply color to the SVG paths.
  // This might need more sophisticated handling for complex SVGs or if fill/stroke are explicitly set.
  const coloredXml = color ? xml.replace(/fill="#\w+"/g, `fill="${color}"`).replace(/stroke="#\w+"/g, `stroke="${color}"`) : xml;

  return (
    <Svg width={width} height={height} style={style}>
      <SvgXml xml={coloredXml} width={width} height={height} />
    </Svg>
  );
}