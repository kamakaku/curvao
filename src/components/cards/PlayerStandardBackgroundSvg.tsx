import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import Svg, { ClipPath, Defs, Image as SvgImage, LinearGradient, Path, Stop } from 'react-native-svg';

const INNER_FRAME_PATH =
  'M202.834 32H493.206H499.794H790.166L806.167 48.2849H908.291L961 101.929V1294.08L901.702 1354.43H593.918L561.916 1387H498.853H494.147H431.084L399.082 1354.43H91.2979L32 1294.08V101.929L84.7092 48.2849H186.833L202.834 32Z';

type PlayerStandardBackgroundSvgProps = {
  source: ImageSourcePropType;
  clipId?: string;
  imageOpacity?: number;
  darkOverlayOpacity?: number;
  topFade?: boolean;
  bottomFade?: boolean;
};

export function PlayerStandardBackgroundSvg({
  bottomFade,
  clipId = 'innerCardClip',
  darkOverlayOpacity = 0,
  imageOpacity = 1,
  source,
  topFade,
}: PlayerStandardBackgroundSvgProps) {
  const resolved = resolveAssetSource(source);
  const topFadeId = `${clipId}TopFade`;
  const bottomFadeId = `${clipId}BottomFade`;

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Svg height="100%" viewBox="0 0 992 1419.5" width="100%">
        <Defs>
          <ClipPath id={clipId}>
            <Path d={INNER_FRAME_PATH} />
          </ClipPath>
          <LinearGradient id={topFadeId} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#020605" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#020605" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id={bottomFadeId} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#020605" stopOpacity="0" />
            <Stop offset="0.44" stopColor="#020605" stopOpacity="0.82" />
            <Stop offset="1" stopColor="#020605" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <SvgImage
          clipPath={`url(#${clipId})`}
          height="1419.5"
          href={resolved?.uri}
          opacity={imageOpacity}
          preserveAspectRatio="none"
          width="992"
          x="0"
          y="0"
        />
        {darkOverlayOpacity > 0 ? (
          <Path d={INNER_FRAME_PATH} fill="#020605" opacity={darkOverlayOpacity} />
        ) : null}
        {topFade ? (
          <Path d={INNER_FRAME_PATH} fill={`url(#${topFadeId})`} />
        ) : null}
        {bottomFade ? (
          <Path d={INNER_FRAME_PATH} fill={`url(#${bottomFadeId})`} />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
