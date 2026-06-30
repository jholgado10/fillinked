import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function FeedScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => api.get('/feed').then((r) => r.data),
  });

  if (isLoading) return <ActivityIndicator style={styles.center} />;

  return (
    <FlatList
      data={data?.events ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.eventType}>{item.event_type}</Text>
          <Text style={styles.meta}>{item.created_at}</Text>
        </View>
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  list: { padding: 16 },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12 },
  eventType: { fontSize: 14, fontWeight: '600', color: '#1B4FD8' },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
});
