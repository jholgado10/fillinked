import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen } from '../../screens/feed/FeedScreen';
import { PostDetailScreen } from '../../screens/feed/PostDetailScreen';
import { CommentsScreen } from '../../screens/feed/CommentsScreen';

const Stack = createNativeStackNavigator();

export function FeedStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
  );
}
