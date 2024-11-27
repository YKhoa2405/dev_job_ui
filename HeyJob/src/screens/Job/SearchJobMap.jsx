import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text, FlatList, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import UIHeader from "../../components/UIHeader";
import styleShare from "../../assets/theme/style";
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import Slider from '@react-native-community/slider';
import { TouchableOpacity } from "react-native";
import { bgButton1, grey, orange, white } from "../../assets/theme/color";
import { Avatar, Chip } from "react-native-paper";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";


export default function SearchJobMap({ navigation }) {
    const [latitude, setLatitude] = useState(0)
    const [longitude, setLongitude] = useState(0)
    const [distance, setDistance] = useState(5);
    const [loading, setLoading] = useState(true)
    const [jobs, setJobs] = useState([])
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                navigation.goBack()
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});

            const { latitude, longitude } = currentLocation.coords;
            setLatitude(latitude)
            setLongitude(longitude)
            fetchJobNearby(latitude, longitude)
        })();
    }, []);

    useEffect(() => {
        if (latitude && longitude) {
            fetchJobNearby(latitude, longitude);
        }
    }, [distance]);

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => value * Math.PI / 180;
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    const fetchJobNearby = async (latitude, longitude) => {
        try {
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['job_nearby'](latitude, longitude, distance));
            const jobsWithDistance = res.data.map(job => {
                const distanceToJob = haversineDistance(latitude, longitude, job.latitude, job.longitude);
                return { ...job, distance: distanceToJob };
            });
            setJobs(jobsWithDistance)
            console.log(setJobs)

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />;
    }


    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback key={item.id} onPress={() => { navigation.navigate('JobDetail', { jobId: item.id }) }}>
            <View style={styles.jobItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Image source={{ uri: item.employer.avatar }} size={35} style={{ backgroundColor: 'white', marginRight: 5 }} />
                    <View>
                        <Text style={styleShare.titleJobAndName}>{item.title}</Text>
                        <Text style={{ marginTop: 5 }}>{item.employer.employer.company_name} </Text>
                    </View>
                </View>
                <View style={styleShare.technologyContainer}>
                    <Chip style={styleShare.chip}>{`${item.salary} VND`}</Chip>
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
        <View style={styleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                rightIcon={"ellipsis-horizontal"}
                title={'Việc làm gần bạn'}
                handleLeftIcon={() => navigation.goBack()}
            />
            <View style={styles.sliderContainer}>
                <Text style={{ color: bgButton1, fontWeight: '500', backgroundColor: 'white' }}>Phạm vi: {distance} km</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={distance}
                    onValueChange={(value) => setDistance(value)}
                    minimumTrackTintColor={bgButton1}
                    maximumTrackTintColor={bgButton1}
                    thumbTintColor={bgButton1}
                />
                {/* <TouchableOpacity style={{ backgroundColor: bgButton1, paddingHorizontal: 15, paddingVertical: 4, borderRadius: 10 }}>
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
                {jobs.map((job) => (
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
                ))}
                {latitude !== null && longitude !== null && (
                    <>
                        <Circle
                            center={{ latitude: latitude, longitude: longitude }}
                            radius={distance * 1000} // Radius in meters
                            strokeColor="rgba(255, 0, 0, 0.5)" // Màu viền vòng tròn
                            fillColor="rgba(255, 0, 0, 0.1)" // Màu nền vòng tròn
                        />
                    </>
                )}

            </MapView>
            <View style={styles.containerListJob}>
                <View style={styleShare.flexBetween}>
                    <View style={styleShare.flexCenter}>
                        <Text style={{ color: bgButton1, fontWeight: '500', marginRight: 5 }}>{jobs.length}</Text>
                        <Text>việc làm trong khu vực</Text>
                    </View>
                </View>
                <FlatList
                    renderItem={renderItem}
                    data={jobs}
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


