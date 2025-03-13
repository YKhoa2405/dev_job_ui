import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const Button = ({ title, onPress, disable, backgroundColor, textColor, borderColor }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: backgroundColor, borderColor: borderColor }]}
      onPress={onPress}
      disabled={disable}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Button;
