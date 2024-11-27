import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';


import Wellcome from './src/screens/Auth/Wellcome';
import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';
import Verify from './src/screens/Auth/Verify';
import Profile from './src/screens/Profile/Profile';
import ForgotPasswork from './src/screens/Auth/ForgotPassword';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  </NavigationContainer>
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