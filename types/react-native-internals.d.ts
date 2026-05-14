declare module 'react-native/Libraries/Image/resolveAssetSource' {
  import type { ImageResolvedAssetSource, ImageSourcePropType } from 'react-native';

  export default function resolveAssetSource(source: ImageSourcePropType): ImageResolvedAssetSource | undefined;
}
