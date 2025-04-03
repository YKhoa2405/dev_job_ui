import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Avatar, Chip } from "react-native-paper";
import { orange, mainColor, grey, white, textColor, green } from "../../assets/themes/Color";
import Icon from "react-native-vector-icons/Ionicons";
import StyleShare from "../../assets/themes/StyleShare";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slice/userSlice";
import { fetchCompanyByUser } from "../../redux/slice/companySlice";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { storeDb } from "../../assets/config/Key";
import Loading from "../../components/Loading";

export default function HomeCompany({ navigation }) {
  const dispatch = useDispatch();
  const { companyByUser, loading } = useSelector((state) => state.company);

  // Thêm trạng thái loading cục bộ nếu cần
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanyByUser());
  }, [dispatch]);

  useEffect(() => {
    if (companyByUser) {
      saveUserToFirestore(
        companyByUser._id,
        companyByUser.createBy.email,
        companyByUser.name,
        companyByUser.avatar
      );
    }
  }, [companyByUser]);

  const saveUserToFirestore = async (id, email, name, avatar) => {
    setIsSavingToFirestore(true);
    try {
      const userDoc = doc(storeDb, "users", id.toString());
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        await setDoc(userDoc, {
          id: id.toString(),
          email: email || "",
          name: name || "",
          role: "EMPLOYER_USER",
          avatar: avatar || "",
        });
      } else {
        await setDoc(
          userDoc,
          {
            id: id.toString(),
            email: email || "",
            name: name || "",
            role: "EMPLOYER_USER",
            avatar: avatar || "",
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.log("Error saving user:", error);
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const manageEmployers = [
    { id: 1, icon: "megaphone-outline", title: "Chiến dịch tuyển dụng" },
    { id: 3, icon: "people-outline", title: "Tìm kiếm ứng viên" },
    { id: 4, icon: "podium-outline", title: "Thống kê tuyển dụng" },
    { id: 5, icon: "file-tray-stacked-outline", title: "Dịch vụ của bạn" },
  ];

  const UtilitiesGrid = () => (
    <View style={styles.gridUtili}>
      <TouchableOpacity
        style={styles.gridItemUtili}
        onPress={() => navigation.navigate("JobCreate", { companyId: companyByUser._id })}
      >
        <Icon name={"add-circle-outline"} size={20} color={mainColor} />
        <Text style={StyleShare.lineText}>Tuyển dụng</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.gridItemUtili}
        onPress={() => navigation.navigate("Services", { userId: companyByUser._id })}
      >
        <Icon name={"cart-outline"} size={20} color={mainColor} />
        <Text style={StyleShare.lineText}>Mua dịch vụ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.gridItemUtili}
        onPress={() => navigation.navigate("ProfileCompany")}
      >
        <Icon name={"person-outline"} size={20} color={mainColor} />
        <Text style={StyleShare.lineText}>Hồ sơ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.gridItemUtili}
        onPress={() => navigation.navigate("Chat", { currentUserId: companyByUser._id })}
      >
        <Icon name={"chatbubble-outline"} size={20} color={mainColor} />
        <Text style={StyleShare.lineText}>Tin nhắn</Text>
      </TouchableOpacity>
    </View>
  );

  const ManageEmployersGrid = () => (
    <View style={styles.grid}>
      {manageEmployers.map((item) => (
        <TouchableOpacity onPress={() => handleManageEmployersClick(item.id)} key={item.id}>
          <View style={styles.gridItem}>
            <View style={StyleShare.flexBetween}>
              <Icon name={item.icon} size={20} color={mainColor} />
              <Text style={StyleShare.textMainOption}>{item.info}</Text>
            </View>
            <View style={[StyleShare.flexBetween, { marginTop: 10 }]}>
              <Text style={{ fontWeight: "500" }}>{item.title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleLogout = () => {
    dispatch(logout());
    navigation.navigate("AuthStack");
  };

  const handleManageEmployersClick = (id) => {
    switch (id) {
      case 1:
        navigation.navigate("JobByCompany", { companyId: companyByUser._id });
        break;
      case 3:
        navigation.navigate("CandidateSearch", { companyId: companyByUser._id });
        break;
      case 4:
        navigation.navigate("CompanyStatistical", { companyId: companyByUser._id });
        break;
      case 5:
        navigation.navigate("ServicesByCompany", { companyId: companyByUser._id });
        break;
      default:
        console.log("Unknown item clicked");
        break;
    }
  };

  // Hiển thị khi đang loading
  if (loading || isSavingToFirestore) {
    return (
      <Loading/>
    );
  }

  return (
    <ScrollView style={StyleShare.container} showsVerticalScrollIndicator={false}>
      <View style={styles.containerTop}>
        <Text style={StyleShare.titleText20}>Hệ quản trị tuyển dụng</Text>
        {companyByUser && companyByUser.isApproved && (
          <TouchableOpacity onPress={() => navigation.navigate("Notification", { companyId: companyByUser._id })}>
            <Icon name="notifications-outline" size={24} color={mainColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.containerMain}>
        {companyByUser && companyByUser.isApproved ? (
          <>
            <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>Tiện ích</Text>
            <UtilitiesGrid />
            <Text style={[StyleShare.titleText16, { marginVertical: 10 }]}>Quản lý</Text>
            <ManageEmployersGrid />
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.itemUploadCompany}
              onPress={() => navigation.navigate("CompanyCreate")}
              disabled={companyByUser != null}
            >
              <View style={StyleShare.flexBetween}>
                <Text style={StyleShare.titleText16}>
                  {companyByUser ? "Cập nhật thông tin công ty thành công" : "Cập nhật thông tin công ty"}
                </Text>
                <Icon
                  name={companyByUser ? "checkmark-circle-sharp" : "arrow-forward-circle"}
                  size={30}
                  color={companyByUser ? green : orange}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemUploadCompany}
              onPress={() => navigation.navigate("UpdateEmployer")}
            >
              <View style={StyleShare.flexBetween}>
                <Text style={StyleShare.titleText16}>Cập nhật giấy tờ minh chứng</Text>
                <Icon name={"arrow-forward-circle"} size={30} color={orange} />
              </View>
            </TouchableOpacity>
            <Text style={[StyleShare.titleText16, { marginVertical: 20 }]}>
              Sau khi hoàn thành cập nhật thông tin, chúng tôi sẽ xem xét hồ sơ và xét duyệt tài khoản của bạn trong thời gian sớm nhất
            </Text>
          </View>
        )}
      </View>

      <View style={{ margin: 20 }}>
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.btnLogout}>
            <Text style={{ fontWeight: "500", fontSize: 16, marginRight: 10, color: "red" }}>
              Thoát quyền sử dụng
            </Text>
            <Icon name="exit" size={24} color={"red"} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerTop: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  containerMain: {
    marginHorizontal: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: (Dimensions.get("window").width - 50) / 2,
    padding: 16,
    backgroundColor: white,
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 30,
    elevation: 2,
  },
  gridUtili: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  gridItemUtili: {
    alignItems: "center",
  },
  itemUploadCompany: {
    backgroundColor: white,
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    elevation: 2,
  },
  btnLogout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: white,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
});