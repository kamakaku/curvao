import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

const INNER_FRAME_PATH =
  'M202.834 32H493.206H499.794H790.166L806.167 48.2849H908.291L961 101.929V1294.08L901.702 1354.43H593.918L561.916 1387H498.853H494.147H431.084L399.082 1354.43H91.2979L32 1294.08V101.929L84.7092 48.2849H186.833L202.834 32Z';

type PlayerStandardBackgroundSvgProps = {
  source: ImageSourcePropType;
};

export function PlayerStandardBackgroundSvg({ source }: PlayerStandardBackgroundSvgProps) {
  const resolved = resolveAssetSource(source);

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Svg height="100%" viewBox="0 0 992 1419.5" width="100%">
        <Defs>
          <ClipPath id="innerCardClip">
            <Path d={INNER_FRAME_PATH} />
          </ClipPath>
        </Defs>
        <SvgImage
          clipPath="url(#innerCardClip)"
          height="1419.5"
          href={resolved?.uri}
          preserveAspectRatio="none"
          width="992"
          x="0"
          y="0"
        />
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
