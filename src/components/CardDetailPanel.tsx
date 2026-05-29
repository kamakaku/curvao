import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { PlayerHeroDetail } from '@/src/components/cards/player/PlayerHeroDetail';
import { StadiumBiographyBoxes } from '@/src/components/cards/stadium/StadiumBiographyBoxes';
import { MatchBiographyBoxes } from '@/src/components/cards/match/MatchBiographyBoxes';
import { MatchHeroDetail } from '@/src/components/cards/match/MatchHeroDetail';
import { StadiumHeroDetail } from '@/src/components/cards/stadium/StadiumHeroDetail';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CardDetailPanel({ card, onClose }: { card?: UserCard; cards?: UserCard[]; onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [internalCard, setInternalCard] = useState<UserCard | undefined>(undefined);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isPlayer = internalCard?.type === 'player';
  const isStadium = internalCard?.type === 'stadium';
  const isMatch = internalCard?.type === 'match';
  const isHeroType = isPlayer || isStadium || isMatch;

  const closePanel = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setInternalCard(undefined);
      onClose?.();
    });
  }, [onClose, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || (gestureState.dy > 40 && gestureState.vy > 0.5)) {
            closePanel();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              friction: 8,
              tension: 40,
            }).start();
          }
        },
      }),
    [closePanel, translateY],
  );

  useEffect(() => {
    if (card && !isModalVisible) {
      setInternalCard(card);
      setIsModalVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 30,
      }).start();
    } else if (card && isModalVisible && card.id !== internalCard?.id) {
      setInternalCard(card);
    } else if (!card && isModalVisible) {
      closePanel();
    }
  }, [card, closePanel, internalCard?.id, isModalVisible, translateY]);

  const handleClose = () => {
    closePanel();
  };

  if (!internalCard && !isModalVisible) {
    return null;
  }

  return (
    <Modal visible={isModalVisible} animationType="none" transparent onRequestClose={handleClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: 'rgba(0,0,0,0.85)',
              opacity: translateY.interpolate({
                inputRange: [0, SCREEN_HEIGHT / 2],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })
            }
          ]} 
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </View>

      <View style={styles.container} pointerEvents="box-none">
        <View style={[styles.listItem, isHeroType && styles.heroListItem]}>
          <Animated.View 
            style={[
              styles.panel, 
              isHeroType && styles.heroPanel, 
              { transform: [{ translateY }] }
            ]}
          >
            {isHeroType ? (
              <>
                {internalCard?.type === 'player' ? (
                  <PlayerHeroDetail card={internalCard} />
                ) : internalCard?.type === 'match' ? (
                  <MatchHeroDetail card={internalCard} />
                ) : internalCard?.type === 'stadium' ? (
                  <StadiumHeroDetail card={internalCard} />
                ) : null}
                <View style={[styles.dragHandleArea, { top: Math.max(10, insets.top) }]} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>
              </>
            ) : (
              <View style={styles.nonHeroWrapper}>
                 <CardRenderer card={internalCard} playerSize="large" />
                 <Pressable onPress={handleClose} style={styles.closeOverlayButton}>
                    <Ionicons name="close-circle" size={48} color="rgba(255,255,255,0.7)" />
                 </Pressable>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    // Transparent for backdrop, controlled by animated overlay
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  listItem: {
    width: '100%',
    flex: 1,
  },
  heroListItem: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    width: '100%',
    backgroundColor: '#080A09',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    height: '94%', // Let it peek from the top
  },
  heroPanel: {
    flex: 1,
    height: '100%',
  },
  nonHeroWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dragHandleArea: {
    alignItems: 'center',
    height: 50,
    left: 0,
    paddingTop: 14,
    paddingBottom: 18,
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  dragHandle: {
    backgroundColor: 'rgba(255,255,255,0.46)',
    borderRadius: 999,
    height: 4,
    width: 48,
  },
  closeOverlayButton: {
    marginTop: 40,
  },
});
