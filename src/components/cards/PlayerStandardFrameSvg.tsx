import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  FeDropShadow,
  Filter,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import type { Rarity } from '@/src/types/models';

const frameColors: Record<Rarity, { dark: string; mid: string; light: string; bright: string }> = {
  standard: {
    dark: '#365844',
    mid: '#8fa79b',
    light: '#d4ffe6',
    bright: '#9fb4aa',
  },
  rare: {
    dark: '#365844',
    mid: '#66c18c',
    light: '#d4ffe6',
    bright: '#00ff6b',
  },
  epic: {
    dark: '#2f275c',
    mid: '#7b5cff',
    light: '#eadcff',
    bright: '#d6ad4b',
  },
  legendary: {
    dark: '#3f3014',
    mid: '#b99047',
    light: '#fff0a6',
    bright: '#d6ad4b',
  },
  oneoff: {
    dark: '#82660d',
    mid: '#f7d66b',
    light: '#ffffff',
    bright: '#fff2a0',
  },
};

const outerFramePath =
  'M184 2.5H492.5H499.5H808L825 19.5H933.5L989.5 75.5V1320L926.5 1383H599.5L565.5 1417H498.5H493.5H426.5L392.5 1383H65.5L2.5 1320V75.5L58.5 19.5H167L184 2.5Z';

const innerBorderPath =
  'M171.834 1H462.206H468.794H759.166L775.167 17.2849H877.291L930 70.9293V1263.08L870.702 1323.43H562.918L530.916 1356H467.853H463.147H400.084L368.082 1323.43H60.2979L1 1263.08V70.9293L53.7092 17.2849H155.833L171.834 1Z';

export function PlayerStandardFrameSvg({
  layer = 'full',
  rarity,
}: {
  layer?: 'base' | 'overlay' | 'shadow' | 'full';
  rarity: Rarity;
}) {
  const colors = frameColors[rarity];
  const showBase = layer === 'base' || layer === 'full';
  const showShadow = layer === 'shadow' || layer === 'overlay' || layer === 'full';
  const showOverlay = layer === 'overlay' || layer === 'full';
  const svgIdPrefix = `playerStandardFrame-${layer}-${rarity}`;
  const innerBorderShadowId = `${svgIdPrefix}-innerBorderShadow`;

  return (
    <View style={styles.layer}>
      <Svg height="100%" style={styles.svg} viewBox="0 0 992 1419.5" width="100%">
        <Defs>
          <LinearGradient gradientUnits="userSpaceOnUse" id="outerFrame" x1="33.5" x2="967" y1="1356.5" y2="54">
            <Stop stopColor={colors.dark} />
            <Stop offset="0.129808" stopColor={colors.mid} />
            <Stop offset="0.730769" stopColor={colors.light} />
            <Stop offset="1" stopColor={colors.bright} />
          </LinearGradient>
          <LinearGradient gradientUnits="userSpaceOnUse" id="innerFrame" x1="30.1783" x2="929.353" y1="1298.04" y2="65.3094">
            <Stop stopColor={colors.dark} />
            <Stop offset="0.129808" stopColor={colors.mid} />
            <Stop offset="0.730769" stopColor={colors.light} />
            <Stop offset="1" stopColor={colors.bright} />
          </LinearGradient>
          <Filter id={innerBorderShadowId} x="-20%" y="-20%" width="140%" height="170%">
            <FeDropShadow dx="0" dy="136" stdDeviation="38" floodColor="#000000" floodOpacity="0.02" />
            <FeDropShadow dx="0" dy="87" stdDeviation="35" floodColor="#000000" floodOpacity="0.15" />
            <FeDropShadow dx="0" dy="49" stdDeviation="29" floodColor="#000000" floodOpacity="0.5" />
            <FeDropShadow dx="0" dy="22" stdDeviation="22" floodColor="#000000" floodOpacity="0.85" />
            <FeDropShadow dx="0" dy="5" stdDeviation="12" floodColor="#000000" floodOpacity="0.98" />
          </Filter>
        </Defs>
        {showBase ? null : null}
        {showShadow || showOverlay ? (
          <>
            {showShadow ? (
              <Path
                d={innerBorderPath}
                fill="none"
                filter={`url(#${innerBorderShadowId})`}
                stroke="#000000"
                strokeOpacity={0.9}
                strokeWidth="10"
                transform="translate(31 31)"
              />
            ) : null}
            {showOverlay ? (
              <>
                <Path
                  d={innerBorderPath}
                  fill="none"
                  stroke="url(#innerFrame)"
                  strokeWidth="2"
                  transform="translate(31 31)"
                />
                <Path
                  d={outerFramePath}
                  fill="none"
                  stroke="url(#outerFrame)"
                  strokeWidth="5"
                />
              </>
            ) : null}
          </>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    overflow: 'visible',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
    zIndex: 0,
  },
});
