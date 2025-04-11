import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import { mainColor, white, orange, textColor } from '../../assets/themes/Color';
import { Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import API, { authApi, endpoints } from '../../assets/config/API';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/Loading';

const { width } = Dimensions.get('window');

export default function HomeClient({ navigation }) {
  const currentUser = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [jobRecommendList, setJobRecommendList] = useState([]);
  const [jobUrgentList, setJobUrgentList] = useState([]);



  useEffect(() => {
    if (currentUser?._id) {
      fetchJobUrgent();
      fetchRecommendedJobs(currentUser._id);
    } else {
      console.log('User ID không tồn tại, bỏ qua gọi API recommend.');
      setLoading(false); // Tắt loading nếu không có user
    }
  }, [currentUser?._id]);

  // Giữ nguyên phương thức gọi API, chỉ thêm useCallback để tối ưu
  const fetchJobUrgent = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await authApi(token).get(endpoints['jobs'], {
        params: { page: 1, limit: 9, isUrgent: true },
      });
      setJobUrgentList(res.data.data.result || []);
    } catch (error) {
      console.log('Lỗi khi lấy gợi ý việc làm:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendedJobs = useCallback(async (userId) => {
    setLoading(true);
    const payload = { user_id: userId }; // Thay 'text' thành 'user_id' để khớp với backend
    try {
      const res = await API.post(endpoints['recommend'], payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setJobRecommendList(res.data.recommendations || []);
      console.log(res.data.recommendations)
    } catch (error) {
      console.log('Lỗi khi lấy gợi ý việc làm:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize chunked arrays
  const chunkArray = useCallback((array, chunkSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }, []);

  const jobRecommendPages = useMemo(() => chunkArray(jobRecommendList, 3), [jobRecommendList]);
  const jobUrgentPages = useMemo(() => chunkArray(jobUrgentList, 3), [jobUrgentList]);

  // Memoize renderItem
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('JobDetail', { jobId: item?._id })}>
        <View style={[StyleShare.jobItemContainer]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Image
              size={50}
              source={{ uri: item?.companyId?.avatar || 'https://via.placeholder.com/60' }}
              style={{ backgroundColor: 'white' }}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={StyleShare.titleText16} numberOfLines={2}>
                {item?.name}
              </Text>
              <Text style={{ marginTop: 5, color: textColor }}>{item?.companyId?.name}</Text>
            </View>
          </View>

          <View style={StyleShare.technologyContainer}>
            <Chip style={StyleShare.chip}>{item?.level}</Chip>
            {item?.skills.map((skill, index) => (
              <Chip key={index} style={StyleShare.chip}>
                {skill || 'skill'}
              </Chip>
            ))}
            {item.isUrgent && (
              <Chip style={[StyleShare.chip, { backgroundColor: 'red' }]} textStyle={{ color: 'white' }}>
                GẤP
              </Chip>
            )}
          </View>

          <View style={StyleShare.flexBetween}>
            <View style={StyleShare.flexCenter}>
              <Icon name="time" size={20} color={textColor} style={{ marginRight: 5 }} />
              <Text style={{ color: textColor }}>{moment(item.endDate).fromNow()}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    ),
    [navigation]
  );

  // Memoize renderPage
  const renderPage = useCallback(
    ({ item }) => (
      <View style={styles.pageContainer}>
        <FlatList
          data={item}
          renderItem={renderItem}
          keyExtractor={(job) => job?._id}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3} // Chỉ render 3 item ban đầu
          maxToRenderPerBatch={3} // Giới hạn số item mỗi lần render
          windowSize={5} // Giảm kích thước cửa sổ render
        />
      </View>
    ),
    [renderItem]
  );

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.background}
      >
        <View style={{ flex: 1, marginHorizontal: 20 }}>
          <View style={[StyleShare.flexBetween, { marginTop: 40 }]}>
            <Text style={[StyleShare.titleText16, { color: white, fontStyle: 'italic' }]}>
              Chào bạn trở lại!
            </Text>
            <View style={StyleShare.flexBetween}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notification', { userId: currentUser?._id })}
              >
                <Icon name="notifications-outline" size={24} color={white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('ChatHome', { currentUserId: currentUser?._id })}
              >
                <Icon name="chatbubble-outline" size={24} color={white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => navigation.navigate('JobSearch')} style={StyleShare.searchHome}>
              <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
              <Text>Tìm kiếm việc làm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchMap} onPress={() => navigation.navigate('JobNearBy')}>
              <Icon name="map" size={20} color={white} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
      {loading ? (
        <Loading />
      ) : (
        <View>
          {/* Gợi ý việc làm */}
          <View style={{ marginTop: 20 }}>
            <View style={[StyleShare.flexBetween, { marginHorizontal: 20 }]}>
              <Text style={StyleShare.titleText20}>Việc làm Gấp</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('JobSuggestions', { title: 'Việc làm gấp', api: 'jobs' })}
              >
                <Text style={StyleShare.lineText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={jobUrgentPages}
              renderItem={renderPage}
              keyExtractor={(page, index) => `page-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width}
              decelerationRate="fast"
              pagingEnabled
              initialNumToRender={1} // Chỉ render 1 page ban đầu
              maxToRenderPerBatch={1} // Giới hạn số page mỗi lần render
              windowSize={3} // Giảm kích thước cửa sổ render
            />
          </View>

          {/* Việc làm hấp dẫn */}
          <View style={{ marginTop: 30 }}>
            <View style={[StyleShare.flexBetween, { marginHorizontal: 20 }]}>
              <Text style={StyleShare.titleText20}>Gợi ý việc làm</Text>
              <TouchableOpacity
                // onPress={() => navigation.navigate('JobSuggestions', { title: 'Gợi ý việc làm', api: 'job_recommend' })}
                onPress={() => navigation.navigate('JobSwipe')}
              >
                <Text style={StyleShare.lineText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={jobRecommendPages} // Sửa lỗi từ jobUrgentPages thành jobRecommendPages
              renderItem={renderPage}
              keyExtractor={(page, index) => `page-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width}
              decelerationRate="fast"
              pagingEnabled
              initialNumToRender={1}
              maxToRenderPerBatch={1}
              windowSize={3}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    height: 190,
  },
  searchMap: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: orange,
    elevation: 2,
  },
  pageContainer: {
    width: width,
  },

  iconButton: {
    padding: 10, // Tăng vùng chạm
    borderRadius: 50, // Hình tròn cho nút
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Nền mờ nhẹ cho nút
    marginHorizontal: 5, // Khoảng cách giữa các nút
  },
});