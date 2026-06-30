import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function SearchScreen() {
  const [q, setQ] = useState('');

  const { data } = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get('/search', { params: { q } }).then((r) => r.data),
    enabled: q.length >= 2,
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search Filipino healthcare workers…"
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        data={data?.results ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.result}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.role}>{item.headline}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12 },
  result: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  name: { fontWeight: '600' },
  role: { color: '#6B7280', fontSize: 13 },
});
