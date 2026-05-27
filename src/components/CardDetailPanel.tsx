import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { PlayerConnectionStats } from '@/src/components/cards/player/PlayerConnectionStats';
import { PlayerBiographyBoxes } from '@/src/components/cards/player/PlayerBiographyBoxes';
import { PlayerHighlightMoments } from '@/src/components/cards/player/PlayerHighlightMoments';
import { PlayerCardInfoAccordion } from '@/src/components/cards/player/PlayerCardInfoAccordion';
import { StadiumBiographyBoxes } from '@/src/components/cards/stadium/StadiumBiographyBoxes';
import { MatchBiographyBoxes } from '@/src/components/cards/match/MatchBiographyBoxes';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CardDetailPanel({ card, onClose }: { card?: UserCard; cards?: UserCard[]; onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [internalCard, setInternalCard] = useState<UserCard | undefined>(undefined);
  const translateY = useRef(new Animated.Value(0)).current;
  const isPlayer = internalCard?.type === 'player';
  const isStadium = internalCard?.type === 'stadium';
  const isMatch = internalCard?.type === 'match';
  const isHeroType = isPlayer || isStadium || isMatch;

  const closePanel = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(0);
      setIsModalVisible(false);
      setInternalCard(undefined);
      onClose?.();
    });
  }, [onClose, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isHeroType,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          isHeroType && gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          isHeroType && gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 0.85) {
            closePanel();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 70,
          }).start();
        },
      }),
    [closePanel, isHeroType, translateY],
  );

  useEffect(() => {
    if (card && !isModalVisible) {
      translateY.setValue(0);
      setInternalCard(card);
      setIsModalVisible(true);
    } else if (card && isModalVisible && card.id !== internalCard?.id) {
      translateY.setValue(0);
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
    <Modal visible={isModalVisible} animationType="fade" transparent onRequestClose={handleClose}>
      {/* Backdrop */}
      <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </View>

      <View style={styles.container} pointerEvents="box-none">
        <View style={[styles.listItem, isHeroType && styles.heroListItem]}>
          <Animated.View style={[styles.panel, isHeroType && styles.heroPanel, { transform: [{ translateY }] }]}>
            {isHeroType ? (
              <>
                <ScrollView 
                  style={styles.heroScroll} 
                  contentContainerStyle={styles.heroScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {internalCard && <CardRenderer card={internalCard} playerSize="large" />}
                  
                  <View style={styles.infoContent}>
                    {isPlayer && (
                      <>
                        <PlayerConnectionStats card={internalCard} />
                        <PlayerBiographyBoxes card={internalCard} />
                        <PlayerHighlightMoments />
                        <PlayerCardInfoAccordion card={internalCard} />
                      </>
                    )}
                    {isStadium && (
                      <>
                        <StadiumBiographyBoxes card={internalCard} />
                      </>
                    )}
                    {isMatch && (
                      <>
                        <MatchBiographyBoxes card={internalCard} />
                      </>
                    )}
                  </View>
                  
                  <View style={{ height: 100 }} />
                </ScrollView>
                <View style={[styles.dragHandleArea, { top: Math.max(-15, insets.top-15) }]} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>
              </>
            ) : (
              internalCard && <CardRenderer card={internalCard} playerSize="large" />
            )}
          </Animated.View>
        </View>
      </View>

      {onClose && !isHeroType && (
        <View style={styles.closeButtonContainer} pointerEvents="box-none">
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close-circle" size={48} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: curvao.spacing.lg,
    width: '100%',
  },
  heroListItem: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 0,
  },
  panel: {
    width: 340,
    maxWidth: '95%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPanel: {
    alignItems: 'stretch',
    backgroundColor: '#080A09', // Dark background for full bleed
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: '100%',
    height: '100%',
  },
  heroScroll: {
    flex: 1,
  },
  heroScrollContent: {
    alignItems: 'stretch',
  },
  infoContent: {
    gap: 20,
  },
  dragHandleArea: {
    alignItems: 'center',
    elevation: 20,
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
