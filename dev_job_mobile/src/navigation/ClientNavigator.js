import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobDetail from '../screens/Job/JobDetail';
import JobSearch from '../screens/Job/JobSearch';
import JobSearchResult from '../screens/Job/JobSearchResult';
import JobNearBy from '../screens/Job/JobNearBy';
import JobSaved from '../screens/Job/JobSaved';
import JobApplied from '../screens/Job/JobApplied';
import JobSuggestions from '../screens/Job/JobSuggestions';
import CompaniesFollow from '../screens/Company/CompaniesFollow';

const Stack = createNativeStackNavigator();

export default function ClientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobDetail" component={JobDetail} />
      <Stack.Screen name="JobSearch" component={JobSearch} />
      <Stack.Screen name="JobSearchResult" component={JobSearchResult} />
      <Stack.Screen name="JobNearBy" component={JobNearBy} />
      <Stack.Screen name="JobSaved" component={JobSaved} />
      <Stack.Screen name="JobApplied" component={JobApplied} />
      <Stack.Screen name="JobSuggestions" component={JobSuggestions} />
      <Stack.Screen name="CompaniesFollow" component={CompaniesFollow} />
    </Stack.Navigator>
  );
}
