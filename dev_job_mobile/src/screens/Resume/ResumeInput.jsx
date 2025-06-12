import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, white } from '../../assets/themes/Color';
import Dropdown from '../../components/Dropdown';
import axios from 'axios';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import { ToastMess } from '../../components/ToastMess';
import API, { endpoints } from '../../assets/config/API';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addEducation, addPersonalInfo, addSkill, deleteEducation } from '../../redux/slice/resumeSlice';
import { geminiService } from '../../assets/config/GeminiService';

// Utility function to format date to dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Utility function to validate date of birth (must be in the past)
const isValidDateOfBirth = (date) => {
  const today = new Date();
  return date < today;
};

// Utility function to validate education dates (endDate must be after startDate)
const isValidEducationDates = (startDate, endDate) => {
  return startDate < endDate;
};

export default function ResumeInput({ route, navigation }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // State for date picker visibility
  const [isDatePickerVisible, setDatePickerVisible] = useState({
    dateOfBirth: false,
    startDate: false,
    endDate: false,
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({
    nameCV: '',
    fullName: currentUser?.name || '',
    position: '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    gender: '',
    dateOfBirth: '',
    address: {
      province: '',
      district: '',
      ward: '',
    },
    githubLink: '',
  });

  const [skills, setSkills] = useState([]);
  const [newGroup, setNewGroup] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInfo, setSkillInfo] = useState([]);
  const [educationInfo, setEducationInfo] = useState([]);
  const [education, setEducation] = useState({
    id: new Date().getTime(),
    schoolName: '',
    startDate: '',
    endDate: '',
    major: '',
    description: '',
  });

  const [isModalSkill, setModalSkill] = useState(false);
  const [isModalEducation, setModalEducation] = useState(false);

  const GenderData = [
    { title: 'Nam' },
    { title: 'Nữ' },
    { title: 'Khác' },
  ];

  useEffect(() => {
    fetchProvinces();
    fetchSkills();
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
      setProvinces(res.data.data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
      if (response.data.error === 0) {
        setDistricts(response.data.data || []);
        setWards([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchWards = async (districtId) => {
    try {
      const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
      if (response.data.error === 0) {
        setWards(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const fetchSkills = async (currentPage = 1, limit = 100) => {
    try {
      const res = await API.get(endpoints['skills'], {
        params: {
          page: currentPage,
          limit: limit,
        },
      });
      const formattedSkills = res.data.data.result.map((skill) => ({
        label: skill.name,
        value: skill.name,
      }));
      setSkills(formattedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSaveSkill = () => {
    if (newGroup && selectedSkills.length > 0) {
      setSkillInfo((prevSkillInfo) => [
        ...prevSkillInfo,
        { groupSkill: newGroup, skillList: selectedSkills },
      ]);
      setModalSkill(false);
      setNewGroup('');
      setSelectedSkills([]);
    } else {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
    }
  };

  const handleDeleteSkill = (groupIndex) => {
    setSkillInfo((prevSkillInfo) =>
      prevSkillInfo.filter((_, idx) => idx !== groupIndex)
    );
  };

  const handlePersonalChange = (field, value) => {
    setPersonalInfo((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setPersonalInfo((prevState) => ({
      ...prevState,
      address: {
        ...prevState.address,
        [field]: value,
      },
    }));
  };

  const handleEducationChange = (field, value) => {
    setEducation((prevEducation) => ({
      ...prevEducation,
      [field]: value,
    }));
  };

  // Handle date selection
  const handleDateConfirm = (field, date) => {
    if (field === 'dateOfBirth') {
      if (!isValidDateOfBirth(date)) {
        ToastMess({ type: 'error', text1: 'Ngày sinh phải là ngày trong quá khứ.' });
        return;
      }
      setPersonalInfo((prev) => ({ ...prev, dateOfBirth: formatDate(date) }));
      setDatePickerVisible((prev) => ({ ...prev, dateOfBirth: false }));
    } else if (field === 'startDate' || field === 'endDate') {
      setEducation((prev) => ({ ...prev, [field]: formatDate(date) }));
      setDatePickerVisible((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Show date picker
  const showDatePicker = (field) => {
    setDatePickerVisible((prev) => ({ ...prev, [field]: true }));
  };

  // Hide date picker
  const hideDatePicker = (field) => {
    setDatePickerVisible((prev) => ({ ...prev, [field]: false }));
  };

  const handleSaveEducation = () => {
    if (!education.schoolName || !education.startDate || !education.endDate || !education.major) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // Convert string dates to Date objects for comparison
    const startDate = new Date(education.startDate.split('/').reverse().join('-'));
    const endDate = new Date(education.endDate.split('/').reverse().join('-'));

    if (!isValidEducationDates(startDate, endDate)) {
      ToastMess({ type: 'error', text1: 'Ngày kết thúc phải sau ngày bắt đầu.' });
      return;
    }

    setEducationInfo((prevList) => [...prevList, education]);
    setModalEducation(false);
    setEducation({
      id: new Date().getTime(),
      schoolName: '',
      startDate: '',
      endDate: '',
      major: '',
      description: '',
    });
  };

  const handleGenerateExample = async () => {
    setLoading(true);
    try {
      const school = education.schoolName.trim();
      const major = education.major.trim();

      if (!school || !major) {
        Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
        return;
      }

      const prompt = `
        You are a professional resume writer.
        Write a concise **Vietnamese** education description for a student majoring in "${major}" at "${school}".
        Use bullet points only.
        Do not include any titles or headings.
        Return only the bullet points in Vietnamese.
        `;

      const response = await geminiService(prompt);
      handleEducationChange('description', response);
    } catch (error) {
      console.error('Error generating example:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = (id) => {
    setEducationInfo((prevList) => prevList.filter((education) => education.id !== id));
    dispatch(deleteEducation({ id }));
  };

  const handleSubmit = () => {
    if (
      !personalInfo.nameCV.trim() ||
      !personalInfo.fullName.trim() ||
      !personalInfo.email.trim() ||
      !personalInfo.phone.trim() ||
      !personalInfo.dateOfBirth.trim() ||
      !personalInfo.position.trim() ||
      !personalInfo.gender.trim()
    ) {
      ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
      return;
    }

    const dob = new Date(personalInfo.dateOfBirth.split('/').reverse().join('-'));
    if (!isValidDateOfBirth(dob)) {
      ToastMess({ type: 'error', text1: 'Ngày sinh phải là ngày trong quá khứ.' });
      return;
    }

    if (educationInfo.length === 0) {
      ToastMess({ type: 'error', text1: 'Vui lòng thêm ít nhất một học vấn.' });
      return;
    }

    if (skillInfo.length === 0) {
      ToastMess({ type: 'error', text1: 'Vui lòng thêm ít nhất một kỹ năng.' });
      return;
    }

    dispatch(addEducation(educationInfo));
    dispatch(addPersonalInfo(personalInfo));
    dispatch(addSkill(skillInfo));
    navigation.navigate('ResumeExperience');
  };

  return (
    <View style={StyleShare.container}>
      {/* Date Picker Modals */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible.dateOfBirth}
        mode="date"
        onConfirm={(date) => handleDateConfirm('dateOfBirth', date)}
        onCancel={() => hideDatePicker('dateOfBirth')}
        maximumDate={new Date()} // Prevent selecting future dates
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible.startDate}
        mode="date"
        onConfirm={(date) => handleDateConfirm('startDate', date)}
        onCancel={() => hideDatePicker('startDate')}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible.endDate}
        mode="date"
        onConfirm={(date) => handleDateConfirm('endDate', date)}
        onCancel={() => hideDatePicker('endDate')}
      />

      {/* Skill Modal */}
      <Modal
        isVisible={isModalSkill}
        onBackdropPress={() => setModalSkill(!isModalSkill)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={500}
        backdropTransitionOutTiming={500}
        style={StyleShare.modalStyle}
      >
        <View style={StyleShare.modalContent}>
          <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
            <Text style={StyleShare.titleText20}>Thêm mới kỹ năng</Text>
            <TouchableOpacity onPress={() => setModalSkill(false)}>
              <Icon name="close" size={26} color={'red'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.textInput}>
            Nhóm kỹ năng <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            placeholder="FE, BE, QA, BA, PM, HR, ..."
            style={styles.introduceInput}
            value={newGroup}
            onChangeText={setNewGroup}
          />

          <Text style={styles.textInput}>
            Danh sách kỹ năng <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <DropDownPicker
            open={open}
            items={skills}
            setOpen={setOpen}
            setItems={setSkills}
            multiple={true}
            min={0}
            max={10}
            placeholder="Chọn kỹ năng"
            searchable={true}
            mode="BADGE"
            badgeDotColors={['#e76f51', '#00b4d8', '#e9c46a']}
            listMode="SCROLLVIEW"
            searchPlaceholder="Tìm kiếm kỹ năng..."
            style={{
              borderWidth: 0,
              borderColor: white,
              borderRadius: 10,
            }}
            dropDownContainerStyle={{
              backgroundColor: white,
              borderWidth: 1,
              borderColor: grey,
              borderRadius: 10,
              maxHeight: 200,
            }}
            textStyle={{
              fontWeight: '500',
            }}
            value={selectedSkills}
            setValue={setSelectedSkills}
          />

          <View style={{ marginTop: 20 }} />
          <Button
            title={'Lưu'}
            backgroundColor={mainColor}
            textColor={white}
            onPress={handleSaveSkill}
          />
        </View>
      </Modal>

      {/* Education Modal */}
      <Modal
        isVisible={isModalEducation}
        onBackdropPress={() => setModalEducation(!isModalEducation)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={500}
        backdropTransitionOutTiming={500}
        style={StyleShare.modalStyle}
      >
        <View style={StyleShare.modalContent}>
          <View style={[StyleShare.flexBetween, { marginVertical: 15 }]}>
            <Text style={StyleShare.titleText20}>Thêm mới trình độ học vấn</Text>
            <TouchableOpacity onPress={() => setModalEducation(false)}>
              <Icon name="close" size={26} color={'red'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.textInput}>
            Tên trường hoặc trung tâm <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            value={education.schoolName}
            onChangeText={(value) => handleEducationChange('schoolName', value)}
            style={styles.introduceInput}
          />

          <View style={StyleShare.flexBetween}>
            <View style={{ width: '48%' }}>
              <Text style={styles.textInput}>
                Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity onPress={() => showDatePicker('startDate')}>
                <TextInput
                  value={education.startDate}
                  placeholder="dd/mm/yyyy"
                  style={styles.introduceInput}
                  editable={false}
                />
              </TouchableOpacity>
            </View>
            <View style={{ width: '48%' }}>
              <Text style={styles.textInput}>
                Ngày kết thúc <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity onPress={() => showDatePicker('endDate')}>
                <TextInput
                  value={education.endDate}
                  placeholder="dd/mm/yyyy"
                  style={styles.introduceInput}
                  editable={false}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.textInput}>
            Chuyên ngành <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            value={education.major}
            onChangeText={(value) => handleEducationChange('major', value)}
            style={styles.introduceInput}
          />

          <View style={StyleShare.flexBetween}>
            <Text style={styles.textInput}>Mô tả</Text>
            {loading ? (
              <Text style={{ color: 'grey', fontWeight: 'bold' }}>Đang tải...</Text>
            ) : (
              <TouchableOpacity onPress={handleGenerateExample}>
                <Text style={{ color: 'grey', fontWeight: 'bold' }}>Gợi ý với AI</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            value={education.description}
            onChangeText={(text) => {
              if (text.trim() === '') {
                handleEducationChange('description', '');
                return;
              }
              handleEducationChange('description', text);
            }}
            style={[styles.introduceInput, { height: 100, textAlignVertical: 'top' }]}
            multiline
            numberOfLines={10}
          />

          <View style={{ marginTop: 20 }} />
          <Button
            title={'Lưu'}
            backgroundColor={mainColor}
            textColor={white}
            onPress={handleSaveEducation}
          />
        </View>
      </Modal>

      <UIHeader
        leftIcon={'arrow-back'}
        title={'Thông tin chung'}
        handleLeftIcon={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={StyleShare.manageJob}>
          <Text style={styles.textInput}>
            Tên CV <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            style={styles.introduceInput}
            value={personalInfo.nameCV}
            onChangeText={(text) => handlePersonalChange('nameCV', text)}
            placeholder="Nhập tên CV, chỉ gồm chữ, số, _"
          />
        </View>
        <View style={StyleShare.manageJob}>
          <Text style={StyleShare.titleText16}>Thông tin cá nhân:</Text>
          <View style={{ marginTop: 10 }}>
            <Text style={styles.textInput}>
              Họ và tên <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.introduceInput}
              value={personalInfo.fullName}
              onChangeText={(text) => handlePersonalChange('fullName', text)}
            />

            <Text style={styles.textInput}>
              Vị trí ứng tuyển <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.introduceInput}
              value={personalInfo.position}
              placeholder="Frontend Developer, Backend Developer, ..."
              onChangeText={(text) => handlePersonalChange('position', text)}
            />

            <Text style={styles.textInput}>
              Email <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.introduceInput}
              keyboardType="email-address"
              autoCapitalize="none"
              value={personalInfo.email}
              onChangeText={(text) => handlePersonalChange('email', text)}
            />

            <Text style={styles.textInput}>
              Số điện thoại <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              style={styles.introduceInput}
              keyboardType="phone-pad"
              value={personalInfo.phone}
              onChangeText={(text) => handlePersonalChange('phone', text)}
            />

            <Text style={styles.textInput}>
              Ngày sinh <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TouchableOpacity onPress={() => showDatePicker('dateOfBirth')}>
              <TextInput
                style={styles.introduceInput}
                placeholder="dd/mm/yyyy"
                value={personalInfo.dateOfBirth}
                editable={false}
              />
            </TouchableOpacity>

            <Text style={styles.textInput}>Github</Text>
            <TextInput
              style={styles.introduceInput}
              keyboardType="url"
              autoCapitalize="none"
              value={personalInfo.githubLink}
              onChangeText={(text) => handlePersonalChange('githubLink', text)}
              placeholder="https://github.com/YKhoa2405"
            />

            <Text style={styles.textInput}>Giới tính</Text>
            <Dropdown
              data={GenderData}
              onSelect={(item) => handlePersonalChange('gender', item.title)}
              placeholder="Chọn giới tính"
              buttonStyle={{
                height: 50,
                borderWidth: 2,
                borderColor: grey,
                width: '100%',
              }}
            />

            <Text style={styles.textInput}>
              Địa chỉ <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <Dropdown
              data={provinces.map((province) => ({ title: province.full_name, id: province.id }))}
              onSelect={(item) => {
                handleAddressChange('province', item.title);
                handleAddressChange('district', '');
                handleAddressChange('ward', '');
                fetchDistricts(item.id);
              }}
              placeholder="Chọn tỉnh/thành phố"
              buttonStyle={{
                width: '100%',
                height: 50,
                borderColor: grey,
                borderWidth: 2,
              }}
            />

            <Dropdown
              data={districts.map((district) => ({ title: district.full_name, id: district.id }))}
              onSelect={(item) => {
                handleAddressChange('district', item.title);
                handleAddressChange('ward', '');
                fetchWards(item.id);
              }}
              placeholder="Chọn quận/huyện"
              disabled={!personalInfo.address.province}
              buttonStyle={{
                width: '100%',
                height: 50,
                borderColor: grey,
                borderWidth: 2,
                marginTop: 10,
              }}
            />

            <Dropdown
              data={wards.map((ward) => ({ title: ward.full_name, id: ward.id }))}
              onSelect={(item) => {
                handleAddressChange('ward', item.title);
              }}
              placeholder="Chọn phường/xã"
              disabled={!personalInfo.address.district}
              buttonStyle={{
                width: '100%',
                height: 50,
                borderColor: grey,
                borderWidth: 2,
                marginTop: 10,
              }}
            />
          </View>
        </View>

        <View style={StyleShare.manageJob}>
          <Text style={StyleShare.titleText16}>
            Học vấn <Text style={{ color: 'red' }}>*</Text>
          </Text>
          {educationInfo.map((item) => (
            <View key={item.id} style={[StyleShare.flexBetween, { marginBottom: 5 }]}>
              <Text style={{ flex: 1, fontWeight: '500' }}>{item.schoolName}</Text>
              <TouchableOpacity onPress={() => handleDeleteEducation(item.id)}>
                <Icon name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.inputAddNew}
            onPress={() => setModalEducation(true)}
          >
            <Text style={{ fontWeight: 'bold', color: orange }}>Thêm mới</Text>
          </TouchableOpacity>
        </View>

        <View style={StyleShare.manageJob}>
          <Text style={StyleShare.titleText16}>
            Kỹ năng <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={{ marginTop: 10 }}>
            {skillInfo.map((item, index) => (
              <View key={index} style={[StyleShare.flexBetween, { marginBottom: 5 }]}>
                <Text style={{ flex: 1 }}>
                  {item.groupSkill}:{' '}
                  {item.skillList.map((skill, idx) => (
                    <Text key={idx}>
                      {skill}
                      {idx < item.skillList.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteSkill(index)}>
                  <Icon name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.inputAddNew} onPress={() => setModalSkill(true)}>
            <Text style={{ fontWeight: 'bold', color: orange }}>Thêm mới</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[StyleShare.flexCenter, {
          backgroundColor: mainColor,
          padding: 15,
          marginBottom: 10,
          marginHorizontal: 20,
          borderRadius: 10,
        }]}
        onPress={handleSubmit}
      >
        <Text style={[StyleShare.titleText16, { color: 'white' }]}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    fontWeight: 'bold',
    color: mainColor,
    marginTop: 10,
    marginBottom: 5,
  },
  introduceInput: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 13,
    backgroundColor: white,
    borderColor: grey,
    borderWidth: 2,
  },
  inputAddNew: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderColor: orange,
    borderWidth: 1,
    padding: 10,
  },
});