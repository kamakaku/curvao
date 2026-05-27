import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CURVAO_DESIGN = {
  bg: '#080A09',
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  goldSoft: '#F0C96B',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.24)',
};

type MenuAction = {
  label: string;
  subLabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
};

type CardMoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  actions: MenuAction[][]; // Nested array for groups with dividers
};

export function CardMoreMenu({ visible, onClose, actions }: CardMoreMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {actions.map((group, groupIndex) => (
                <View key={`group-${groupIndex}`}>
                  {group.map((action, actionIndex) => (
                    <Pressable
                      key={`action-${groupIndex}-${actionIndex}`}
                      onPress={() => {
                        action.onPress();
                        onClose();
                      }}
                      disabled={action.disabled}
                      style={({ pressed }) => [
                        styles.actionRow,
                        pressed && styles.pressed,
                        action.disabled && styles.disabled
                      ]}
                    >
                      <View style={styles.actionIcon}>
                        <Ionicons 
                          name={action.icon} 
                          size={20} 
                          color={action.danger ? '#b8574d' : action.active ? CURVAO_DESIGN.gold : CURVAO_DESIGN.text} 
                        />
                      </View>
                      <View style={styles.actionText}>
                        <Text style={[
                          styles.actionLabel, 
                          action.danger && { color: '#b8574d' },
                          action.active && { color: CURVAO_DESIGN.gold }
                        ]}>
                          {action.label.toUpperCase()}
                        </Text>
                        {action.subLabel && (
                          <Text style={styles.actionSubLabel}>{action.subLabel.toUpperCase()}</Text>
                        )}
                      </View>
                      {action.active && (
                        <Ionicons name="checkmark" size={16} color={CURVAO_DESIGN.gold} />
                      )}
                    </Pressable>
                  ))}
                  {groupIndex < actions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    width: 260,
    boxShadow: '0px 10px 20px rgba(0,0,0,0.5)',
    elevation: 10,
  },
  menuContent: {
    backgroundColor: CURVAO_DESIGN.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CURVAO_DESIGN.borderGold,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 16,
  },
  actionIcon: {
    width: 24,
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    color: CURVAO_DESIGN.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  actionSubLabel: {
    color: CURVAO_DESIGN.muted,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216,170,77,0.1)',
    marginVertical: 4,
    marginHorizontal: 20,
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  disabled: {
    opacity: 0.3,
  },
});
