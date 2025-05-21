import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import UIHeader from '../../components/UIHeader';
import StyleShare from '../../assets/themes/StyleShare';
import Dropdown from '../../components/Dropdown';
import moment from 'moment';
import { grey, textColor } from '../../assets/themes/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../assets/config/API';
import { ToastMess } from '../../components/ToastMess';
import Loading from '../../components/Loading';
import * as FileSystem from 'expo-file-system';

export default function ResumeView({ route, navigation }) {
  const { resumeDetail } = route.params;
  const [selectedStatus, setSelectedStatus] = useState('Đã xem');
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${resumeDetail.cv}`;

  const activeData = [
    { title: 'Chấp nhận', value: 'Chấp nhận' },
    { title: 'Từ chối', value: 'Từ chối' },
  ];

  // Cập nhật trạng thái ban đầu khi vào màn hình
  useEffect(() => {
    setSelectedStatus(resumeDetail.status);
  }, [resumeDetail.status]);

  const handleDownloadFile = async () => {
    try {
      const fileName = resumeDetail.cv.split('/').pop();
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(resumeDetail.cv, fileUri);

      ToastMess({ type: 'success', text1: 'Tải xuống thành công' });
    } catch (error) {
      console.log(error);
      ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
    }
  };

  const handleStatusChange = useCallback(
    async (item) => {
      if (item.value === selectedStatus) return;

      Alert.alert(
        'Cập nhật hồ sơ',
        'Xác nhận thay đổi trạng thái của hồ sơ ứng tuyển này?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đồng ý',
            onPress: async () => {
              try {
                setIsUpdating(true);
                const token = await AsyncStorage.getItem('access_token');
                await authApi(token).patch(endpoints['resumeDetail'](resumeDetail._id), {
                  status: item.value,
                });
                setSelectedStatus(item.value);
                ToastMess({ type: 'success', text1: 'Cập nhật thành công' });
                // Cập nhật trạng thái trong navigation params để màn hình danh sách có thể phản ánh
                navigation.setParams({ resumeDetail: { ...resumeDetail, status: item.value } });
              } catch (error) {
                ToastMess({ type: 'error', text1: 'Có lỗi xảy ra, vui lòng thử lại' });
                console.error('Update status error:', error);
              } finally {
                setIsUpdating(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [selectedStatus, resumeDetail._id, navigation]
  );

  return (
    <View style={StyleShare.container}>
      <UIHeader
        leftIcon={'arrow-back'}
        rightIcon={'download-outline'}
        title={resumeDetail.name || 'Hồ sơ ứng viên'}
        handleLeftIcon={() => navigation.goBack()}
        handleRightIcon={() => handleDownloadFile()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={StyleShare.jobItemContainer}>
          <View style={StyleShare.flexBetween}>
            <Text style={StyleShare.titleText20}>Thông tin ứng viên</Text>
            <Dropdown
              data={activeData}
              onSelect={handleStatusChange}
              value={selectedStatus}
              placeholder={selectedStatus} // Hiển thị trạng thái hiện tại
              buttonStyle={styles.dropdownButton}
              disabled={isUpdating}
            />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ và tên:</Text>
            <Text style={StyleShare.titleText16}>{resumeDetail.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={StyleShare.titleText16}>{resumeDetail.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={StyleShare.titleText16}>{resumeDetail.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày ứng tuyển:</Text>
            <Text style={StyleShare.titleText16}>
              {moment(resumeDetail.createdAt).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>

        <View style={styles.cvContainer}>
          <Text style={StyleShare.titleText20}>CV ứng viên</Text>
          {isWebViewLoading && (
            <View style={styles.loadingOverlay}>
              <Loading />
            </View>
          )}
          <WebView
            source={{ uri: googleDocsUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            onLoad={() => setIsWebViewLoading(false)}
            onError={(syntheticEvent) => {
              setIsWebViewLoading(false);
              ToastMess({ type: 'error', text1: 'Không thể tải CV, vui lòng thử lại' });
            }}
          />
        </View>
      </ScrollView>
      {isUpdating && (
        <View style={styles.updatingOverlay}>
          <Loading />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  dropdownButton: {
    width: 120,
    height: 40,
    backgroundColor: grey,
    borderRadius: 8,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    fontWeight: '500',
    color: textColor,
    width: 120,
  },
  cvContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  webview: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height * 0.6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});