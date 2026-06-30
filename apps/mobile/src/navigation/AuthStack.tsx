import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { EmailEntryScreen } from '../screens/auth/EmailEntryScreen';
import { MagicLinkSentScreen } from '../screens/auth/MagicLinkSentScreen';
import { PhoneOtpScreen } from '../screens/auth/PhoneOtpScreen';
import { MemberTypeScreen } from '../screens/auth/onboarding/MemberTypeScreen';
import { BasicInfoScreen } from '../screens/auth/onboarding/BasicInfoScreen';
import { RoleHeadlineScreen } from '../screens/auth/onboarding/RoleHeadlineScreen';
import { FirstCredentialsScreen } from '../screens/auth/onboarding/FirstCredentialsScreen';
import { IdVerificationScreen } from '../screens/auth/onboarding/IdVerificationScreen';
import { ConnectionSuggestionsScreen } from '../screens/auth/onboarding/ConnectionSuggestionsScreen';

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="EmailEntry" component={EmailEntryScreen} />
      <Stack.Screen name="MagicLinkSent" component={MagicLinkSentScreen} />
      <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
      <Stack.Screen name="OnboardingMemberType" component={MemberTypeScreen} />
      <Stack.Screen name="OnboardingBasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="OnboardingRole" component={RoleHeadlineScreen} />
      <Stack.Screen name="OnboardingCredentials" component={FirstCredentialsScreen} />
      <Stack.Screen name="OnboardingIdVerify" component={IdVerificationScreen} />
      <Stack.Screen name="OnboardingConnections" component={ConnectionSuggestionsScreen} />
    </Stack.Navigator>
  );
}
