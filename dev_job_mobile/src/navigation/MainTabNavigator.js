import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { orange } from '../assets/themes/Color';

import HomeClient from '../screens/Home/HomeClient';
import Companies from '../screens/Company/Companies';
import ResumeNavigator from './ResumeNavigator';
import Profile from '../screens/Profile/ProfileClient';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'HomeClient') iconName = focused ? 'briefcase' : 'briefcase-outline';
            else if (route.name === 'Companies') iconName = focused ? 'business' : 'business-outline';
            else if (route.name === 'ResumeNavigator') iconName = focused ? 'document' : 'document-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';

            return <Icon name={iconName} size={26} color={color} />;
          },
          tabBarActiveTintColor: orange,
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,
          headerShown: false,
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen name="HomeClient" component={HomeClient} />
        <Tab.Screen name="Companies" component={Companies} />
        <Tab.Screen name="ResumeNavigator" component={ResumeNavigator} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </KeyboardAvoidingView>
  );
}
