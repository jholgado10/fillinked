import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function IdVerificationScreen({ navigation, route }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>
        Upload a government-issued ID to get your ID Verified badge. Optional — you can do this later.
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Upload ID</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skip}
        onPress={() => navigation.navigate('OnboardingConnections', route.params)}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  button: { backgroundColor: '#1B4FD8', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  skip: { alignItems: 'center' },
  skipText: { color: '#6B7280', fontSize: 14 },
});
