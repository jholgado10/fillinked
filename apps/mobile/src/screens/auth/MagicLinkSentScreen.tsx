import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function MagicLinkSentScreen({ route }: any) {
  const { email } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📬</Text>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.body}>
        We sent a magic link to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      <Text style={styles.hint}>Click the link in your email to sign in.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 8 },
  email: { fontWeight: '600', color: '#1B4FD8' },
  hint: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
