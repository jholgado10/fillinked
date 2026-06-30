import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobFeedScreen } from '../../screens/jobs/JobFeedScreen';
import { JobDetailScreen } from '../../screens/jobs/JobDetailScreen';
import { ApplyScreen } from '../../screens/jobs/ApplyScreen';
import { MyApplicationsScreen } from '../../screens/jobs/MyApplicationsScreen';
import { PostJobScreen } from '../../screens/jobs/PostJobScreen';

const Stack = createNativeStackNavigator();

export function JobsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="JobFeed" component={JobFeedScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Apply" component={ApplyScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
    </Stack.Navigator>
  );
}
