import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import DefaultLayout from './layout/DefaultLayout';


import Roles from './pages/Roles';
import CreateJobs from './pages/Jobs/CreateJobs';
import Jobs from './pages/Jobs/Jobs';
import Companies from './pages/Companies/Companies';
import CreateCompany from './pages/Companies/CreateCompany';
import Services from './pages/Services/Services';
import CreateService from './pages/Services/CreateService';
import Users from './pages/Users/Users';
import Login from './pages/Auth/Login';
import Resumes from './pages/Resumes/Resumes';
import Permission from './pages/Permissions/Permission';
import Register from './pages/Auth/Register';
import Skills from './pages/Skills/Skills';
import Dashboard from './pages/Dashboard/Dashboard';
import EditCompanies from './pages/Companies/EditCompanies';
import EditJobs from './pages/Jobs/EditJobs';
import CompanyDetail from './pages/Companies/CompanyDetail';



function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // return loading ? (
  //   <Loader />
  // ) : (
  // );

  return (

    <DefaultLayout>

      <Routes>
        <Route
          path="/dashboard"
          element={<>
            <PageTitle title="Bảng điều khiển" />
            <Dashboard /></>
          } />

        <Route
          path="/auth/login"
          element={<>
            <PageTitle title="Đăng nhập tài khoản" />
            <Login /></>
          } />

        <Route
          path="/auth/register"
          element={<>
            <PageTitle title="Đăng ký tài khoản" />
            <Register /></>
          } />
        {/* USer */}
        <Route
          path="/admin/users"
          element={<>
            <PageTitle title="Người dùng" />
            <Users /></>} />

        {/* Companies */}
        <Route
          path="/admin/companies"
          element={<>
            <PageTitle title="Công ty" />
            <Companies /></>} />

        <Route
          path="/admin/companies/create"
          element={<>
            <PageTitle title="Thêm mới công ty" />
            <CreateCompany /></>} />

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
          element={<>
            <PageTitle title="Tin tuyển dụng" />
            <Jobs /></>} />

        <Route
          path="/admin/jobs/create"
          element={<>
            <PageTitle title="Thêm tin tuyển dụng" />
            <CreateJobs /></>} />

        <Route
          path="/admin/jobs/:id"
          element={
            <>
              <PageTitle title="Chi tiết tin tuyển dụng" />
              <EditJobs /> </>} />

        {/* resume */}
        <Route
          path="/admin/resumes"
          element={<>
            <PageTitle title="Ứng tuyển" />
            <Resumes /></>} />

        {/* service */}
        <Route
          path="/admin/services"
          element={<>
            <PageTitle title="Dịch vụ" />
            <Services /></>} />

        <Route
          path="/admin/services/create"
          element={<>
            <PageTitle title="Thêm mới dịch vụ" />
            <CreateService /></>} />

        {/* Skill */}
        <Route
          path="/admin/skills"
          element={<>
            <PageTitle title="Kĩ năng" />
            <Skills /></>} />

        {/* role */}
        <Route
          path="/admin/roles"
          element={<>
            <PageTitle title="Vai trò" />
            <Roles /></>} />

        {/* permistion */}
        <Route
          path="/admin/permission"
          element={<>
            <PageTitle title="Quyền hạn" />
            <Permission /></>} />

      </Routes>
    </DefaultLayout>
  )
}

export default App;
