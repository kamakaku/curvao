import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    boxShadow?: string;
    pointerEvents?: 'auto' | 'none' | 'box-only' | 'box-none';
  }

  interface TextStyle {
    textShadow?: string;
  }

  interface ImageStyle {
    boxShadow?: string;
    pointerEvents?: 'auto' | 'none' | 'box-only' | 'box-none';
  }
}
