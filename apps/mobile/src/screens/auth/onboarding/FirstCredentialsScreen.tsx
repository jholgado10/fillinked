import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function FirstCredentialsScreen({ navigation, route }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add your first credential</Text>
      <Text style={styles.subtitle}>
        Verified credentials make your profile stand out to employers and peers.
      </Text>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>RN / LVN License</Text>
        <Text style={styles.cardSub}>CA Board of Registered Nursing</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>CNA Certification</Text>
        <Text style={styles.cardSub}>CA Dept. of Public Health</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>BLS / CPR Card</Text>
        <Text style={styles.cardSub}>Upload your certificate</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skip}
        onPress={() => navigation.navigate('OnboardingIdVerify', route.params)}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  card: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#6B7280' },
  skip: { marginTop: 16, alignItems: 'center' },
  skipText: { color: '#6B7280', fontSize: 14 },
});
