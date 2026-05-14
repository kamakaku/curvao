import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type PlayerStandardOuterClipSvgProps = {
  fill: string;
};

const OUTER_FRAME_PATH =
  'M184 2.5H492.5H499.5H808L825 19.5H933.5L989.5 75.5V1320L926.5 1383H599.5L565.5 1417H498.5H493.5H426.5L392.5 1383H65.5L2.5 1320V75.5L58.5 19.5H167L184 2.5Z';
const OVERSCAN_RECT_PATH = 'M-24 -24H1016V1444H-24V-24Z';

export function PlayerStandardOuterClipSvg({ fill }: PlayerStandardOuterClipSvgProps) {
  return (
    <View style={styles.layer}>
      <Svg height="100%" viewBox="0 0 992 1419.5" width="100%">
        <Path d={`${OVERSCAN_RECT_PATH} ${OUTER_FRAME_PATH}`} fill={fill} fillRule="evenodd" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
});
