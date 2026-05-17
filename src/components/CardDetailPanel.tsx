import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { CardRenderer } from '@/src/components/cards/CardRenderer';
import { curvao } from '@/src/theme/curvaoTheme';
import type { UserCard } from '@/src/types/models';

export function CardDetailPanel({ card, onClose }: { card?: UserCard; cards?: UserCard[]; onClose?: () => void }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [internalCard, setInternalCard] = useState<UserCard | undefined>(undefined);

  useEffect(() => {
    if (card && !isModalVisible) {
      setInternalCard(card);
      setIsModalVisible(true);
    } else if (!card && isModalVisible) {
      handleClose();
    }
  }, [card]);

  const handleClose = () => {
    setIsModalVisible(false);
    setInternalCard(undefined);
    if (onClose) {
      onClose();
    }
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
        <View style={styles.listItem}>
          <View style={styles.panel}>
            {internalCard && <CardRenderer card={internalCard} playerSize="large" />}
          </View>
        </View>
      </View>

      {/* Close Button */}
      {onClose && (
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
  panel: {
    width: 340,
    maxWidth: '95%',
    alignItems: 'center',
    justifyContent: 'center',
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
