import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeCompany from '../screens/Home/HomeCompany';
import JobByCompany from '../screens/Company/JobByCompany';
import JobCreate from '../screens/Company/JobCreate';
import CompanyDetail from '../screens/Company/CompanyDetail';
import CompanyStatistical from '../screens/Company/CompanyStatistical';
import CompanyCreate from '../screens/Company/CompanyCreate';
import ProfileCompany from '../screens/Profile/ProfileCompany';
import Subscribers from '../screens/Profile/Subscribers';

const Stack = createNativeStackNavigator();

export default function CompanyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeCompany" component={HomeCompany} />
      <Stack.Screen name="JobByCompany" component={JobByCompany} />
      <Stack.Screen name="JobCreate" component={JobCreate} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetail} />
      <Stack.Screen name="CompanyStatistical" component={CompanyStatistical} />
      <Stack.Screen name="CompanyCreate" component={CompanyCreate} />
      <Stack.Screen name="ProfileCompany" component={ProfileCompany} />
      <Stack.Screen name="Subscribers" component={Subscribers} />
    </Stack.Navigator>
  );
}
