import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../../screens/profile/EditProfileScreen';
import { AddExperienceScreen } from '../../screens/profile/AddExperienceScreen';
import { AddLicenseScreen } from '../../screens/profile/AddLicenseScreen';
import { LicenseStatusScreen } from '../../screens/profile/LicenseStatusScreen';
import { AddCertificationScreen } from '../../screens/profile/AddCertificationScreen';
import { EndorsersScreen } from '../../screens/profile/EndorsersScreen';
import { RecommendationsScreen } from '../../screens/profile/RecommendationsScreen';

const Stack = createNativeStackNavigator();

export function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AddExperience" component={AddExperienceScreen} />
      <Stack.Screen name="AddLicense" component={AddLicenseScreen} />
      <Stack.Screen name="LicenseStatus" component={LicenseStatusScreen} />
      <Stack.Screen name="AddCertification" component={AddCertificationScreen} />
      <Stack.Screen name="Endorsers" component={EndorsersScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
    </Stack.Navigator>
  );
}
