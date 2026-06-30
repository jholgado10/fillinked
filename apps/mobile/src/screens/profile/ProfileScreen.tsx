import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function ProfileScreen({ navigation }: any) {
  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get('/profiles/me').then((r) => r.data),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{profile?.full_name ?? '—'}</Text>
        <Text style={styles.headline}>{profile?.headline ?? ''}</Text>
        <Text style={styles.location}>{profile?.location_city}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editBtnText}>Edit profile</Text>
      </TouchableOpacity>
      {/* TODO: credentials, skills, experience, recommendations sections */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700' },
  headline: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 4 },
  location: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  editBtn: { borderWidth: 1, borderColor: '#1B4FD8', borderRadius: 8, padding: 10, alignItems: 'center' },
  editBtnText: { color: '#1B4FD8', fontWeight: '600' },
});
