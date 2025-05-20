import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { mainColor, white, textColor } from '../../assets/themes/Color';
import Dropdown from '../../components/Dropdown';
import Modal from 'react-native-modal';
import Button from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { authApi, endpoints } from '../../assets/config/API';
import Loading from '../../components/Loading';
import moment from 'moment';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';

// [Rest of imports remain unchanged]

export default function JobSuggestions({ navigation, route }) {
  const { title, api } = route.params;
  const { user: currentUser } = useSelector((state) => state.user);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [level, setLevel] = useState(null);
  const [salary, setSalary] = useState(null);
  const [jobType, setJobType] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);

  const levelData = [
    { title: 'Intern' },
    { title: 'Fresher' },
    { title: 'Junior' },
    { title: 'Middle' },
    { title: 'Senior' },
    { title: 'Trưởng nhóm' },
    { title: 'Trưởng phòng' },
    { title: 'Director' },
  ];

  const salaryData = [
    { title: 'Dưới 5 triệu' },
    { title: '10 - 15 triệu' },
    { title: '15 - 20 triệu' },
    { title: '20 - 25 triệu' },
    { title: '30 - 50 triệu' },
    { title: 'Trên 50 triệu' },
    { title: 'Thỏa thuận' },
  ];

  const jobTypeData = [
    { title: 'Office' },
    { title: 'Remote' },
    { title: 'Hybrid' },
  ];
  const cacheKey = useMemo(
    () =>
      `job_data_${api}_${currentUser?._id || 'guest'}_${searchKeyword}_${level}_${salary}_${jobType}`,
    [api, currentUser?._id, searchKeyword, level, salary, jobType]
  );

  // Load cached data
  const loadCachedData = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setJobData(data.result);
          setCurrentPage(data.meta.currentPage);
          setTotalPages(data.meta.totalPages);
          setTotalItems(data.meta.totalItems);
          setNoMoreData(data.meta.currentPage >= data.meta.totalPages);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error loading cache:', err);
      return false;
    }
  }, [cacheKey]);

  // Save data to cache
  const saveToCache = useCallback(
    async (data) => {
      try {
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (err) {
        console.error('Error saving cache:', err);
      }
    },
    [cacheKey]
  );

  const fetchListJob = useCallback(
    async (page = 1, limit = 10, name = '') => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        let res;
        if (api === 'jobs') {
          const token = await AsyncStorage.getItem('access_token');
          res = await authApi(token).get(endpoints[api], {
            params: {
              isUrgent: true,
              page,
              limit,
              name: name ? `/${name}/i` : '',
              level,
              salary,
              jobType,
            },
          });
        } else if (api === 'recommend') {
          res = await API.post(
            endpoints[api],
            { user_id: currentUser?._id },
            {
              params: {
                page: page,
                limit,
              },
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const data = res.data.data;
        if (page === 1) {
          setJobData(data.result);
          saveToCache(data);
        } else {
          setJobData((prev) => {
            const existingIds = new Set(prev.map((item) => item._id));
            const newJobs = data.result.filter((item) => !existingIds.has(item._id));
            const updatedData = [...prev, ...newJobs];
            saveToCache({ ...data, result: updatedData });
            return updatedData;
          });
        }
        setCurrentPage(data.meta.currentPage);
        setTotalPages(data.meta.totalPages);
        setTotalItems(data.meta.totalItems);
        setNoMoreData(data.meta.currentPage >= data.meta.totalPages)
      } catch (error) {
        console.log('Error fetching jobs:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [api, currentUser?._id, navigation, saveToCache]
  );

  const debouncedFetchListJob = useMemo(
    () => debounce((page, limit, name) => fetchListJob(page, limit, name), 300),
    [fetchListJob]
  );

  useEffect(() => {
    const initialize = async () => {
      const cached = await loadCachedData();
      if (!cached) {
        fetchListJob(1, limit);
      }
    };
    initialize();
  }, [fetchListJob, loadCachedData]);

  const loadMoreJobs = useCallback(() => {
    if (currentPage < totalPages && !loadingMore && !noMoreData) {
      fetchListJob(currentPage + 1, limit, searchKeyword);
    }
  }, [currentPage, totalPages, loadingMore, noMoreData, searchKeyword, fetchListJob]);

  const applyFilters = () => {
    setCurrentPage(1);
    fetchListJob(1, limit, searchKeyword);
    setModalVisible(false);
  };

  const resetFilters = () => {
    setLevel(null);
    setSalary(null);
    setJobType(null);
    setSearchKeyword('');
    setCurrentPage(1);
    fetchListJob(1, limit);
    setModalVisible(false);
  };

  const renderItem = useMemo(
    () =>
      ({ item }) => (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
        >
          <View style={[StyleShare.jobItemContainer]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Image
                size={50}
                source={{
                  uri: item?.companyId?.avatar || 'https://via.placeholder.com/60',
                }}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={StyleShare.titleText16} numberOfLines={2}>
                  {item?.name || 'Không có tiêu đề'}
                </Text>
                <Text style={{ marginTop: 5, color: textColor }}>
                  {item?.companyId?.name || 'Không xác định'}
                </Text>
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
                <Chip
                  style={[StyleShare.chip, { backgroundColor: '#FF4500', marginLeft: 5 }]}
                  icon={() => <Icon name="flame" size={16} color={white} />}
                >
                  <Text style={{ color: white, fontSize: 12 }}>Gấp</Text>
                </Chip>
              )}
            </View>
            <View style={StyleShare.flexBetween}>
              <View style={StyleShare.flexCenter}>
                <Icon
                  name="time"
                  size={20}
                  color={textColor}
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: textColor }}>
                  {moment(item.endDate).isValid()
                    ? moment(item.endDate).fromNow()
                    : 'Không xác định'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      ),
    [navigation, api]
  );

  return (
    <View style={StyleShare.container}>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={500}
        backdropTransitionOutTiming={500}
        style={StyleShare.modalStyle}
      >
        <View style={StyleShare.modalContent}>
          <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
            <Text style={StyleShare.titleText20}>Bộ lọc việc làm</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={26} color={'red'} />
            </TouchableOpacity>
          </View>
          <Text style={StyleShare.titleText16}>Level</Text>
          <Dropdown
            data={levelData}
            onSelect={(item) => setLevel(item.title)}
            placeholder="Chọn Level"
            buttonStyle={{
              marginTop: 10,
              width: '100%',
              height: 50,
              marginBottom: 20,
            }}
          />
          <Text style={StyleShare.titleText16}>Loại hình</Text>
          <Dropdown
            data={jobTypeData}
            onSelect={(item) => setJobType(item.title)}
            placeholder="Chọn loại hình"
            buttonStyle={{
              marginTop: 10,
              width: '100%',
              height: 50,
              marginBottom: 20,
            }}
          />
          <Text style={StyleShare.titleText16}>Mức lương</Text>
          <Dropdown
            data={salaryData}
            onSelect={(item) => setSalary(item.title)}
            placeholder="Chọn mức lương"
            buttonStyle={{
              marginTop: 10,
              width: '100%',
              height: 50,
              marginBottom: 20,
            }}
          />
          <Button
            title={'Áp dụng'}
            backgroundColor={mainColor}
            textColor={white}
            onPress={applyFilters}
          />
          <Button
            title={'Đặt lại'}
            backgroundColor={'#e0e0e0'}
            textColor={'black'}
            onPress={resetFilters}
          />
        </View>
      </Modal>
      <UIHeader
        leftIcon={'arrow-back'}
        title={title}
        rightIcon={'options'}
        handleRightIcon={() => setModalVisible(true)}
        handleLeftIcon={() => navigation.goBack()}
      />
      <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
        <View style={StyleShare.searchDetail}>
          <Icon name="search" color={mainColor} size={24} style={{ marginRight: 10 }} />
          <TextInput
            style={StyleShare.searchInput}
            placeholder="Tìm kiếm tin tuyển dụng..."
            value={searchKeyword}
            onChangeText={(text) => {
              setSearchKeyword(text);
              debouncedFetchListJob(1, limit, text);
            }}
            returnKeyType="search"
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={StyleShare.titleText16}>{totalItems} việc làm</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={jobData}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 15 }}
            onEndReached={loadMoreJobs}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={{ marginTop: 50, alignItems: 'center' }}>
                <Image
                  source={require('../../assets/images/save.png')}
                  style={StyleShare.imageNullData}
                />
                <Text style={StyleShare.titleText20}>
                  Không có tin tuyển dụng nào hiển thị
                </Text>
                <Text style={{ padding: 20, textAlign: 'center' }}>
                  Hiện tại chưa có tin tuyển dụng nào phù hợp, hãy quay lại sau nhé.
                </Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <Loading />
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}