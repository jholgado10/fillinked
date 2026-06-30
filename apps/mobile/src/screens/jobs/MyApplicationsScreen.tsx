import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function MyApplicationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>My Applications — TODO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { color: '#9CA3AF' },
});
