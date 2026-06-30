import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export function SplashScreen({ navigation }: any) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize().then((hasSession) => {
      navigation.replace(hasSession ? 'Main' : 'EmailEntry');
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1B4FD8" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B4FD8' },
});
