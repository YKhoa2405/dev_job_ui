import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { orange } from './src/assets/themes/Color';
import Icon from 'react-native-vector-icons/Ionicons'
import { Provider, useDispatch } from 'react-redux'
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
// import {
//   getMessaging,
//   onMessage,
//   onNotificationOpenedApp,
//   getInitialNotification,
//   onTokenRefresh,
//   getToken
// } from '@react-native-firebase/messaging';
import messaging from '@react-native-firebase/messaging';
import { setFcmToken } from './src/redux/slice/userSlice';
import { createRef } from 'react';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createRef();


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  const messaging = messaging.getMessaging();
  try {
    const authStatus = await messaging.requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    if (!enabled) {
      return null;
    }

    const fcmToken = await messaging.getToken(messaging);
    console.log('FCM Token:', fcmToken);
    if (fcmToken) {
      store.dispatch(setFcmToken(fcmToken));
      // await sendFcmTokenToServer(fcmToken, userId);
    }
    return fcmToken;
  } catch (error) {
    console.log('Error getting FCM Token:', error);
    return null;
  }
}

const handleNotificationNavigation = (remoteMessage, navigationRef) => {
  if (!navigationRef.current) {
    console.warn('Navigation reference not available');
    return;
  }

  if (!remoteMessage?.data) {
    console.warn('No data in remote message, navigating to Notification screen');
    navigationRef.current.navigate('Notification');
    return;
  }

  const { action, chatId, jobId } = remoteMessage.data;

  switch (action) {
    case 'open_chat':
      if (chatId) {
        navigationRef.current.navigate('ChatSocket', { chatId });
      } else {
        console.warn('Missing chatId for open_chat action');
        navigationRef.current.navigate('ChatHome');
      }
      break;
    case 'open_job':
      if (jobId) {
        navigationRef.current.navigate('JobDetail', { jobId });
        console.log('Navigating to JobDetail screen with jobId:', jobId);
      } else {
        console.warn('Missing jobId for open_job action');
        navigationRef.current.navigate('Notification');
      }
      break;
    default:
      console.log('Unknown or no action specified, navigating to Notification screen');
      navigationRef.current.navigate('Notification');
      break;
  }
};

export default function App() {

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();

    // Khi app được mở từ trạng thái quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          handleNotificationNavigation(remoteMessage, navigationRef);
        }
      });

    // Khi app ở background và user nhấn vào thông báo
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      handleNotificationNavigation(remoteMessage, navigationRef);
    });

    // Khi app đang foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Notification in foreground:', remoteMessage);
      // Hiển thị alert/toast nếu muốn
    });

    // Khi token được làm mới
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      store.dispatch(setFcmToken(token));
    });

    return () => {
      unsubscribeBackground();
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }, []);



  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
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