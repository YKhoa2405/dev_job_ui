import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'; // Thêm Navigate

import PageTitle from './components/PageTitle';
import DefaultLayout from './layout/DefaultLayout';

import Roles from './pages/Roles/Roles';
import CreateJobs from './pages/Jobs/CreateJobs';
import Jobs from './pages/Jobs/Jobs';
import Companies from './pages/Companies/Companies';
import CreateCompany from './pages/Companies/CreateCompany';
import Services from './pages/Services/Services';
import CreateService from './pages/Services/CreateService';
import Users from './pages/Users/Users';
import Login from './pages/Auth/Login';
import Resumes from './pages/Resumes/Resumes';
import Register from './pages/Auth/Register';
import Skills from './pages/Skills/Skills';
import Dashboard from './pages/Dashboard/Dashboard';
import EditCompanies from './pages/Companies/EditCompanies';
import EditJobs from './pages/Jobs/EditJobs';
import CompanyDetail from './pages/Companies/CompanyDetail';
import Candidates from './pages/Candidates/Candidats';
import CandidatesDetail from './pages/Candidates/CandidatesDetail';
import CandidatesEdit from './pages/Candidates/CandidatesEdit';
import Orders from './pages/Orders/Order';
import Loader from './common/Loader';

import CreateCandidate from './pages/Candidates/CreateCandidate';
import OrderSummary from './pages/Orders/OrderSummary';
import OrderTransactions from './pages/Orders/OrderTransactions';
import Permissions from './pages/Roles/Permission';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Bảng điều khiển" />
              <Dashboard />
            </>
          }
        />

        <Route
          path="/auth/login"
          element={
            <>
              <PageTitle title="Đăng nhập tài khoản" />
              <Login />
            </>
          }
        />

        <Route
          path="/auth/register"
          element={
            <>
              <PageTitle title="Đăng ký tài khoản" />
              <Register />
            </>
          }
        />

        {/* USer */}
        <Route
          path="/admin/users"
          element={
            <>
              <PageTitle title="Người dùng" />
              <Users />
            </>
          }
        />

        {/* Candidates */}
        <Route
          path="/admin/candidates"
          element={
            <>
              <PageTitle title="Ứng viên tìm việc" />
              <Candidates />
            </>
          }
        />
        <Route
          path="/admin/candidates/:id/detail"
          element={
            <>
              <PageTitle title="Chi tiết ứng viên" />
              <CandidatesDetail />
            </>
          }
        />
        <Route
          path="/admin/candidates/:id/edit"
          element={
            <>
              <PageTitle title="Chỉnh sửa ứng viên" />
              <CandidatesEdit />
            </>
          }
        />

        <Route
          path="/admin/candidates/create"
          element={
            <>
              <PageTitle title="Thêm mới ứng viên" />
              <CreateCandidate />
            </>
          }
        />

        {/* Companies */}
        <Route
          path="/admin/companies"
          element={
            <>
              <PageTitle title="Công ty" />
              <Companies />
            </>
          }
        />

        <Route
          path="/admin/companies/create"
          element={
            <>
              <PageTitle title="Thêm mới công ty" />
              <CreateCompany />
            </>
          }
        />

        <Route
          path="/admin/companies/:id/edit"
          element={
            <>
              <PageTitle title="Chỉnh sửa công ty" />
              <EditCompanies />
            </>
          }
        />

        <Route
          path="/admin/companies/:id/detail"
          element={
            <>
              <PageTitle title="Chi tiết công ty" />
              <CompanyDetail />
            </>
          }
        />

        {/* Jobs */}
        <Route
          path="/admin/jobs"
          element={
            <>
              <PageTitle title="Tin tuyển dụng" />
              <Jobs />
            </>
          }
        />

        <Route
          path="/admin/jobs/create"
          element={
            <>
              <PageTitle title="Thêm tin tuyển dụng" />
              <CreateJobs />
            </>
          }
        />

        <Route
          path="/admin/jobs/:id"
          element={
            <>
              <PageTitle title="Chi tiết tin tuyển dụng" />
              <EditJobs />
            </>
          }
        />

        {/* Resume */}
        <Route
          path="/admin/resumes"
          element={
            <>
              <PageTitle title="Ứng tuyển" />
              <Resumes />
            </>
          }
        />

        {/* Service */}
        <Route
          path="/admin/services"
          element={
            <>
              <PageTitle title="Dịch vụ" />
              <Services />
            </>
          }
        />

        <Route
          path="/admin/services/create"
          element={
            <>
              <PageTitle title="Thêm mới dịch vụ" />
              <CreateService />
            </>
          }
        />

        {/* Order */}
        <Route
          path="/admin/orders"
          element={
            <>
              <PageTitle title="Đơn hàng" />
              <Orders />
            </>
          }
        />
        <Route
          path="/admin/summary"
          element={
            <>
              <PageTitle title="Doanh thu" />
              <OrderSummary />
            </>
          }
        />
        <Route
          path="/admin/summary/:companyId/transactions"
          element={
            <>
              <PageTitle title="Lịch sử giao dịch" />
              <OrderTransactions />
            </>
          }
        />

        {/* Skill */}
        <Route
          path="/admin/skills"
          element={
            <>
              <PageTitle title="Kĩ năng" />
              <Skills />
            </>
          }
        />
        {/* Permission */}
        <Route
          path="/admin/permissions"
          element={
            <>
              <PageTitle title="Quyền hạn" />
              <Permissions />
            </>
          }
        />
        {/* Role */}
        <Route
          path="/admin/roles"
          element={
            <>
              <PageTitle title="Vai trò" />
              <Roles />
            </>
          }
        />


      </Routes>
    </DefaultLayout>
  );
}

export default App;