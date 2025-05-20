import { View, StyleSheet, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import Slider from '@react-native-community/slider';
import { mainColor, grey, orange, white } from "../../assets/themes/Color";
import { Avatar, Chip } from "react-native-paper";
import * as Location from 'expo-location';
import { useEffect, useState, useRef } from "react"; // Added useRef
import Loading from "../../components/Loading";
import API, { endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/Ionicons";
import Dropdown from "../../components/Dropdown";
import Button from "../../components/Button";
import Mapbox from '@rnmapbox/maps';
import * as turf from '@turf/turf';

// Replace with your Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoibnlraG9hMjQwNSIsImEiOiJjbWF3bGNwMTcwY3N0MmtzZTBscWJqN2lrIn0.Oe8YNd6rmHEyvU4nVMhocg');

export default function JobNearBy({ navigation }) {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [distance, setDistance] = useState(5);
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null); // State for selected job
    const flatListRef = useRef(null); // Ref for FlatList

    const [level, setLevel] = useState('');
    const [salary, setSalary] = useState('');
    const [jobType, setJobType] = useState('');

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

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

    // Generate GeoJSON circle for radius
    const circle = latitude && longitude ? turf.circle(
        [longitude, latitude],
        distance,
        { steps: 64, units: 'kilometers' }
    ) : null;

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                ToastMess({ type: 'error', text1: 'Không thể truy cập vị trí' });
                navigation.goBack();
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            fetchListJobNearby(latitude, longitude);
        })();
    }, []);

    useEffect(() => {
        if (latitude && longitude) {
            fetchListJobNearby(latitude, longitude);
        }
    }, [distance]);

    const fetchListJobNearby = async (latitude, longitude) => {
        setLoading(true);
        try {
            const params = {
                latitude,
                longitude,
                radius: distance,
                ...(level && { level }),
                ...(salary && { salary }),
                ...(jobType && { jobType }),
            };
            const res = await API.get(endpoints['jobsNearBy'], { params });
            const result = res.data.data.result;
            setJobs(result);
        } catch (error) {
            ToastMess({ type: 'error', text1: 'Lỗi khi tải danh sách công việc' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let jobsfilter = [...jobs];
        if (salary) {
            jobsfilter = jobsfilter.filter((job) => job.salary.includes(salary));
        }
        if (level) {
            jobsfilter = jobsfilter.filter((job) => job.level === level);
        }
        if (jobType) {
            jobsfilter = jobsfilter.filter((job) => job.jobType === jobType);
        }
        setJobs(jobsfilter);
        setModalVisible(false);
    };

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback key={item._id} onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}>
            <View style={[
                styles.jobItemContainer,
                selectedJobId === item._id && styles.selectedJobItem // Apply bold border if selected
            ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image
                        source={{ uri: item.companyId.avatar }}
                        size={50}
                        style={{ backgroundColor: 'white', marginRight: 5 }}
                    />
                    <View>
                        <Text style={StyleShare.titleText16}>{item.name}</Text>
                        <Text style={{ marginTop: 5 }}>{item.companyId.name}</Text>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{item.level}</Chip>
                    {item.distance !== null && (
                        <Chip style={{ alignSelf: 'flex-start', backgroundColor: orange, marginTop: 10 }}>
                            <Text style={{ color: 'white' }}>{item.distance.toFixed(2)} km</Text>
                        </Chip>
                    )}
                    {item.isUrgent && (
                        <Chip
                            style={[StyleShare.chip, { backgroundColor: '#FF4500', marginLeft: 5 }]}
                            icon={() => <Icon name="flame" size={16} color={white} />}
                        >
                            <Text style={{ color: white, fontSize: 12 }}>Gấp</Text>
                        </Chip>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    const renderMarkers = () => {
        return jobs.map((job) => (
            <Mapbox.PointAnnotation
                key={job._id}
                id={job._id}
                coordinate={job.geoLocation.coordinates}
                onSelected={() => {
                    setSelectedJobId(job._id); // Set selected job ID
                    const index = jobs.findIndex(item => item._id === job._id); // Find index of selected job
                    if (index !== -1 && flatListRef.current) {
                        flatListRef.current.scrollToIndex({
                            index,
                            animated: true,
                            viewPosition: 0.5, // Center the item in the view
                        });
                    }
                }}
            >
                <View style={styles.markerContainer}>
                    <Icon name="briefcase" size={24} color={mainColor} />
                </View>
            </Mapbox.PointAnnotation>
        ));
    };

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"options"}
                title={'Việc làm gần bạn'}
                handleLeftIcon={() => navigation.goBack()}
                handleRightIcon={() => setModalVisible(true)}
            />
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
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
                    <Button
                        title={'Áp dụng'}
                        backgroundColor={mainColor}
                        textColor={white}
                        onPress={() => applyFilters()}
                    />
                </View>
            </Modal>
            <View style={styles.sliderContainer}>
                <Text style={{ color: mainColor, fontWeight: '500', backgroundColor: 'white' }}>
                    Phạm vi: {distance} km
                </Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={distance}
                    onValueChange={(value) => setDistance(value)}
                    minimumTrackTintColor={mainColor}
                    maximumTrackTintColor={mainColor}
                    thumbTintColor={mainColor}
                />
            </View>
            <View style={StyleShare.container}>
                {latitude && longitude ? (
                    <Mapbox.MapView style={StyleShare.container} zoomEnabled pitchEnabled rotateEnabled>
                        <Mapbox.Camera
                            zoomLevel={12}
                            centerCoordinate={[longitude, latitude]}
                            animationMode="flyTo"
                            animationDuration={1000}
                        />
                        <Mapbox.UserLocation visible />
                        {renderMarkers()}
                        {circle && (
                            <Mapbox.ShapeSource id="circleSource" shape={circle}>
                                <Mapbox.FillLayer
                                    id="circleFill"
                                    style={{
                                        fillColor: "rgba(255, 0, 0, 0.5)", fillOpacity: 0.3
                                    }}
                                />
                                <Mapbox.LineLayer
                                    id="circleLine"
                                    style={{
                                        lineColor: "rgba(255, 0, 0, 0.5)", lineWidth: 2
                                    }}
                                />
                            </Mapbox.ShapeSource>
                        )}
                    </Mapbox.MapView>
                ) : (
                    <Loading />
                )}
            </View>

            {loading ? (
                <View style={styles.containerListJob}>
                    <Loading />
                </View>
            ) : (
                <View style={styles.containerListJob}>
                    <View style={StyleShare.flexBetween}>
                        <View style={StyleShare.flexCenter}>
                            <Text style={{ color: mainColor, fontWeight: '500', marginRight: 5 }}>{jobs?.length}</Text>
                            <Text>việc làm trong khu vực</Text>
                        </View>
                    </View>
                    <FlatList
                        ref={flatListRef} // Attach ref to FlatList
                        renderItem={renderItem}
                        data={jobs}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item._id}
                        getItemLayout={(data, index) => ({
                            length: 300, // Approximate width of each item (adjust based on your jobItemContainer width)
                            offset: 300 * index,
                            index,
                        })}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    containerListJob: {
        height: 160,
        backgroundColor: grey,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 5,
    },
    sliderContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        backgroundColor: 'white',
    },
    slider: {
        width: 280,
    },
    jobItemContainer: {
        backgroundColor: white,
        marginRight: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10,
        elevation: 2,
        borderWidth: 1, // Default border
        borderColor: '#ddd', // Default border color
    },
    selectedJobItem: {
        borderWidth: 3, // Bold border for selected item
        borderColor: mainColor, // Use mainColor for the bold border
    },
    markerContainer: {
        alignItems: 'center',
        backgroundColor: white,
        borderRadius: 5,
        padding: 5,
        borderWidth: 1,
        borderColor: mainColor,
    },
});