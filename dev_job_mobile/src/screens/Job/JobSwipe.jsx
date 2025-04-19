import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import { useSelector } from 'react-redux';


export default function JobSwipe() {
  const pushToken = useSelector((state) => state.user.pushToken);
  console.log(pushToken)

  async function sendPushNotification() {


    try {
      const response = await axios.post('http://192.168.1.120:8000/notifications/send', {
        token: 'fQqAC5w2R9u6gffg1NIkWp:APA91bFcNIFTnSn2ATsdmnlRIVy-WmhMG37Uzsj3ihDIMJUxjISwxmeVgPD6vJmMdK50zcA5_2P4SEycJVKAa9KCx4NrsKqgrSXL3_IwW-feO5HGtjmZhIc',
        title: 'Test Notification',
        message: 'Đây là thông báo thử nghiệm từ client!',
      });

      console.log('Push API result:', response.data.data);

    } catch (error) {
      console.error('Error sending push:', error);
      Toast.show({ type: 'error', text1: 'Lỗi khi gửi thông báo đến server' });
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {pushToken}</Text>

      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification();
        }}
      />
    </View>
  );
}
