import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Import các navigator nhỏ
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import ClientNavigator from './ClientNavigator';
import CompanyNavigator from './CompanyNavigator';
import ResumeNavigator from './ResumeNavigator';
import ChatNavigator from './ChatNavigator';
import InterviewNavigator from './InterviewNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
        <Stack.Screen name="Client" component={ClientNavigator} />
        <Stack.Screen name="Company" component={CompanyNavigator} />
        <Stack.Screen name="Resume" component={ResumeNavigator} />
        <Stack.Screen name="Chat" component={ChatNavigator} />
        <Stack.Screen name="Interview" component={InterviewNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
