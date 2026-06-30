import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function CommentsScreen({ route }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Comments — TODO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { color: '#9CA3AF' },
});
