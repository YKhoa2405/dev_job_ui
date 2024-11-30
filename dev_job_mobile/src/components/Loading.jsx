import { ActivityIndicator } from "react-native";

const Loading = () => {
    return (
        <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size='large' color='orange' />

    );
  };
  
  export default Loading;