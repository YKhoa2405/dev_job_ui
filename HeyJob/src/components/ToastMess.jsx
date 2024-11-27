import Toast from "react-native-toast-message";

export const ToastMess = ({ type, text1 }) => {
    Toast.show({
        type: type,
        text1: text1,
        visibilityTime: 3000,
        autoHide: true,
    });
}