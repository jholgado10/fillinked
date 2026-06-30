import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const ROLE_TYPES = ['caregiver', 'cna', 'lvn', 'rn', 'bsn', 'med_tech', 'other'];

export function RoleHeadlineScreen({ navigation, route }: any) {
  const [roleType, setRoleType] = useState('');
  const [headline, setHeadline] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your role</Text>
      <View style={styles.chips}>
        {ROLE_TYPES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, roleType === r && styles.chipActive]}
            onPress={() => setRoleType(r)}
          >
            <Text style={[styles.chipText, roleType === r && styles.chipTextActive]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Headline</Text>
      <TextInput
        style={styles.input}
        value={headline}
        onChangeText={setHeadline}
        placeholder="RN | Cedars-Sinai | ICU | Open to travel"
        maxLength={220}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OnboardingCredentials', { ...route.params, roleType, headline })}
        disabled={!roleType}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: '#1B4FD8', borderColor: '#1B4FD8' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14, marginBottom: 16 },
  button: { backgroundColor: '#1B4FD8', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
