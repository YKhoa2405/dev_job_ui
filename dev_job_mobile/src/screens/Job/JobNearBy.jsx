import { View, StyleSheet, Dimensions, Text, FlatList, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import StyleShare from "../../assets/themes/StyleShare";
import UIHeader from "../../components/UIHeader";
import Slider from '@react-native-community/slider';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { mainColor, grey, orange, white } from "../../assets/themes/Color";
import { Avatar, Chip } from "react-native-paper";
import moment from "moment";

export default function JobNearBy() {
    const latitude = 11111
    const longitude = 11111

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
            <View style={styles.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image source={{ uri: item.employer.avatar }} size={35} style={{ backgroundColor: 'white', marginRight: 5 }} />
                    <View>
                        <Text style={StyleShare.titleText16}>{item.title}</Text>
                        <Text style={{ marginTop: 5 }}>{item.employer.employer.company_name} </Text>
                    </View>
                </View>
                <View style={StyleShare.technologyContainer}>
                    <Chip style={StyleShare.chip}>{`${item.salary} VND`}</Chip>
                    <Chip style={{
                        alignSelf: 'flex-start',
                        backgroundColor: orange,
                        marginTop: 10,
                    }}><Text style={{ color: 'white' }}>{item.distance.toFixed(2)} km</Text></Chip>

                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Việc làm gần bạn'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <View style={styles.sliderContainer}>
                <Text style={{ color: mainColor, fontWeight: '500', backgroundColor: 'white' }}>Phạm vi: 10 km</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={5}
                    onValueChange={(value) => setDistance(value)}
                    minimumTrackTintColor={mainColor}
                    maximumTrackTintColor={mainColor}
                    thumbTintColor={mainColor}
                />
                {/* <TouchableOpacity style={{ backgroundColor: mainColor, paddingHorizontal: 15, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: white }}>Tìm</Text>
                </TouchableOpacity> */}
            </View>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                    }}
                    title="Vị trí của bạn"
                    description="vị trí hiện tại của bạn"
                />
                {/* {jobs.map((job) => (
                    <Marker
                        key={job.id}
                        coordinate={{
                            latitude: job.latitude,
                            longitude: job.longitude,
                        }}
                        icon={require("../../assets/images/marker_job.png")}
                        title={job.title}
                        description={job.employer.company_name}
                    />
                ))} */}
                {latitude !== null && longitude !== null && (
                    <>
                        <Circle
                            center={{ latitude: latitude, longitude: longitude }}
                            radius={5 * 1000} // Radius in meters
                            strokeColor="rgba(255, 0, 0, 0.5)" // Màu viền vòng tròn
                            fillColor="rgba(255, 0, 0, 0.1)" // Màu nền vòng tròn
                        />
                    </>
                )}

            </MapView>
            <View style={styles.containerListJob}>
                <View style={StyleShare.flexBetween}>
                    <View style={StyleShare.flexCenter}>
                        <Text style={{ color: mainColor, fontWeight: '500', marginRight: 5 }}>10</Text>
                        <Text>việc làm trong khu vực</Text>
                    </View>
                </View>
                <FlatList
                    renderItem={renderItem}
                    // data={jobs}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    containerListJob: {
        height: 150,
        backgroundColor: grey,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 5
    },
    sliderContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        backgroundColor: 'white'
    },
    slider: {
        width: 280
    },
    jobItemContainer: {
        backgroundColor: white,
        marginRight: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 10,
        borderRadius: 10
    }
})