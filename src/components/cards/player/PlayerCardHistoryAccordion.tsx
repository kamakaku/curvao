import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCardEvents } from '@/src/services/cardService';
import type { CardEvent } from '@/src/types/models';

const COLORS = {
  surface: '#121614',
  surfaceSoft: '#191E1B',
  gold: '#D8AA4D',
  text: '#F4F1E8',
  muted: '#A7A39A',
  borderGold: 'rgba(216,170,77,0.18)',
  timelineLine: 'rgba(255,255,255,0.1)',
};

export function PlayerCardHistoryAccordion({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<CardEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (open && !hasFetched && !loading) {
      setLoading(true);
      getCardEvents(cardId)
        .then((fetchedEvents) => {
          setEvents(fetchedEvents);
          setLoading(false);
          setHasFetched(true);
        })
        .catch(() => {
          setLoading(false);
          setHasFetched(true);
        });
    }
  }, [open, cardId, hasFetched, loading]);

  const getEventIcon = (eventType: string): keyof typeof Ionicons.glyphMap => {
    switch (eventType) {
      case 'earned':
        return 'star';
      case 'traded_in':
      case 'traded_out':
        return 'swap-horizontal';
      case 'bound':
        return 'link';
      case 'upgraded':
        return 'arrow-up';
      case 'favorited':
        return 'heart';
      case 'main_selected':
        return 'bookmark';
      case 'achievement_unlocked':
        return 'trophy';
      default:
        return 'time';
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setOpen((value) => !value)} style={[styles.header, open && styles.headerOpen]}>
        <View style={styles.headerLeft}>
          <Ionicons color={COLORS.gold} name="time-outline" size={18} />
          <Text style={styles.title}>HISTORY</Text>
        </View>
        <Ionicons color={COLORS.muted} name={open ? 'chevron-up' : 'chevron-down'} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.gold} size="small" />
            </View>
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>Keine Einträge vorhanden.</Text>
          ) : (
            <View style={styles.timeline}>
              {events.map((event, index) => {
                const isLast = index === events.length - 1;
                return (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={styles.timelineTrack}>
                      <View style={styles.timelineDot}>
                        <Ionicons name={getEventIcon(event.eventType)} size={10} color={COLORS.surfaceSoft} />
                      </View>
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>
                    <View style={[styles.eventContent, isLast && styles.lastEventContent]}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>
                        {new Date(event.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {event.description ? <Text style={styles.eventDesc}>{event.description}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    marginTop: -22, // Pull up closer to the details accordion
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderGold,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingHorizontal: 16,
  },
  headerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  content: {
    backgroundColor: COLORS.surfaceSoft,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderColor: COLORS.borderGold,
    borderTopWidth: 0,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  timeline: {
    paddingTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
  },
  timelineTrack: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.timelineLine,
    marginTop: -2,
    marginBottom: -4, // Ensure lines connect
  },
  eventContent: {
    flex: 1,
    paddingBottom: 20,
  },
  lastEventContent: {
    paddingBottom: 4,
  },
  eventTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  eventDate: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  eventDesc: {
    color: 'rgba(244,241,232,0.8)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
