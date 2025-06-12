import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Text, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import StyleShare from '../../assets/themes/StyleShare';
import UIHeader from '../../components/UIHeader';
import { grey, mainColor, orange, textColor, white } from '../../assets/themes/Color';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { addProject } from '../../redux/slice/resumeSlice';
import { ToastMess } from '../../components/ToastMess';
import { geminiService } from '../../assets/config/GeminiService';

// Utility function to format date to dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Utility function to validate project dates (endDate must be after startDate)
const isValidProjectDates = (startDate, endDate) => {
  return startDate < endDate;
};

export default function ResumeProject({ navigation }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [projects, setProjects] = useState([
    { id: new Date().getTime(), name: '', startDate: '', endDate: '', github: '', description: '' },
  ]);
  const [noProjects, setNoProjects] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState({}); // State for date picker visibility

  // Show date picker for a specific project and field
  const showDatePicker = (index, field) => {
    setDatePickerVisible((prev) => ({ ...prev, [`${index}_${field}`]: true }));
  };

  // Hide date picker for a specific project and field
  const hideDatePicker = (index, field) => {
    setDatePickerVisible((prev) => ({ ...prev, [`${index}_${field}`]: false }));
  };

  // Handle date selection
  const handleDateConfirm = (index, field, date) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = formatDate(date);
    setProjects(updatedProjects);
    setDatePickerVisible((prev) => ({ ...prev, [`${index}_${field}`]: false }));
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { id: new Date().getTime(), name: '', startDate: '', endDate: '', github: '', description: '' },
    ]);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const handleInputChange = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const handleGenerateExample = async (index) => {
    setLoading(true);
    try {
      const name = projects[index].name.trim();
      if (!name) {
        ToastMess({ type: 'error', text1: 'Vui lòng nhập tên dự án!' });
        return;
      }

      const prompt = `
        You are a professional technical writer.
        Write a detailed but concise **Vietnamese** description for the project "${name}" using bullet points only.
        Do not include any headings or titles.
        Return only the bullet points in Vietnamese.
        `;

      const response = await geminiService(prompt);
      handleInputChange(index, 'description', response);
    } catch (error) {
      console.error('Error generating example:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (noProjects) {
      dispatch(addProject([]));
      navigation.navigate('ResumeTemplates');
      return;
    }

    for (const project of projects) {
      if (!project.name || !project.description || !project.startDate || !project.endDate || !project.github) {
        ToastMess({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin.' });
        return;
      }

      // Validate endDate > startDate
      const startDate = new Date(project.startDate.split('/').reverse().join('-'));
      const endDate = new Date(project.endDate.split('/').reverse().join('-'));
      if (!isValidProjectDates(startDate, endDate)) {
        ToastMess({ type: 'error', text1: 'Ngày kết thúc phải sau ngày bắt đầu.' });
        return;
      }
    }

    dispatch(addProject(projects));
    navigation.navigate('ResumeTemplates');
  };

  return (
    <View style={StyleShare.container}>
      <UIHeader
        leftIcon={'arrow-back'}
        title={'Dự án đã tham gia'}
        handleLeftIcon={() => navigation.goBack()}
      />
      <ScrollView>
        {/* Checkbox for no projects */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={noProjects ? 'checked' : 'unchecked'}
            onPress={() => {
              setNoProjects(!noProjects);
              if (!noProjects) {
                setProjects([]);
              } else {
                setProjects([
                  {
                    id: new Date().getTime(),
                    name: '',
                    startDate: '',
                    endDate: '',
                    github: '',
                    description: '',
                  },
                ]);
              }
            }}
            color={mainColor}
            uncheckedColor={mainColor}
          />
          <Text style={styles.checkboxLabel}>Tôi chưa có project nào cả</Text>
        </View>

        {/* Only show form when noProjects is false */}
        {!noProjects &&
          projects.map((project, index) => (
            <View key={project.id} style={StyleShare.manageJob}>
              {/* Date Picker Modals for each project */}
              <DateTimePickerModal
                isVisible={datePickerVisible[`${index}_startDate`] || false}
                mode="date"
                onConfirm={(date) => handleDateConfirm(index, 'startDate', date)}
                onCancel={() => hideDatePicker(index, 'startDate')}
              />
              <DateTimePickerModal
                isVisible={datePickerVisible[`${index}_endDate`] || false}
                mode="date"
                onConfirm={(date) => handleDateConfirm(index, 'endDate', date)}
                onCancel={() => hideDatePicker(index, 'endDate')}
              />

              <View style={StyleShare.flexBetween}>
                <Text style={styles.textInput}>
                  Tên dự án <Text style={{ color: 'red' }}>*</Text>
                </Text>
                {index > 0 && (
                  <TouchableOpacity onPress={() => handleDeleteProject(project.id)}>
                    <Icon name="close" size={22} color={'red'} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.introduceInput}
                value={project.name}
                onChangeText={(text) => handleInputChange(index, 'name', text)}
              />

              <View style={StyleShare.flexBetween}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.textInput}>
                    Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={() => showDatePicker(index, 'startDate')}>
                    <TextInput
                      style={styles.introduceInput}
                      placeholder="dd/mm/yyyy"
                      value={project.startDate}
                      editable={false} // Prevent manual input
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={styles.textInput}>
                    Ngày kết thúc <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={() => showDatePicker(index, 'endDate')}>
                    <TextInput
                      style={styles.introduceInput}
                      placeholder="dd/mm/yyyy"
                      value={project.endDate}
                      editable={false} // Prevent manual input
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.textInput}>
                Github <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                style={styles.introduceInput}
                value={project.github}
                keyboardType="url"
                autoCapitalize="none"
                onChangeText={(text) => handleInputChange(index, 'github', text)}
              />

              <View style={StyleShare.flexBetween}>
                <Text style={styles.textInput}>
                  Mô tả ngắn gọn về dự án <Text style={{ color: 'red' }}>*</Text>
                </Text>
                {loading ? (
                  <Text style={{ color: 'grey', fontWeight: 'bold' }}>Đang tải...</Text>
                ) : (
                  <TouchableOpacity onPress={() => handleGenerateExample(index)}>
                    <Text style={{ color: 'grey', fontWeight: 'bold' }}>Gợi ý với AI</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[styles.introduceInput, { height: 200, textAlignVertical: 'top' }]}
                value={project.description}
                multiline
                numberOfLines={12}
                onChangeText={(text) => {
                  if (text.trim() === '') {
                    handleInputChange(index, 'description', '');
                    return;
                  }
                  let formattedText = text
                    .split('\n')
                    .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
                    .join('\n');
                  handleInputChange(index, 'description', formattedText);
                }}
              />
            </View>
          ))}

        {!noProjects && (
          <TouchableOpacity
            style={[StyleShare.flexCenter, styles.saveButton, { backgroundColor: orange }]}
            onPress={handleAddProject}
          >
            <Text style={[StyleShare.titleText16, { color: white }]}>Thêm mới dự án</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TouchableOpacity style={[StyleShare.flexCenter, styles.saveButton]} onPress={handleSave}>
        <Text style={[StyleShare.titleText16, { color: white }]}>Tiếp tục</Text>
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
  saveButton: {
    backgroundColor: mainColor,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: white,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: textColor,
    fontSize: 16,
  },
});