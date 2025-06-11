import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { mainColor, white } from '../../assets/themes/Color';
import StyleShare from '../../assets/themes/StyleShare';

const CongratsScreen = ({ navigation, route }) => {
  const { jobTitle, companyName } = route.params;

  return (
    <View style={styles.container}>
      {/* Add Image Component */}
      <Image
        source={require('../../assets/images/successfully.png')} // Replace with your local image path
        // Alternatively, use a remote URL: source={{ uri: 'https://example.com/congrats.png' }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={StyleShare.titleText30}>Chúc mừng bạn!</Text>
      <Text style={styles.message}>
        Bạn đã ứng tuyển thành công cho vị trí{' '}
        <Text style={styles.highlight}>{jobTitle}</Text> tại{' '}
        <Text style={styles.highlight}>{companyName}</Text>.
      </Text>
      <TouchableOpacity
        style={[StyleShare.buttonDetailApply, { backgroundColor: mainColor }]}
        onPress={() => navigation.navigate('MainTab', { screen: 'HomeClient' })}
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
    backgroundColor:'white'
  },
  image: {
    width: 500, // Adjust width as needed
    height: 500, // Adjust height as needed
    marginBottom:40
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
    color: white,
    fontSize: 16,
  },
});

export default CongratsScreen;