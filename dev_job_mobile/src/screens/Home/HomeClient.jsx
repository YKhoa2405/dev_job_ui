import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  ImageBackground,
} from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import { mainColor, white, orange, textColor } from '../../assets/themes/Color';
import { Avatar, Badge, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import API, { authApi, endpoints } from '../../assets/config/API';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/Loading';

export default function HomeClient({ navigation }) {
  const { user: currentUser, fcmToken } = useSelector((state) => state.user);
  const [loadingUrgent, setLoadingUrgent] = useState(true);
  const [loadingRecommend, setLoadingRecommend] = useState(true);
  const [jobUrgentList, setJobUrgentList] = useState([]);
  const [jobRecommendList, setJobRecommendList] = useState([]);
  const [sectionData, setSectionData] = useState([]);

  useEffect(() => {
    if (currentUser?._id) {
      fetchJobUrgent();
      fetchRecommendedJobs(currentUser._id);
      saveFcmToken();
    }
  }, [currentUser?._id]);

  useEffect(() => {
    const sections = [
      { type: 'urgent_header', id: 'urgent_header' },
      ...(jobUrgentList.length > 0
        ? jobUrgentList.map((job) => ({
            type: 'urgent_job',
            data: job,
            id: `urgent_${job._id}`,
          }))
        : [{ type: 'empty_urgent', id: 'empty_urgent' }]),
      { type: 'recommend_header', id: 'recommend_header' },
      ...(jobRecommendList.length > 0
        ? jobRecommendList.map((job) => ({
            type: 'recommend_job',
            data: job,
            id: `recommend_${job._id}`,
          }))
        : [{ type: 'empty_recommend', id: 'empty_recommend' }]),
    ];
    setSectionData(sections);
  }, [jobUrgentList, jobRecommendList]);

  const saveFcmToken = useCallback(async () => {
    if (!fcmToken) return;
    const token = await AsyncStorage.getItem('access_token');
    await authApi(token).post(endpoints['saveFcmToken'], {
      userId: currentUser._id,
      fcmToken,
    });
  }, [fcmToken, currentUser?._id]);

  const fetchJobUrgent = useCallback(async () => {
    setLoadingUrgent(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await authApi(token).get(endpoints['jobs'], {
        params: { page: 1, limit: 5, isUrgent: true },
      });
      const result = res.data?.data?.result || [];
      setJobUrgentList(result);
    } catch (error) {
      console.log('Lỗi khi tải việc làm gấp:', error);
    } finally {
      setLoadingUrgent(false);
    }
  }, []);

  const fetchRecommendedJobs = useCallback(async (userId) => {
    setLoadingRecommend(true);
    try {
      const res = await API.post(
        endpoints['recommend'],
        { user_id: userId },
        { params: { page: 1, limit: 5 } },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const recommendations = res.data?.data?.result || [];
      setJobRecommendList(recommendations);
    } catch (error) {
      console.log('Lỗi khi tải gợi ý việc làm:', error);
    } finally {
      setLoadingRecommend(false);
    }
  }, []);

  const renderJobItem = useCallback(
    (item) => (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('JobDetail', { jobId: item?._id })}>
        <View style={StyleShare.jobItemContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Image
              size={50}
              source={{ uri: item?.companyId?.avatar || 'https://via.placeholder.com/60' }}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={StyleShare.titleText16} numberOfLines={2}>
                {item?.name || 'Không có tiêu đề'}
              </Text>
              <Text style={{ marginTop: 5, color: textColor }}>{item?.companyId?.name || 'Không xác định'}</Text>
            </View>
          </View>
          <View style={StyleShare.technologyContainer}>
            <Chip style={StyleShare.chip}>{item?.city || 'N/A'}</Chip>
            <Chip style={StyleShare.chip}>{item?.level || 'N/A'}</Chip>
            {item?.skills?.map((skill, index) => (
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
              <Text style={{ color: textColor }}>{moment(item.endDate).fromNow() || 'Không xác định'}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    ),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case 'urgent_header':
          return (
            <View style={[StyleShare.flexBetween, { marginHorizontal: 20, marginTop: 20 }]}> 
              <Text style={StyleShare.titleText20}>Việc làm Gấp</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('JobSuggestions', { title: 'Việc làm gấp', api: 'jobs' })}
              >
                <Text style={StyleShare.lineText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
          );
        case 'recommend_header':
          return (
            <View style={[StyleShare.flexBetween, { marginHorizontal: 20, marginTop: 30 }]}> 
              <Text style={StyleShare.titleText20}>Gợi ý việc làm</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('JobSuggestions', { title: 'Gợi ý việc làm', api: 'recommend' })}
              >
                <Text style={StyleShare.lineText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
          );
        case 'urgent_job':
        case 'recommend_job':
          return renderJobItem(item.data);
        case 'empty_urgent':
          return loadingUrgent ? <Loading /> : null;
        case 'empty_recommend':
          return loadingRecommend ? <Loading /> : null;
        default:
          return null;
      }
    },
    [navigation, renderJobItem, loadingUrgent, loadingRecommend]
  );

  const renderHeader = useCallback(
    () => (
      <ImageBackground source={require('../../assets/images/background.png')} style={styles.background}>
        <View style={{ flex: 1, marginHorizontal: 20 }}>
          <View style={[StyleShare.flexBetween, { marginTop: 40 }]}> 
            <Text style={[StyleShare.titleText16, { color: white, fontStyle: 'italic' }]}>Chào bạn, {currentUser?.name || 'Khách'}.</Text>
            <View style={StyleShare.flexBetween}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notification', { userId: currentUser?._id })}
              >
                <View style={{ position: 'relative' }}>
                  <Icon name="notifications-outline" size={24} color={white} />
                  <Badge visible={false} size={10} style={styles.badge} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('ChatHome', { currentUserId: currentUser?._id, roleName: 'client' })}
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
    ),
    [navigation, currentUser]
  );

  return (
    <FlatList
      data={sectionData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
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
  iconButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
  },
});
