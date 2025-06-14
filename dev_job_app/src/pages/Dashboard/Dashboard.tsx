import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { authApi, endpoints } from '../../common/API';
import Loading from '../../common/Loader/Loading';

// Định nghĩa interface
interface OverviewData {
  candidates: { total: number; new: number };
  Companies: { total: number; new: number; pending: number };
  jobPostings: { total: number; new: number };
  revenue: { total: string; new: string };
}

interface AnalyticsData {
  userGrowth: { labels: string[]; candidates: number[]; companies: number[] };
  jobStats: { labels: string[]; posted: number[]; applied: number[] };
  revenueTrend: { labels: string[]; data: number[] };
  popularSkills: { skill: string; popularity: number }[];
  applicationStatus: { status: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const timeRanges = [
    { value: '24h', label: '24 giờ' },
    { value: '7d', label: '7 ngày' },
    { value: '30d', label: '30 ngày' },
  ];

  // Fetch Overview Data
  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoadingOverview(true);
      try {
        const token = localStorage.getItem('access_token');
        console.log(localStorage.getItem('user'))
        if (!token) throw new Error('No token found');
        const overviewRes = await authApi(token).get(`${endpoints['overViewAdmin']}?timeRange=${selectedTimeRange}`);
        if (overviewRes.data.statusCode === 200) {
          setOverviewData(overviewRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoadingOverview(false);
      }
    };
    fetchOverviewData();
  }, [selectedTimeRange]);

  // Fetch Analytics Data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoadingAnalytics(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No token found');

        const analyticsRes = await authApi(token).get(`${endpoints['analyticsAdmin']}?year=${selectedYear}`);
        if (analyticsRes.data.statusCode === 200) {
          setAnalyticsData(analyticsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalyticsData();
  }, [selectedYear]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeRange(event.target.value);
  };

  // Chart Options and Series
  // Tăng trưởng người dùng
  const userGrowthOptions: ApexOptions = {
    chart: { id: 'user-growth', type: 'line', height: 350 },
    xaxis: { categories: analyticsData?.userGrowth.labels || [] },
    colors: ['#4caf50', '#2196f3'],
    stroke: { curve: 'smooth' },
    title: { text: 'Tăng trưởng người dùng', align: 'left' },
    legend: { position: 'top' },
    tooltip: { enabled: true },
  };

  const userGrowthSeries: ApexAxisChartSeries = [
    { name: 'Ứng viên mới', data: analyticsData?.userGrowth.candidates || [] },
    { name: 'Nhà tuyển dụng mới', data: analyticsData?.userGrowth.companies || [] },
  ];

  // Tin tuyển dụng
  const jobStatsOptions: ApexOptions = {
    chart: { id: 'job-stats', type: 'bar', height: 350 },
    xaxis: { categories: analyticsData?.jobStats.labels || [] },
    colors: ['#ff9800', '#4caf50'],
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    title: { text: 'Thống kê tin tuyển dụng', align: 'left' },
    legend: { position: 'top' },
    tooltip: { enabled: true },
  };

  const jobStatsSeries: ApexAxisChartSeries = [
    { name: 'Tin đăng tải', data: analyticsData?.jobStats.posted || [] },
    { name: 'Tin được ứng tuyển', data: analyticsData?.jobStats.applied || [] },
  ];

  // doanh thu
  const revenueOptions: ApexOptions = {
    chart: { id: 'revenue-trend', type: 'line', height: 350 },
    xaxis: { categories: analyticsData?.revenueTrend.labels || [] },
    colors: ['#9c27b0'],
    stroke: { curve: 'smooth' },
    title: { text: 'Xu hướng doanh thu (triệu VNĐ)', align: 'left' },
    legend: { position: 'top' },
    tooltip: { enabled: true },
  };

  const revenueSeries: ApexAxisChartSeries = [
    { name: 'Doanh thu', data: analyticsData?.revenueTrend.data || [] },
  ];

  // Mức độ phổ biến của skill
  const popularSkillsOptions: ApexOptions = {
    chart: { id: 'popular-skills', type: 'bar', height: 350 },
    xaxis: { categories: analyticsData?.popularSkills.map(s => s.skill) || [] },
    colors: ['#00bcd4'],
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    title: { text: 'Kỹ năng phổ biến', align: 'left' },
    tooltip: { enabled: true },
  };

  const popularSkillsSeries: ApexAxisChartSeries = [
    { name: 'Độ phổ biến', data: analyticsData?.popularSkills.map(s => s.popularity) || [] },
  ];

  // trạng thái đơn ứng tuyển 
  const applicationStatusOptions: ApexOptions = {
    chart: { id: 'application-status', type: 'pie', height: 350 },
    labels: analyticsData?.applicationStatus.map(s => s.status) || [],
    colors: ['#ff9800', '#2196f3', '#4caf50', '#f44336'],
    title: { text: 'Trạng thái đơn ứng tuyển', align: 'left' },
    legend: { position: 'top' },
    tooltip: { enabled: true },
  };

  const applicationStatusSeries: number[] = analyticsData?.applicationStatus.map(s => s.count) || [];

  if (!analyticsData || !overviewData) {
    return <Loading />;
  }

  return (
    <>
      {/* <div className="rounded-xl border border-stroke bg-white shadow-xl dark:border-strokedark dark:bg-boxdark px-8 py-8 mb-10 transition-all hover:shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 pb-3 border-blue-100 dark:border-blue-900">
            Tác vụ
          </h4>
        </div>
        <Link
          to="/admin/notifications"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-all duration-200"
        >
        Quản lý thông báo
        </Link>
      </div> */}

      {/* Tổng quan hệ thống */}
      <div className="rounded-xl border border-stroke bg-white shadow-xl dark:border-strokedark dark:bg-boxdark px-8 py-8 mb-10 transition-all hover:shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 pb-3 border-blue-100 dark:border-blue-900">
            Tổng quan hệ thống
          </h4>
          <select
            value={selectedTimeRange}
            onChange={handleTimeRangeChange}
            className="border border-gray-300 rounded-md p-2 dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        {loadingOverview || !overviewData ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-stroke rounded-xl p-6 dark:border-strokedark bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">Ứng viên</p>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-3">
                {overviewData.candidates.total.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Mới: <span className="font-semibold text-green-600 dark:text-green-500">+{overviewData.candidates.new}</span>
              </p>
            </div>

            <div className="border border-stroke rounded-xl p-6 dark:border-strokedark bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">Nhà tuyển dụng</p>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-3">
                {overviewData.Companies.total.toLocaleString()}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                <p>
                  Mới: <span className="font-semibold text-green-600 dark:text-green-500">+{overviewData.Companies.new}</span>
                </p>
                <p>
                  Chờ duyệt: <span className="font-semibold text-yellow-600 dark:text-yellow-500">{overviewData.Companies.pending}</span>
                </p>
              </div>
            </div>

            <div className="border border-stroke rounded-xl p-6 dark:border-strokedark bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">Tin tuyển dụng</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-3">
                {overviewData.jobPostings.total.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Mới: <span className="font-semibold text-green-600 dark:text-green-500">+{overviewData.jobPostings.new}</span>
              </p>
            </div>

            <div className="border border-stroke rounded-xl p-6 dark:border-strokedark bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">Doanh thu</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-3">
                {overviewData.revenue.total}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Tăng: <span className="font-semibold text-green-600 dark:text-green-500">{overviewData.revenue.new}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Báo cáo thống kê */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-5 pt-6 pb-2.5 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 pb-3 border-blue-100 dark:border-blue-900">
            Báo cáo thống kê
          </h4>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="border border-gray-300 rounded-md p-2 dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {loadingAnalytics || !analyticsData ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-stroke rounded-md p-4 dark:border-strokedark">
              <Chart options={userGrowthOptions} series={userGrowthSeries} type="line" height={350} />
            </div>
            <div className="border border-stroke rounded-md p-4 dark:border-strokedark">
              <Chart options={jobStatsOptions} series={jobStatsSeries} type="bar" height={350} />
            </div>
            <div className="border border-stroke rounded-md p-4 dark:border-strokedark lg:col-span-2">
              <Chart options={revenueOptions} series={revenueSeries} type="line" height={350} />
            </div>

            <div className="border border-stroke rounded-md p-4 dark:border-strokedark">
              <Chart options={popularSkillsOptions} series={popularSkillsSeries} type="bar" height={350} />
            </div>
            <div className="border border-stroke rounded-md p-4 dark:border-strokedark">
              <Chart options={applicationStatusOptions} series={applicationStatusSeries} type="pie" height={350} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;