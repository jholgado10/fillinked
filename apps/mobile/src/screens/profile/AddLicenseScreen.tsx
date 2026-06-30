import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../../lib/api';

const LICENSE_TYPES = ['rn', 'lvn', 'cna'];

export function AddLicenseScreen({ navigation }: any) {
  const [licenseType, setLicenseType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await api.post('/licenses', { license_type: licenseType, license_number: licenseNumber, last_name: lastName, state: 'CA' });
      navigation.navigate('LicenseStatus');
    } catch {
      // TODO: show error
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add License</Text>
      <View style={styles.chips}>
        {LICENSE_TYPES.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, licenseType === t && styles.chipActive]} onPress={() => setLicenseType(t)}>
            <Text style={[styles.chipText, licenseType === t && styles.chipTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={styles.input} placeholder="License number" value={licenseNumber} onChangeText={setLicenseNumber} />
      <TextInput style={styles.input} placeholder="Last name (as on license)" value={lastName} onChangeText={setLastName} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || !licenseType || !licenseNumber || !lastName}>
        <Text style={styles.buttonText}>{loading ? 'Verifying…' : 'Verify License'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: '#1B4FD8', borderColor: '#1B4FD8' },
  chipText: { color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#1B4FD8', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
