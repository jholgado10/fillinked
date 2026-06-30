import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function MemberTypeScreen({ navigation }: any) {
  function select(type: 'worker' | 'employer') {
    navigation.navigate('OnboardingBasicInfo', { memberType: type });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FilLinked</Text>
      <Text style={styles.subtitle}>I am…</Text>
      <TouchableOpacity style={styles.card} onPress={() => select('worker')}>
        <Text style={styles.cardTitle}>A Filipino Healthcare Worker</Text>
        <Text style={styles.cardSub}>Caregiver, CNA, LVN, RN, Med Tech</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, styles.cardAlt]} onPress={() => select('employer')}>
        <Text style={styles.cardTitle}>Hiring / Looking for Care</Text>
        <Text style={styles.cardSub}>Agency, hospital, or Filipino family</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#6B7280', marginBottom: 32 },
  card: { backgroundColor: '#1B4FD8', borderRadius: 12, padding: 20, marginBottom: 16 },
  cardAlt: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#1B4FD8' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#BFDBFE' },
});
