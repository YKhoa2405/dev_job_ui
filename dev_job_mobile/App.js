import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { orange } from './src/assets/themes/Color';
import Icon from 'react-native-vector-icons/Ionicons'

import Wellcome from './src/screens/Auth/Wellcome';
import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';
import Verify from './src/screens/Auth/Verify';
import Profile from './src/screens/Profile/Profile';
import ForgotPasswork from './src/screens/Auth/ForgotPassword';
import HomeClient from './src/screens/Home/HomeClient';
import Companies from './src/screens/Company/Companies';
import JobDetail from './src/screens/Job/JobDetail';
import CompanyDetail from './src/screens/Company/CompanyDetail';
import JobNearBy from './src/screens/Job/JobNearBy';
import Chat from './src/screens/Chat/Chat';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="MainTab" component={MainTab} />
        <Stack.Screen name="JobDetail" component={JobDetail} />
        <Stack.Screen name="JobNearBy" component={JobNearBy} />
        <Stack.Screen name="CompanyDetail" component={CompanyDetail} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTab() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'HomeClient') {
              iconName = focused ? 'home' : 'home-outline';
            }
            else if (route.name === 'Companies') {
              iconName = focused ? 'business' : 'business-outline';
            }
            else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-outline';
            }
            else if (route.name === 'Profile') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            return <Icon name={iconName} size={28} color={color} />;
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
        <Tab.Screen name="Chat" component={Chat} />

        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </KeyboardAvoidingView>

  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Wellcome">
      <Stack.Screen
        name="Wellcome"
        component={Wellcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPass"
        component={ForgotPasswork}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SendOtp"
        component={Verify}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}