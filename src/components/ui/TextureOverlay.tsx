import React from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

const textureSource = require('@/assets/textures/curvao_universal_texture_overlay_2048.png');

type TextureOverlayProps = {
  opacity?: number;
  style?: StyleProp<ImageStyle>;
};

export function TextureOverlay({ opacity = 0.08, style }: TextureOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={textureSource}
        style={[styles.texture, { opacity }, style]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  texture: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
