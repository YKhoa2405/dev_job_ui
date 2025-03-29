import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Wellcome from '../screens/Auth/Wellcome';
import Login from '../screens/Auth/Login';
import RegisterClient from '../screens/Auth/RegisterClient';
import RegisterCompany from '../screens/Auth/RegisterCompany';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import SendCode from '../screens/Auth/SendCode';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Wellcome" component={Wellcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="RegisterClient" component={RegisterClient} />
      <Stack.Screen name="RegisterCompany" component={RegisterCompany} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="SendCode" component={SendCode} />
    </Stack.Navigator>
  );
}
