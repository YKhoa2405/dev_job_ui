import { ActivityIndicator, View } from "react-native";
import StyleShare from "../assets/themes/StyleShare";

const Loading = () => {
    return (
        <View style={StyleShare.loadingContainer}>
            <ActivityIndicator size='large' color='orange' />
        </View>

    );
};

export default Loading;