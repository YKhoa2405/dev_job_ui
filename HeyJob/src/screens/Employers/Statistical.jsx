import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator, ScrollView, Image } from "react-native";
import styleShare from "../../assets/theme/style";
import UIHeader from "../../components/UIHeader";
import { LineChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../config/API";
import { bgButton1, bgButton2, orange } from "../../assets/theme/color";
import { Picker } from "@react-native-picker/picker";
import { DataTable } from 'react-native-paper';
import { TouchableOpacity } from "react-native";

export default function Statistical({ navigation }) {
    const [statistics, setStatistics] = useState({
        active_jobs: 0,
        expired_jobs: 0,
        total_spent_on_services: 0,
        applications_per_month: [],
    });
    const [jobApplicationsCounts, setJobApplicationsCounts] = useState([]);
    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [error403, setError403] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatic();
    }, []);

    useEffect(() => {
        fetchJobApplicationStatic();
    }, [selectedYear, selectedMonth]);

    const fetchStatic = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['statistics']);
            setStatistics(res.data);
            setError403(false);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 403) {
                setError403(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchJobApplicationStatic = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access-token");
            const res = await authApi(token).get(endpoints['job_application_statis'], {
                params: {
                    year: selectedYear,
                    month: selectedMonth,
                }
            });
            setError403(false);
            setJobApplicationsCounts(res.data.job_applications_counts);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 403) {
                setError403(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderError403 = () => (
        <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Image source={require("../../assets/images/save.png")} style={styleShare.imageNullData} />
            <Text style={styleShare.textMainOption}>Kích hoạt báo cáo thống kê</Text>
            <Text style={{ padding: 20, textAlign: 'center' }}>
                Tính năng này dành cho khách hàng có dịch vụ mua đang chạy hoặc còn hạn kích hoạt.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shopping')}><Text style={{ color: bgButton1 }}>Mua dịch vụ</Text></TouchableOpacity>
        </View>
    );

    const lineData = {
        labels: statistics.applications_per_month.map(entry => (new Date(entry.month).getMonth() + 1).toString()),
        datasets: [
            {
                data: statistics.applications_per_month.map(entry => entry.applications_count),
                strokeWidth: 2,
                color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
            },
        ],
    };

    return (
        <View style={styleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={'Thống kê tuyển dụng'}
            />
            {loading ? (
                <ActivityIndicator style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} size="large" color='orange' />
            ) : error403 ? (
                renderError403() // Fix: Call renderError403()
            ) : (
                <ScrollView>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={styleShare.textMainOption}>Thống kê tin tuyển dụng</Text>
                        <PieChart
                            data={[
                                {
                                    name: "Đang hoạt động",
                                    population: statistics.active_jobs,
                                    color: bgButton1,
                                    legendFontSize: 14,
                                },
                                {
                                    name: "Hết hạn",
                                    population: statistics.expired_jobs,
                                    color: bgButton2,
                                    legendFontSize: 14,
                                },
                            ]}
                            width={Dimensions.get("window").width - 40}
                            height={200}
                            chartConfig={{
                                backgroundColor: "#fff",
                                backgroundGradientFrom: "#fb8c00",
                                backgroundGradientTo: "#ffa726",
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            absolute
                        />
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Số lượng bài đăng còn hoạt động và hết hạn
                        </Text>
                    </View>

                    <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                        <Text style={styleShare.textMainOption}>Thông kê ứng tuyển</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Picker
                                selectedValue={selectedYear}
                                onValueChange={setSelectedYear}
                                style={{ flex: 1 }}
                            >
                                {/* Picker items for years */}
                                {[2023, 2024, 2025, 2026, 2027].map((year) => (
                                    <Picker.Item key={year} label={`Năm ${year}`} value={year} />
                                ))}
                            </Picker>

                            <Picker
                                selectedValue={selectedMonth}
                                onValueChange={setSelectedMonth}
                                style={{ flex: 1 }}
                            >
                                {/* Picker items for months */}
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <Picker.Item key={month} label={`Tháng ${month}`} value={month} />
                                ))}
                            </Picker>
                        </View>

                        {/* <LineChart
                            data={lineData}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: "#1E2923",
                                backgroundGradientFrom: "#1E2923",
                                backgroundGradientTo: "#08130D",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                            }}
                            style={{
                                marginBottom: 8,
                                borderRadius: 16,
                            }}
                        />
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {`Tổng đơn ứng tuyển năm ${selectedYear}`}
                        </Text> */}

                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>Tin tuyển dụng</DataTable.Title>
                                <DataTable.Title numeric>Số đơn ứng tuyển</DataTable.Title>
                            </DataTable.Header>

                            {jobApplicationsCounts.map((job, index) => (
                                <DataTable.Row key={index}>
                                    <DataTable.Cell>{job.title}</DataTable.Cell>
                                    <DataTable.Cell numeric>{job.applications_count}</DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
