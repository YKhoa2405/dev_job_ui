import { StyleSheet } from "react-native";
import { mainColor, bgButton2, bgImage, grey, orange, white, bgNotifi } from "./Color";

const StyleShare = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: grey
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
    titleText20: {
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
        backgroundColor: grey
    },
    lineText: {
        marginHorizontal: 5,
        fontWeight: '500',
        opacity: 0.6,
    },
    imageLogin: {
        width: 300,
        height: 400,

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
        backgroundColor: bgNotifi,
        marginRight: 5,
        marginTop: 10
    },
    // Search
    searchHome: {
        flexDirection: 'row',
        backgroundColor: white,
        width: '85%',
        marginRight: 10,
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        elevation: 2
    },

    searchDetail: {
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        elevation: 2,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1, // Để chiếm toàn bộ không gian còn lại
        fontSize: 16,
        color: '#333',
        padding: 0, // Loại bỏ padding mặc định của TextInput
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
        marginTop: 10,
        elevation: 2
    },
    // style item job
    jobItemContainer: {
        backgroundColor: white,
        borderRadius: 15, // Tăng bo góc cho mềm mại hơn
        padding: 15,
        marginTop: 20, // Tăng khoảng cách dọc giữa các item
        marginHorizontal: 15, // Giảm margin ngang để tận dụng không gian
        elevation: 4, // Tăng độ bóng cho Android để nổi bật hơn
        shadowColor: '#000', // Thêm bóng cho iOS
        shadowOffset: { width: 0, height: 2 }, // Điều chỉnh vị trí bóng
        shadowOpacity: 0.1, // Độ trong suốt của bóng
        shadowRadius: 6, // Độ lan của bóng
        borderWidth: 1, // Thêm viền nhẹ
        borderColor: '#f0f0f0', // Màu viền nhạt
    },

    // drop down
    dropdownButtonStyle: {
        width: 175,
        height: 35,
        backgroundColor: white,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontWeight: '500',
    },
    dropdownButtonArrowStyle: {
        fontSize: 20,
    },
    dropdownMenuStyle: {
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    modalContent: {
        backgroundColor: grey,
        padding: 20,
        borderTopLeftRadius: 10,   // Bo góc phía trên
        borderTopRightRadius: 10,  // Bo góc phía trên
        minHeight: '50%',          // Chiều cao modal (nửa màn hình)
    },
    modalStyle: {
        justifyContent: 'flex-end', // Hiển thị modal ở cuối màn hình
        margin: 0,                 // Xóa khoảng cách mặc định
    },

    manageJob: {
        backgroundColor: white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 15
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },

})

export default StyleShare