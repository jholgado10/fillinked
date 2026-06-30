import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddLicenseScreen } from '../../screens/profile/AddLicenseScreen';
import { LicenseStatusScreen } from '../../screens/profile/LicenseStatusScreen';
import { AddCertificationScreen } from '../../screens/profile/AddCertificationScreen';

const Stack = createNativeStackNavigator();

export function CredentialsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AddLicense" component={AddLicenseScreen} />
      <Stack.Screen name="LicenseStatus" component={LicenseStatusScreen} />
      <Stack.Screen name="AddCertification" component={AddCertificationScreen} />
    </Stack.Navigator>
  );
}
