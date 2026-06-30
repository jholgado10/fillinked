import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FeedStack } from './stacks/FeedStack';
import { NetworkStack } from './stacks/NetworkStack';
import { JobsStack } from './stacks/JobsStack';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileStack } from './stacks/ProfileStack';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="FeedTab" component={FeedStack} options={{ title: 'Home' }} />
      <Tab.Screen name="NetworkTab" component={NetworkStack} options={{ title: 'Network' }} />
      <Tab.Screen name="JobsTab" component={JobsStack} options={{ title: 'Jobs' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
