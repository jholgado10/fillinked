import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export function BasicInfoScreen({ navigation, route }: any) {
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Maria Santos" />
      <Text style={styles.label}>City</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Burbank, CA" />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OnboardingRole', { ...route.params, fullName, city })}
        disabled={!fullName || !city}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14, marginBottom: 16 },
  button: { backgroundColor: '#1B4FD8', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
