import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from "react-native";
import UIHeader from "../../components/UIHeader";
import StyleShare from "../../assets/themes/StyleShare";
import { PieChart } from "react-native-chart-kit";
import { mainColor, orange, white } from "../../assets/themes/Color";
import { DataTable } from 'react-native-paper';
import API, { endpoints } from "../../assets/config/API";
import { ToastMess } from "../../components/ToastMess";

const screenWidth = Dimensions.get("window").width;

export default function CompanyStatistical({ navigation, route }) {
    const { companyId } = route.params;

    // Quản lý state

    const [pageSkills, setPageSkills] = useState(0);
    const [itemsPerPageSkills] = useState(4);
    const [pageApplications, setPageApplications] = useState(0);
    const [itemsPerPageApplications] = useState(4);

    const [applicationsData, setApplicationsData] = useState([]);
    const [salaryData, setSalaryData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [skillsData, setSkillsData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gọi API với bộ lọc thời gian
    const fetchData = async () => {
        setLoading(true);
        const companyParams = {
            companyId
        };


        try {
            const [applicationsResponse, salaryResponse, statusResponse, skillsResponse] = await Promise.all([
                API.get(endpoints['statistic']('applications-per-job'), { params: companyParams }),
                API.get(endpoints['statistic']('expected-salary'), { params: companyParams }),
                API.get(endpoints['statistic']('application-status'), { params: companyParams }),
                API.get(endpoints['statistic']('candidate-skills'), { params: companyParams }),
            ]);

            // Xuất lý dữ liệu

            // Xử lý dữ liệu an toàn
            setApplicationsData(applicationsResponse.data.data || []);
            setSalaryData(salaryResponse.data.data || []);
            setStatusData(statusResponse.data.data || []);
            setSkillsData(skillsResponse.data.data || []);

        } catch (error) {
            ToastMess({ type: 'error', text1: error.response.data.message });

            setApplicationsData([]);
            setSalaryData([]);
            setStatusData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const mockCandidateSkills = [
        { skill: "JavaScript", count: 40 },
        { skill: "Python", count: 25 },
        { skill: "SQL", count: 15 },
        { skill: "React", count: 20 },
    ];

    // Dữ liệu phân trang
    const paginatedApplications = applicationsData.slice(
        pageApplications * itemsPerPageApplications,
        (pageApplications + 1) * itemsPerPageApplications
    );

    const paginatedSkills = skillsData.slice(
        pageSkills * itemsPerPageSkills,
        (pageSkills + 1) * itemsPerPageSkills
    );

    const statusChartData = statusData.map(item => ({
        name: item.status,
        population: item.count,
        color: getColorForStatus(item.status),
        legendFontColor: '#333',
        legendFontSize: 12,
    }));

    const salaryChartData = salaryData.map(item => ({
        name: `${item.title}`,
        population: item.percentage,
        color: getColorForSalary(item.title),
        legendFontColor: '#333',
        legendFontSize: 12,
    }));

    // Cấu hình biểu đồ
    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
        propsForLabels: { fontSize: 12 },
    };

    // Render item cho FlatList
    const renderSection = ({ item }) => (
        <View style={styles.section}>
            <Text style={[StyleShare.titleText16, { marginBottom: 10 }]}>{item.title}</Text>
            {item.content}
        </View>
    );

    // Danh sách section
    const sections = [
        {
            title: "Tổng đơn ứng tuyển cho từng tin tuyển dụng",
            content: paginatedApplications.length > 0 ? (
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Tin tuyển dụng</DataTable.Title>
                        <DataTable.Title numeric>Số lượng</DataTable.Title>
                    </DataTable.Header>
                    {paginatedApplications.map((item, index) => (
                        <DataTable.Row key={index}>
                            <DataTable.Cell>{item.jobName}</DataTable.Cell>
                            <DataTable.Cell numeric>{item.applicationCount}</DataTable.Cell>
                        </DataTable.Row>
                    ))}
                    <DataTable.Pagination
                        page={pageApplications}
                        numberOfPages={Math.ceil(applicationsData.length / itemsPerPageApplications)}
                        onPageChange={(newPage) => setPageApplications(newPage)}
                        label={`${pageApplications * itemsPerPageApplications + 1}-${Math.min((pageApplications + 1) * itemsPerPageApplications, applicationsData.length)} of ${applicationsData.length}`}
                    />
                </DataTable>
            ) : (
                <Text>Không có dữ liệu</Text>
            ),
        },
        {
            title: "Thống kê trạng thái ứng tuyển",
            content: statusChartData.length > 0 ? (
                <PieChart
                    data={statusChartData}
                    width={screenWidth - 60}
                    height={150}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute={false}
                />
            ) : (
                <Text>Không có dữ liệu</Text>
            ),
        },
        {
            title: "Kỹ năng phổ biến của ứng viên",
            content: paginatedSkills.length > 0 ? (
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Kỹ năng</DataTable.Title>
                        <DataTable.Title numeric>Số lượng</DataTable.Title>
                    </DataTable.Header>
                    {paginatedSkills.map((item, index) => (
                        <DataTable.Row key={index}>
                            <DataTable.Cell>{item.skill}</DataTable.Cell>
                            <DataTable.Cell numeric>{item.count}</DataTable.Cell>
                        </DataTable.Row>
                    ))}
                    <DataTable.Pagination
                        page={pageSkills}
                        numberOfPages={Math.ceil(skillsData.length / itemsPerPageSkills)}
                        onPageChange={(newPage) => setPageSkills(newPage)}
                        label={`${pageSkills * itemsPerPageSkills + 1}-${Math.min((pageSkills + 1) * itemsPerPageSkills, skillsData.length)} of ${mockCandidateSkills.length}`}
                    />
                </DataTable>
            ) : (
                <Text>Không có dữ liệu</Text>
            ),
        },
        {
            title: "Mức lương kỳ vọng của ứng viên",
            content: salaryChartData.length > 0 ? (
                <PieChart
                    data={salaryChartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute={false}
                />
            ) : (
                <Text>Không có dữ liệu</Text>
            ),
        },
    ];

    return (
        <View style={StyleShare.container}>
            <UIHeader
                leftIcon={"arrow-back"}
                handleLeftIcon={() => navigation.goBack()}
                title={"Thống kê tuyển dụng"}
            />

            {/* Nội dung chính */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={orange} />
                </View>
            ) : (
                <FlatList
                    data={sections}
                    renderItem={renderSection}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={styles.content}
                />
            )}
        </View>
    );
}

const getColorForSalary = (title) => {
    switch (title) {
        case 'Dưới 5 triệu': return '#FF6347';
        case '10 - 15 triệu': return '#FFD700';
        case '15 - 20 triệu': return '#00FF00';
        case '20 - 25 triệu': return '#1E90FF';
        case '30 - 50 triệu': return '#9400D3';
        case 'Trên 50 triệu': return '#FF00FF';
        case 'Thỏa thuận': return '#808080';
        default: return '#000000';
    }
};

const getColorForStatus = (status) => {
    switch (status) {
        case 'Chờ xử lý': return mainColor;
        case 'Đã xem': return '#00BFFF';
        case 'Chấp nhận': return '#00FF00';
        case 'Từ chối': return '#FF0000';
        default: return '#000000';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    applyButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: mainColor,
        borderRadius: 5,
    },
    content: {
        padding: 10,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});