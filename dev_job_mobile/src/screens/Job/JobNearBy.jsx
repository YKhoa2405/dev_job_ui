import { View, StyleSheet, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import Slider from '@react-native-community/slider';
import { mainColor, grey, orange, white } from "../../assets/themes/Color";
import { Avatar, Chip } from "react-native-paper";
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
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
    const [isJobDetailModalVisible, setJobDetailModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [level, setLevel] = useState('');
    const [salary, setSalary] = useState('');
    const [jobType, setJobType] = useState('');
    // State for map mode
    const [mapMode, setMapMode] = useState('standard');

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const toggleJobDetailModal = () => {
        setJobDetailModalVisible(!isJobDetailModalVisible);
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
    }, [distance, level, salary, jobType]); // Include filters in dependencies

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

    // Count selected filters
    const countSelectedFilters = () => {
        return [level, salary, jobType].filter(item => item !== '').length;
    };

    const applyFilters = () => {
        if (countSelectedFilters() !== 2) {
            ToastMess({ type: 'error', text1: 'Vui lòng chọn đúng 2 bộ lọc' });
            return;
        }
        setModalVisible(false);
        // Filters are applied via useEffect, no need for client-side filtering
    };

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback key={item._id} onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}>
            <View style={styles.jobItemContainer}>
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
                    {item?.level?.map((level, index) => (
                        <Chip key={index} style={StyleShare.chip}>
                            {level || 'N/A'}
                        </Chip>
                    ))}
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
                    setSelectedJob(job);
                    setJobDetailModalVisible(true);
                }}
            >
                <View style={[
                    styles.markerContainer,
                    job.isUrgent && styles.urgentMarker
                ]}>
                    <Icon
                        name="briefcase"
                        size={20}
                    />
                    {job.isUrgent && (
                        <View style={styles.urgentBadge}>
                            <Icon name="flame" size={8} color={white} />
                        </View>
                    )}
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
            {/* Filter Modal */}
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
                        <TouchableOpacity onPress={toggleModal}>
                            <Icon name="close" size={26} color={'red'} />
                        </TouchableOpacity>
                    </View>
                    <Text style={StyleShare.titleText16}>Hiển thị bản đồ</Text>
                    <View style={styles.mapControlsRow}>
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                mapMode === 'standard' && styles.activeControlButton
                            ]}
                            onPress={() => setMapMode('standard')}
                        >
                            <Text style={[
                                styles.controlButtonText,
                                mapMode === 'standard' && styles.activeControlButtonText
                            ]}>
                                Tiêu chuẩn
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                mapMode === 'satellite' && styles.activeControlButton
                            ]}
                            onPress={() => setMapMode('satellite')}
                        >
                            <Text style={[
                                styles.controlButtonText,
                                mapMode === 'satellite' && styles.activeControlButtonText
                            ]}>
                                Vệ tinh
                            </Text>
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
                    <Text style={{ color: mainColor, marginBottom: 10 }}>
                        Đã chọn: {countSelectedFilters()}/2
                    </Text>
                    <Button
                        title={'Áp dụng'}
                        backgroundColor={countSelectedFilters() === 2 ? mainColor : grey}
                        textColor={white}
                        onPress={applyFilters}
                        disabled={countSelectedFilters() !== 2}
                    />
                </View>
            </Modal>

            {/* Job Detail Modal */}
            <Modal
                isVisible={isJobDetailModalVisible}
                onBackdropPress={toggleJobDetailModal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                style={StyleShare.modalStyle}
            >
                <View style={StyleShare.modalContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={toggleJobDetailModal}>
                            <Icon name="close" size={26} color="red" />
                        </TouchableOpacity>
                    </View>
                    {selectedJob && (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar.Image
                                    source={{ uri: selectedJob.companyId.avatar }}
                                    size={50}
                                    style={{ backgroundColor: 'white', marginRight: 10 }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={StyleShare.titleText16}>{selectedJob?.name || 'Chi tiết công việc'}</Text>
                                    <Text>{selectedJob.companyId.name}</Text>
                                </View>
                            </View>
                            <View style={[StyleShare.technologyContainer, { marginVertical: 10 }]}>
                                {selectedJob?.level?.map((level, index) => (
                                    <Chip key={index} style={StyleShare.chip}>
                                        {level || 'N/A'}
                                    </Chip>
                                ))}
                                <Chip
                                    style={[StyleShare.chip, { backgroundColor: orange, color: white }]}>
                                    <Text style={{ color: white, fontSize: 12 }}>{selectedJob.distance?.toFixed(2) || 'N/A'} km</Text>
                                </Chip>
                                {selectedJob.isUrgent && (
                                    <Chip
                                        style={[StyleShare.chip, { backgroundColor: '#FF4500', marginTop: 10 }]}
                                        icon={() => <Icon name="flame" size={16} color={white} />}
                                    >
                                        <Text style={{ color: white, fontSize: 12 }}>Gấp</Text>
                                    </Chip>
                                )}
                            </View>
                            <Button
                                title={'Xem chi tiết'}
                                backgroundColor={mainColor}
                                textColor={white}
                                onPress={() => {
                                    toggleJobDetailModal();
                                    navigation.navigate('JobDetail', { jobId: selectedJob._id });
                                }}
                            />
                        </View>
                    )}
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
                    <Mapbox.MapView
                        style={StyleShare.container}
                        zoomEnabled
                        pitchEnabled
                        rotateEnabled
                        styleURL={
                            mapMode === 'satellite' 
                                ? Mapbox.StyleURL.Satellite 
                                : Mapbox.StyleURL.Street
                        }
                    >
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
                                        fillColor: "rgba(255, 0, 0, 0.5)",
                                        fillOpacity: 0.3,
                                    }}
                                />
                                <Mapbox.LineLayer
                                    id="circleLine"
                                    style={{
                                        lineColor: "rgba(255, 0, 0, 0.5)",
                                        lineWidth: 2,
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
                        renderItem={renderItem}
                        data={jobs}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item._id}
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
        borderWidth: 1,
        borderColor: '#ddd',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: white,
        borderRadius: 20,
        width: 36,
        height: 36,
        borderWidth: 2,
        borderColor: mainColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    urgentMarker: {
        borderColor: '#FF4500',
    },
    urgentBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4500',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    controlButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: mainColor,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    activeControlButton: {
        backgroundColor: mainColor,
        borderColor: mainColor,
    },
    controlButtonText: {
        color: mainColor,
        fontSize: 14,
        fontWeight: 'bold',
    },
    activeControlButtonText: {
        color: white,
    },
});