import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PrepareScreen from '../screens/Interview/PrepareScreen';
import InterviewScreen from '../screens/Interview/InterviewScreen';
import ResultScreen from '../screens/Interview/ResultScreen';
import CongratsScreen from '../screens/Congrats/CongratsScreen';

const Stack = createNativeStackNavigator();

export default function InterviewNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PrepareScreen" component={PrepareScreen} />
      <Stack.Screen name="InterviewScreen" component={InterviewScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
      <Stack.Screen name="CongratsScreen" component={CongratsScreen} />
    </Stack.Navigator>
  );
}
