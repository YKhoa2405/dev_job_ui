import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { mainColor, white } from '../../assets/themes/Color';
import StyleShare from '../../assets/themes/StyleShare';

const CongratsScreen = ({ navigation,route }) => {
  const { jobTitle, companyName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={StyleShare.titleText30}>Chúc mừng bạn!</Text>
      <Text style={styles.message}>
        Bạn đã ứng tuyển thành công cho vị trí{' '}
        <Text style={styles.highlight}>{jobTitle}</Text> tại{' '}
        <Text style={styles.highlight}>{companyName}</Text>.
      </Text>
      <TouchableOpacity
        style={[StyleShare.buttonDetailApply,{backgroundColor:mainColor}]}
        onPress={() => navigation.navigate('MainTab')} 
      >
        <Text style={styles.buttonText}>Quay về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
  },
  highlight: {
    fontWeight: 'bold',
    color: mainColor,
  },

  buttonText: {
    color:white,
    fontSize: 16,
  },
});

export default CongratsScreen;