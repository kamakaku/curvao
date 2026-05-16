import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { 
  Easing, 
  Extrapolation, 
  interpolate, 
  runOnJS, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function CardDetailPanel({ card, cards, onClose }: { card?: UserCard; cards?: UserCard[]; onClose?: () => void }) {
  const [internalCards, setInternalCards] = useState<UserCard[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isClosing = useSharedValue(false);
  const flatListRef = useRef<FlatList>(null);
  
  // 0 = closed, 1 = open
  const animValue = useSharedValue(0);

  useEffect(() => {
    if (card && !isModalVisible) {
      const list = cards && cards.length > 0 ? cards : [card];
      const idx = list.findIndex(c => c.id === card.id);
      const safeIdx = Math.max(0, idx);
      
      setInternalCards(list);
      setInitialIndex(safeIdx);
      setIsModalVisible(true);
      isClosing.value = false;
      animValue.value = 0;
      
      // Faster, snappier animation without hooking
      animValue.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    } else if (!card && isModalVisible && !isClosing.value) {
      handleClose();
    }
  }, [card, cards]);

  const handleClose = () => {
    if (isClosing.value) return;
    isClosing.value = true;
    
    // Snappy close
    animValue.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) {
        runOnJS(setIsModalVisible)(false);
        runOnJS(setInternalCards)([]);
        if (onClose) {
          runOnJS(onClose)();
        }
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animValue.value, [0, 1], [0.8, 1], Extrapolation.CLAMP);
    const rotate = `${interpolate(animValue.value, [0, 1], [-8, 0], Extrapolation.CLAMP)}deg`;
    const opacity = interpolate(animValue.value, [0, 0.5, 1], [0, 1, 1], Extrapolation.CLAMP);
    
    return {
      opacity,
      transform: [
        { scale },
        { rotate }
      ],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(0,0,0,${interpolate(animValue.value, [0, 1], [0, 0.85], Extrapolation.CLAMP)})`,
    };
  });

  const closeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animValue.value, [0, 0.7, 1], [0, 0, 1], Extrapolation.CLAMP),
    };
  });

  if (internalCards.length === 0 && !isModalVisible) {
    return null;
  }

  return (
    <Modal visible={isModalVisible} animationType="none" transparent onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Foreground Container (Cards) */}
      <Animated.View 
        style={[StyleSheet.absoluteFill, animatedStyle]} 
        pointerEvents="box-none"
      >
        <FlatList
          ref={flatListRef as any}
          data={internalCards}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          // crucial for rendering performance of heavy SVGs inside FlatList
          maxToRenderPerBatch={2}
          windowSize={3}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            }, 10);
          }}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Pressable 
                style={styles.panel} 
                onPress={(e) => e.stopPropagation()}
              >
                <View renderToHardwareTextureAndroid={true} shouldRasterizeIOS={true}>
                  <CardRenderer card={item} />
                </View>
              </Pressable>
            </View>
          )}
        />
      </Animated.View>

      {/* Close Button - Outside the scaling container */}
      {onClose && (
        <Animated.View style={[styles.closeButtonContainer, closeButtonAnimatedStyle]} pointerEvents="box-none">
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close-circle" size={48} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  listItem: {
    width: SCREEN_WIDTH,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: curvao.spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
  },
  closeButtonContainer: {
    position: 'absolute',
    bottom: curvao.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});







