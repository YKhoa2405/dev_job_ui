import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

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

// Component bảo vệ route
const ProtectedRoute = ({ children, permissionId }: { children: JSX.Element, permissionId?: string }) => {
  const user = useSelector((state: RootState) => state.user);
  const permissions = user?.role?.permissions || [];
  const hasPermission = permissionId ? permissions.includes(permissionId) : true;

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Không có quyền truy cập
  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
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
        {/* Route mặc định */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Route không cần quyền */}
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
        {/* Trang 403 */}
        <Route
          path="/403"
          element={
            <>
              <PageTitle title="Không có quyền" />
              <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">403 - Bạn không có quyền truy cập trang này</h1>
              </div>
            </>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>
                <PageTitle title="Bảng điều khiển" />
                <Dashboard />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute permissionId="683bcd19b0844882a0ba039c">
              <>
                <PageTitle title="Người dùng" />
                <Users />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute permissionId="683bc704789be1bf151451b4">
              <>
                <PageTitle title="Ứng viên tìm việc" />
                <Candidates />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates/:id/detail"
          element={
            <ProtectedRoute permissionId="683bc712789be1bf151451b7">
              <>
                <PageTitle title="Chi tiết ứng viên" />
                <CandidatesDetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates/:id/edit"
          element={
            <ProtectedRoute permissionId="683bc727789be1bf151451ba">
              <>
                <PageTitle title="Chỉnh sửa ứng viên" />
                <CandidatesEdit />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates/create"
          element={
            <ProtectedRoute permissionId="683bc73b789be1bf151451bd">
              <>
                <PageTitle title="Thêm mới ứng viên" />
                <CreateCandidate />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute permissionId="683bc4f6789be1bf15145160">
              <>
                <PageTitle title="Công ty" />
                <Companies />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/create"
          element={
            <ProtectedRoute permissionId="683bc4a8789be1bf1514515d">
              <>
                <PageTitle title="Thêm mới công ty" />
                <CreateCompany />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/:id/edit"
          element={
            <ProtectedRoute permissionId="683bc550789be1bf1514516a">
              <>
                <PageTitle title="Chỉnh sửa công ty" />
                <EditCompanies />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/:id/detail"
          element={
            <ProtectedRoute permissionId="683bc521789be1bf15145163">
              <>
                <PageTitle title="Chi tiết công ty" />
                <CompanyDetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute permissionId="683bc650789be1bf1514517f">
              <>
                <PageTitle title="Tin tuyển dụng" />
                <Jobs />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/create"
          element={
            <ProtectedRoute permissionId="683bc5f3789be1bf15145176">
              <>
                <PageTitle title="Thêm tin tuyển dụng" />
                <CreateJobs />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs/:id"
          element={
            <ProtectedRoute permissionId="683bc610789be1bf15145179">
              <>
                <PageTitle title="Chi tiết tin tuyển dụng" />
                <EditJobs />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resumes"
          element={
            <ProtectedRoute permissionId="683bc7bb789be1bf151451d7">
              <>
                <PageTitle title="Ứng tuyển" />
                <Resumes />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute permissionId="683bc8a4789be1bf151451fe">
              <>
                <PageTitle title="Dịch vụ" />
                <Services />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/create"
          element={
            <ProtectedRoute permissionId="683bc898789be1bf151451fb">
              <>
                <PageTitle title="Thêm mới dịch vụ" />
                <CreateService />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute permissionId="683bc97b789be1bf1514521b">
              <>
                <PageTitle title="Đơn hàng" />
                <Orders />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/summary"
          element={
            <ProtectedRoute permissionId="683bc9a9789be1bf1514521e">
              <>
                <PageTitle title="Doanh thu" />
                <OrderSummary />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/summary/:companyId/transactions"
          element={
            <ProtectedRoute permissionId="683bcac0b0844882a0ba037e">
              <>
                <PageTitle title="Lịch sử giao dịch" />
                <OrderTransactions />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <ProtectedRoute permissionId="683bc845789be1bf151451ec">
              <>
                <PageTitle title="Kĩ năng" />
                <Skills />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/permissions"
          element={
            <ProtectedRoute permissionId="683bcb12b0844882a0ba0386">
              <>
                <PageTitle title="Quyền hạn" />
                <Permissions />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute permissionId="683bcb7db0844882a0ba038f">
              <>
                <PageTitle title="Vai trò" />
                <Roles />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;