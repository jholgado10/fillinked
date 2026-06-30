import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function ConnectionSuggestionsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with peers</Text>
      <Text style={styles.subtitle}>
        Filipino healthcare workers in your area — connect to grow your network.
      </Text>
      {/* TODO: render connection suggestions from GET /connections/suggestions */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Main')}>
        <Text style={styles.buttonText}>Go to FilLinked</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  button: { backgroundColor: '#1B4FD8', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
