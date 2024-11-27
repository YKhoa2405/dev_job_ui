import { StyleSheet } from "react-native";
import { mainColor, bgButton2, bgImage, grey, orange, white } from "./Color";

const StyleShare = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:grey
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
    },
    titleText30: {
        fontSize: 30,
        fontWeight: 'bold',
        color: mainColor
    },
    titleText16: {
        fontSize: 16,
        fontWeight: 'bold',
        color: mainColor
    },
    textText20: {
        fontSize: 20,
        fontWeight: 'bold',
        color: mainColor
    },
    flexCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    flexBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        height: 1,
        flex: 1,
        backgroundColor: bgButton2
    },
    lineText: {
        marginHorizontal: 5,
        fontWeight: '500',
        opacity: 0.6,
    },
    imageLogin: {
        width: 300,
        height: 300,

        resizeMode: 'center'
    },
    containerAvatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: bgButton2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -45
    },
    avatarJob: {
        width: 54,
        height: 54,
        resizeMode: 'cover'
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
        backgroundColor: white,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    buttonSave: {
        borderWidth: 1,
        borderColor: orange,
        borderRadius: 10,
        padding: 10,
        marginRight: 10
    },
    chip: {
        alignSelf: 'flex-start',
        backgroundColor: grey,
        marginRight: 10,
        marginTop: 10
    },
    searchHome: {
        flexDirection: 'row',
        backgroundColor: white,
        width: '85%',
        marginRight: 10,
        borderRadius: 10, padding: 10,
        alignItems: 'center',
        elevation: 2
    },
    imageNullData: {
        width: 200,
        height: 200,
        resizeMode: 'cover',
        marginVertical: 40
    },

    technologyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },
    buttonDetailApply: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: grey,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10
    }
})

export default StyleShare