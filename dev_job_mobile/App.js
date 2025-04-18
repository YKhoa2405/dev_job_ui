import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { orange } from './src/assets/themes/Color';
import Icon from 'react-native-vector-icons/Ionicons'
import { Provider } from 'react-redux'
import { store } from './src/redux/store';

import Wellcome from './src/screens/Auth/Wellcome';
import Login from './src/screens/Auth/Login';
import Verify from './src/screens/Auth/SendCode';
import Profile from './src/screens/Profile/ProfileClient';
import ForgotPasswork from './src/screens/Auth/ForgotPassword';
import HomeClient from './src/screens/Home/HomeClient';
import Companies from './src/screens/Company/Companies';
import JobDetail from './src/screens/Job/JobDetail';
import CompanyDetail from './src/screens/Company/CompanyDetail';
import JobNearBy from './src/screens/Job/JobNearBy';
import JobSearch from './src/screens/Job/JobSearch';
import JobSearchResult from './src/screens/Job/JobSearchResult';
import CompaniesFollow from './src/screens/Company/CompaniesFollow';
import JobSaved from './src/screens/Job/JobSaved';
import JobApplied from './src/screens/Job/JobApplied';
import JobSuggestions from './src/screens/Job/JobSuggestions';
import Toast from 'react-native-toast-message';
import SendCode from './src/screens/Auth/SendCode';
import JobCreate from './src/screens/Company/JobCreate';
import HomeCompany from './src/screens/Home/HomeCompany';
import JobByCompany from './src/screens/Company/JobByCompany';
import Services from './src/screens/Service/Services';
import ServicesByCompany from './src/screens/Service/ServicesByCompany';
import ProfileCompany from './src/screens/Profile/ProfileCompany';
import CompanyStatistical from './src/screens/Company/CompanyStatistical';
import PaymentScreen from './src/screens/Service/PaymentScreen';
import RegisterClient from './src/screens/Auth/RegisterClient';
import RegisterCompany from './src/screens/Auth/RegisterCompany';

import ChooseRole from './src/screens/Auth/ChooseRole';
import RegisterSendOtp from './src/screens/Auth/RegisterSendOtp';
import CompanyCreate from './src/screens/Company/CompanyCreate';
import Subscribers from './src/screens/Profile/Subscribers';

import ResumeApply from './src/screens/Resume/ResumeApply';
import ResumeTools from './src/screens/Resume/ResumeTools';
import ResumeView from './src/screens/Resume/ResumeView';
import ResumeByJob from './src/screens/Resume/ResumeByJob';
import ResumeInput from './src/screens/Resume/ResumeInput';
import ResumeExperience from './src/screens/Resume/ResumeExperience';
import ResumeProject from './src/screens/Resume/ResumeProject';
import ResumeTemplates from './src/screens/Resume/ResumeTemplates';
import ResumeClientView from './src/screens/Resume/ResumeClientView';
import ChatBot from './src/screens/Chat/ChatBot';
import CandidatesCreate from './src/screens/Profile/CandidatesCreate';
import CandidateSearch from './src/screens/Company/CandidateSearch';
import CandidatesProfile from './src/screens/Profile/CandidatesProfile';
import PrepareScreen from './src/screens/Interview/PrepareScreen';
import InterviewScreen from './src/screens/Interview/InterviewScreen';
import ResultScreen from './src/screens/Interview/ResultScreen';
import CongratsScreen from './src/screens/Congrats/CongratsScreen';
import JobSwipe from './src/screens/Job/JobSwipe';
import { useEffect, useRef, useState } from 'react';
import Notification from './src/screens/Notifications/Notification';
import ReportJob from './src/screens/Job/ReportJob';
import EditCompany from './src/screens/Company/EditCompany';
import EditJob from './src/screens/Job/EditJob';
import ChatSocket from './src/screens/Chat/ChatSocket';
import ChatHome from './src/screens/Chat/ChatHome';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification, onTokenRefresh } from '@react-native-firebase/messaging';
import { setFcmToken } from './src/redux/slice/userSlice';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const notificationListener = useRef();
  const responseListener = useRef();
  const messaging = getMessaging(); // Sử dụng API modular

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      Alert.alert('Lỗi', 'Push notifications chỉ hoạt động trên thiết bị thật');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Lỗi', 'Bạn cần cấp quyền để nhận thông báo!');
        return null;
      }

      const token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('FCM Token:', token); // In token để kiểm tra
      store.dispatch(setFcmToken(token)); // Lưu token vào Redux
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      Alert.alert('Lỗi', 'Không thể lấy FCM token');
      return null;
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Xử lý thông báo khi ứng dụng ở foreground
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      console.log('Notification received in foreground:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || 'Thông báo',
        remoteMessage.notification?.body || 'Bạn có thông báo mới'
      );
    });

    // Xử lý khi nhấn thông báo khi ứng dụng ở background
    const unsubscribeOnNotificationOpened = onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log('Notification opened:', remoteMessage);
    });

    // Xử lý thông báo khi ứng dụng được mở từ trạng thái quit
    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification caused app to open:', remoteMessage);
      }
    });

    // Xử lý thông báo từ expo-notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Expo Notification:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Response:', response);
    });

    // Lắng nghe thay đổi token
    const unsubscribeOnTokenRefresh = onTokenRefresh(messaging, (newToken) => {
      console.log('New FCM Token:', newToken);
      store.dispatch(setFcmToken(newToken)); // Cập nhật token mới
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
      unsubscribeOnTokenRefresh();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthStack" component={AuthStack} />
          <Stack.Screen name="MainTab" component={MainTab} />
          <Stack.Screen name="HomeCompany" component={HomeCompany} />
          <Stack.Screen name="Login" component={Login} />

          <Stack.Screen name="JobCreate" component={JobCreate} />
          <Stack.Screen name="JobByCompany" component={JobByCompany} />
          <Stack.Screen name="JobDetail" component={JobDetail} />
          <Stack.Screen name="JobNearBy" component={JobNearBy} />
          <Stack.Screen name="JobSearch" component={JobSearch} />
          <Stack.Screen name="JobSearchResult" component={JobSearchResult} />
          <Stack.Screen name="JobSaved" component={JobSaved} />
          <Stack.Screen name="JobApplied" component={JobApplied} />
          <Stack.Screen name="JobSuggestions" component={JobSuggestions} />
          <Stack.Screen name="JobSwipe" component={JobSwipe} />
          <Stack.Screen name="ReportJob" component={ReportJob} />
          <Stack.Screen name="EditJob" component={EditJob} />



          <Stack.Screen name="CompanyDetail" component={CompanyDetail} />
          <Stack.Screen name="CompaniesFollow" component={CompaniesFollow} />
          <Stack.Screen name="CompanyStatistical" component={CompanyStatistical} />
          <Stack.Screen name="CompanyCreate" component={CompanyCreate} />
          <Stack.Screen name="EditCompany" component={EditCompany} />


          <Stack.Screen name="ProfileCompany" component={ProfileCompany} />
          <Stack.Screen name="Subscribers" component={Subscribers} />

          <Stack.Screen name="ResumeApply" component={ResumeApply} />
          <Stack.Screen name="ResumeByJob" component={ResumeByJob} />
          <Stack.Screen name="ResumeView" component={ResumeView} />
          <Stack.Screen name="ResumeClientView" component={ResumeClientView} />
          <Stack.Screen name="CongratsScreen" component={CongratsScreen} />


          <Stack.Screen name="ResumeInput" component={ResumeInput} />
          <Stack.Screen name="ResumeExperience" component={ResumeExperience} />
          <Stack.Screen name="ResumeProject" component={ResumeProject} />
          <Stack.Screen name="ResumeTemplates" component={ResumeTemplates} />

          <Stack.Screen name="CandidatesCreate" component={CandidatesCreate} />
          <Stack.Screen name="CandidateSearch" component={CandidateSearch} />
          <Stack.Screen name="CandidatesProfile" component={CandidatesProfile} />

          <Stack.Screen name="PrepareScreen" component={PrepareScreen} />
          <Stack.Screen name="InterviewScreen" component={InterviewScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />

          <Stack.Screen name="Notification" component={Notification} />







          <Stack.Screen name="ChatBot" component={ChatBot} />
          <Stack.Screen name="ChatSocket" component={ChatSocket} />
          <Stack.Screen name="ChatHome" component={ChatHome} />




          <Stack.Screen name="Services" component={Services} />
          <Stack.Screen name="ServicesByCompany" component={ServicesByCompany} />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
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
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            }
            else if (route.name === 'Companies') {
              iconName = focused ? 'business' : 'business-outline';
            }
            else if (route.name === 'ResumeTools') {
              iconName = focused ? 'document' : 'document-outline';
            }

            else if (route.name === 'Profile') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

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
        <Tab.Screen name="ResumeTools" component={ResumeTools} />
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
        name="RegisterClient"
        component={RegisterClient}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterCompany"
        component={RegisterCompany}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterSendOtp"
        component={RegisterSendOtp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChooseRole"
        component={ChooseRole}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPasswork"
        component={ForgotPasswork}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SendCode"
        component={SendCode}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}