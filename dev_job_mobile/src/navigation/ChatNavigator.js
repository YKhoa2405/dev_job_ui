import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Chat from '../screens/Chat/Chat';
import ChatDetail from '../screens/Chat/ChatDetail';
import ChatBot from '../screens/Chat/ChatBot';

const Stack = createNativeStackNavigator();

export default function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="ChatDetail" component={ChatDetail} />
      <Stack.Screen name="ChatBot" component={ChatBot} />
    </Stack.Navigator>
  );
}
