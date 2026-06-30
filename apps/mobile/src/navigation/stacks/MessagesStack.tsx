import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThreadListScreen } from '../../screens/messages/ThreadListScreen';
import { ThreadDetailScreen } from '../../screens/messages/ThreadDetailScreen';
import { MessageRequestsScreen } from '../../screens/messages/MessageRequestsScreen';

const Stack = createNativeStackNavigator();

export function MessagesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ThreadList" component={ThreadListScreen} />
      <Stack.Screen name="ThreadDetail" component={ThreadDetailScreen} />
      <Stack.Screen name="MessageRequests" component={MessageRequestsScreen} />
    </Stack.Navigator>
  );
}
