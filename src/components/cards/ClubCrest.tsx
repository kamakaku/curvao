import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

const fallbackLogo = require('@/assets/logo_crest.png');

type ClubCrestProps = {
  source?: ImageSourcePropType;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ClubCrest({ source, size = 64, style }: ClubCrestProps) {
  return (
    <View style={[styles.container, { height: size, width: size }, style]}>
      {source ? (
        <Image resizeMode="contain" source={source} style={styles.image} />
      ) : (
        <Image resizeMode="contain" source={fallbackLogo} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
