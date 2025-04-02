import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/Ionicons';
import UIHeader from '../../components/UIHeader'; // Giả định đây là component có sẵn
import StyleShare from '../../assets/themes/StyleShare';
import { mainColor, orange, textColor, white } from '../../assets/themes/Color';
import Button from '../../components/Button';

// Mock data với URL ảnh
const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    skills: ["React", "JavaScript", "CSS"],
    salary: "$60k - $80k",
    location: "Remote",
    image: "https://via.placeholder.com/400x300/130160/FCA34D?text=Frontend+Dev",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "CodeWorks",
    skills: ["Python", "Django", "SQL"],
    salary: "$70k - $90k",
    location: "Hanoi",
    image: "https://via.placeholder.com/400x300/130160/FCA34D?text=Backend+Dev",
  },
  {
    id: 3,
    title: "DevOps Engineer",
    company: "Cloudify",
    skills: ["AWS", "Docker", "CI/CD"],
    salary: "$80k - $100k",
    location: "Ho Chi Minh City",
    image: "https://via.placeholder.com/400x300/130160/FCA34D?text=DevOps",
  },
];

const JobSwipe = ({ navigation }) => { // Thêm navigation prop để UIHeader hoạt động
  const [swipedAll, setSwipedAll] = useState(false);

  const onSwipeLeft = (cardIndex) => {
    console.log(`Skipped: ${mockJobs[cardIndex].title}`);
  };

  const onSwipeRight = (cardIndex) => {
    console.log(`Liked: ${mockJobs[cardIndex].title}`);
  };

  const onSwipedAll = () => {
    setSwipedAll(true);
  };

  // Component thẻ công việc
  const renderCard = (job) => {
    return (
      <View style={styles.card}>
        {/* Phần hình ảnh */}
        <Image
          source={{ uri: job.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Phần thông tin */}
        <View style={styles.infoContainer}>
          <Text style={StyleShare.titleText20}>{job.title}</Text>
          <Text style={StyleShare.titleText16}>{job.company}</Text>
          <View style={styles.infoRow}>
            <Icon name="code-outline" size={20} color={mainColor} />
            <Text style={styles.details}>Kỹ năng: {job.skills.join(', ')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="cash-outline" size={20} color={mainColor} />
            <Text style={styles.details}>Mức lương: {job.salary}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="checkmark-circle-sharp" size={20} color={mainColor} />
            <Text style={styles.details}>Kinh nghiệm: {job.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={20} color={mainColor} />
            <Text style={styles.details}>Thành phố: {job.location}</Text>
          </View>
          {/* Nút chi tiết */}
          <Button title="Xem chi tiết" onPress={() => navigation.navigate('JobDetail', { jobId: job?._id })}
           backgroundColor={orange}
           textColor={white} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UIHeader
        title="Swipe Jobs"
        leftIcon="arrow-back"
        handleLeftIcon={() => navigation.goBack()}
      />
      <View style={styles.swiperContainer}>
        {swipedAll ? (
          <View style={styles.noJobsContainer}>
            <Icon name="sad-outline" size={40} color={mainColor} />
            <Text style={styles.noJobsText}>No more jobs to swipe!</Text>
          </View>
        ) : (
          <Swiper
            cards={mockJobs}
            renderCard={renderCard}
            onSwipedLeft={onSwipeLeft}
            onSwipedRight={onSwipeRight}
            onSwipedAll={onSwipedAll}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            cardVerticalMargin={10}
            cardHorizontalMargin={10}
            animateCardOpacity
            animateOverlayLabelsOpacity
            swipeBackCard
            overlayLabels={{
              left: {
                title: 'SKIP',
                style: {
                  label: {
                    backgroundColor: '#ff7675',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#fff',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 20,
                    marginLeft: -20,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: orange,
                    color: mainColor,
                    fontSize: 24,
                    fontWeight: 'bold',
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#fff',
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 20,
                    marginLeft: 20,
                  },
                },
              },
            }}
          />
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.8, // Giảm chiều cao để chừa chỗ cho header
    backgroundColor: '#fff', // Thẻ trắng
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '55%', // Hình ảnh chiếm 55% chiều cao thẻ
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  infoContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff', // Nền trắng
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    color: textColor, // Xám đậm
    marginLeft: 8,
    flexShrink: 1,
  },
  noJobsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noJobsText: {
    fontSize: 20,
    color: mainColor, // Xanh tím đậm
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default JobSwipe;