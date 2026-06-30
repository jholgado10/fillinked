import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyNetworkScreen } from '../../screens/network/MyNetworkScreen';
import { SuggestionsScreen } from '../../screens/network/SuggestionsScreen';
import { SearchScreen } from '../../screens/network/SearchScreen';
import { MemberProfileScreen } from '../../screens/network/MemberProfileScreen';

const Stack = createNativeStackNavigator();

export function NetworkStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyNetwork" component={MyNetworkScreen} />
      <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
    </Stack.Navigator>
  );
}
