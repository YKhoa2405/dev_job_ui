import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ResumeApply from '../screens/Resume/ResumeApply';
import ResumeByJob from '../screens/Resume/ResumeByJob';
import ResumeView from '../screens/Resume/ResumeView';
import ResumeClientView from '../screens/Resume/ResumeClientView';
import ResumeInput from '../screens/Resume/ResumeInput';
import ResumeExperience from '../screens/Resume/ResumeExperience';
import ResumeProject from '../screens/Resume/ResumeProject';
import ResumeTemplates from '../screens/Resume/ResumeTemplates';

const Stack = createNativeStackNavigator();

export default function ResumeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResumeApply" component={ResumeApply} />
      <Stack.Screen name="ResumeByJob" component={ResumeByJob} />
      <Stack.Screen name="ResumeView" component={ResumeView} />
      <Stack.Screen name="ResumeClientView" component={ResumeClientView} />
      <Stack.Screen name="ResumeInput" component={ResumeInput} />
      <Stack.Screen name="ResumeExperience" component={ResumeExperience} />
      <Stack.Screen name="ResumeProject" component={ResumeProject} />
      <Stack.Screen name="ResumeTemplates" component={ResumeTemplates} />
    </Stack.Navigator>
  );
}
