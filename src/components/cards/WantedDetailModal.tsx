import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Dimensions, Animated, PanResponder } from 'react-native';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { curvao } from '@/src/theme/curvaoTheme';
import type { CardSearchResult, EarnPath } from '@/src/services/wantedCardService';
import type { UserCard } from '@/src/types/models';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const texture = require('../../../assets/textures/curvao_universal_texture_overlay_2048.png');

type WantedDetailModalProps = {
  result?: CardSearchResult;
  earnPaths: EarnPath[];
  visible: boolean;
  onClose: () => void;
  onToggleWanted: () => void;
  onOpenMatch?: () => void;
  onOpenSet?: () => void;
};

export function WantedDetailModal({ result, earnPaths, visible, onClose, onToggleWanted, onOpenMatch, onOpenSet }: WantedDetailModalProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 30,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || (gestureState.dy > 40 && gestureState.vy > 0.5)) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        }
      },
    })
  ).current;

  if (!result) return null;

  const mockCard: UserCard = {
    id: `mock-${result.id}`,
    type: (result.type === 'special' ? 'patch' : result.type) as UserCard['type'],
    title: result.title,
    subtitle: result.subtitle,
    rarity: result.target.rarityTarget ?? 'standard',
    player: result.target.playerId,
    match: result.target.matchId,
    stadium: result.target.stadiumId,
    user: 'mock',
    editionNumber: 1,
    editionSize: 1000,
    origin: 'self_earned',
    tradable: false,
    bound: false,
    isMainCard: false,
    bondXp: 0,
    bondLevel: 1,
    acquiredAt: new Date().toISOString(),
    archived: false,
    favorite: false,
    expand: {
      player: result.target.player ? { ...result.target.player, expand: { club: result.target.club } } : undefined,
      club: result.target.club,
      stadium: result.target.stadium ? { ...result.target.stadium, expand: { club: result.target.club } } : undefined,
      match: result.target.match ? { ...result.target.match, expand: { homeClub: result.target.club, awayClub: result.target.club } } : undefined,
    } as any,
  };

  const isPlayer = result.type === 'player';
  const isStadium = result.type === 'stadium';
  const isMatch = result.type === 'match';
  const isHeroType = isPlayer || isStadium || isMatch;

  return (
    <Modal animationType="none" onRequestClose={handleClose} transparent visible={visible}>
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

      <Animated.View 
        style={[
          styles.panel, 
          { 
            pointerEvents: 'box-none',
            transform: [{ translateY }] 
          }
        ]}
      >
        <Image source={texture} style={[styles.texture, { pointerEvents: 'none' }]} />
        
        {isHeroType ? (
          <>
            <View 
              {...panResponder.panHandlers}
              style={styles.dragHandleContainer}
            >
              <View style={styles.dragHandle} />
            </View>
            <CardRenderer 
              card={mockCard} 
              playerSize="large" 
              wantedState={{
                isOwned: result.owned,
                isWanted: result.wanted,
                onToggleWanted: onToggleWanted,
              }} 
              earnPaths={earnPaths}
            />
            {/* Contextual actions displayed at the very bottom, after the Hero Detail's own scroll content */}
            <View style={styles.floatingActions}>
               {onOpenSet ? (
                <Pressable onPress={onOpenSet} style={styles.actionButton}>
                  <Text style={styles.actionLabel}>Zum Set</Text>
                </Pressable>
              ) : null}
              {onOpenMatch ? (
                <Pressable onPress={onOpenMatch} style={styles.actionButton}>
                  <Text style={styles.actionLabel}>Zum Match</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <View {...panResponder.panHandlers} style={styles.topBar}>
              <View style={styles.topBarButton} />
              <Text style={styles.topBarTitle}>WANTED {result.type.toUpperCase()}</Text>
              <Pressable onPress={handleClose} style={styles.topBarButton}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>

            <ScrollView 
              style={styles.scroll} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.preview}>
                <View style={styles.cardWrapper}>
                  <CardRenderer card={mockCard} playerSize="large" />
                </View>
                <Text style={styles.status}>{result.owned ? 'BESITZT' : result.wanted ? 'GESUCHT' : 'NOCH NICHT VERDIENT'}</Text>
              </View>

              <View style={styles.infoContent}>
                <View style={styles.baseInfo}>
                  <Text style={styles.title}>{result.title}</Text>
                  <Text style={styles.subtitle}>{result.subtitle}</Text>
                </View>

                <View style={styles.actions}>
                  {onOpenSet ? (
                    <Pressable onPress={onOpenSet} style={styles.actionButton}>
                      <Text style={styles.actionLabel}>Zum Set</Text>
                    </Pressable>
                  ) : null}
                  {onOpenMatch ? (
                    <Pressable onPress={onOpenMatch} style={styles.actionButton}>
                      <Text style={styles.actionLabel}>Zum Match</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    // Transparent for backdrop
  },
  panel: {
    flex: 1,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 10,
    paddingBottom: 0,
    zIndex: 10,
  },
  topBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: '#F4F1E8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  dragHandleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50, // Approx for safe area
    alignItems: 'center',
    zIndex: 100,
    height: 60, // Large hit-box for fingers
    justifyContent: 'center',
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  },
  fullBleedScroll: {
    paddingTop: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  heroWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  preview: {
    alignItems: 'center',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    gap: curvao.spacing.sm,
    justifyContent: 'center',
    paddingVertical: curvao.spacing.lg,
    width: '90%',
    marginTop: 20,
  },
  cardWrapper: {
    width: 320,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 0.85 }],
  },
  infoContent: {
    width: '100%',
    gap: 24,
    marginTop: 20,
  },
  baseInfo: {
    paddingHorizontal: 20,
    gap: 4,
  },
  status: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.xl,
    fontWeight: '900',
  },
  subtitle: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.base,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    gap: curvao.spacing.sm,
  },
  sectionTitle: {
    color: curvao.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  earnPath: {
    alignItems: 'flex-start',
    backgroundColor: '#121614',
    borderColor: 'rgba(216,170,77,0.14)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: curvao.spacing.sm,
    padding: curvao.spacing.md,
  },
  disabledPath: {
    opacity: 0.62,
  },
  pathCopy: {
    flex: 1,
  },
  pathTitle: {
    color: curvao.colors.text,
    fontSize: curvao.typography.size.sm,
    fontWeight: '900',
  },
  pathSubtitle: {
    color: curvao.colors.muted,
    fontSize: curvao.typography.size.xs,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  disclaimer: {
    color: curvao.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: curvao.spacing.sm,
  },
  actionButton: {
    borderColor: 'rgba(216,170,77,0.26)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: curvao.spacing.lg,
    paddingVertical: curvao.spacing.sm,
  },
  actionLabel: {
    color: curvao.colors.gold,
    fontSize: curvao.typography.size.xs,
    fontWeight: '900',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 1000,
  },
});